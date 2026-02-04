'use server'
import { Trade, Prisma, DashboardLayout } from '@/prisma/generated/prisma'
import { revalidatePath, updateTag } from 'next/cache'
import { Widget, Layouts } from '@/app/[locale]/dashboard/types/dashboard'
import { createClient, getUserId } from './auth'
import { startOfDay } from 'date-fns'
import { getSubscriptionDetails } from './subscription'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { defaultLayouts } from '@/lib/default-layouts'
import { formatTimestamp } from '@/lib/date-utils'
import { v5 as uuidv5 } from 'uuid'
import { Decimal } from '@prisma/client-runtime-utils'
import { logger } from '@/lib/logger'

type TradeError =
  | 'DUPLICATE_TRADES'
  | 'NO_TRADES_ADDED'
  | 'DATABASE_ERROR'
  | 'INVALID_DATA'

interface TradeResponse {
  error: TradeError | false
  numberOfTradesAdded: number
  details?: unknown
}

export type SerializedTrade = Omit<Trade, 'entryPrice' | 'closePrice' | 'pnl' | 'commission'> & {
  entryPrice: number
  closePrice: number
  pnl: number
  commission: number
  entryDate: string
  closeDate: string
}

export interface PaginatedTrades {
  trades: SerializedTrade[]
  metadata: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
}

interface SaveLayoutResult {
  success: boolean
  error?: string
}

const saveLocks = new Map<string, Promise<SaveLayoutResult>>()

function validateLayouts(layouts: DashboardLayout): boolean {
  if (!layouts || typeof layouts !== 'object') return false
  
  const validateArray = (arr: unknown): arr is Prisma.JsonArray => {
    if (!Array.isArray(arr)) return false
    return arr.every(item => 
      item && 
      typeof item === 'object' && 
      'i' in item && 
      'type' in item && 
      'x' in item && 
      'y' in item && 
      'w' in item && 
      'h' in item
    )
  }
  
  return validateArray(layouts.desktop) && validateArray(layouts.mobile)
}

function serializeTrade(trade: Trade): SerializedTrade {
  return {
    ...trade,
    entryPrice: trade.entryPrice,
    closePrice: trade.closePrice,
    pnl: trade.pnl,
    commission: trade.commission,
    entryDate: new Date(trade.entryDate).toISOString(),
    closeDate: new Date(trade.closeDate).toISOString(),
  }
}

export async function revalidateCache(tags: string[]) {
  logger.info(`[revalidateCache] Starting cache invalidation`, { tags })
  tags.forEach(tag => {
    try {
      updateTag(tag)
    } catch (error) {
      logger.error(`[revalidateCache] Error revalidating tag ${tag}`, { error })
    }
  })
}

const TRADE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

function generateTradeUUID(trade: Partial<Trade>): string {
  const tradeSignature = [
    trade.userId || '',
    trade.accountNumber || '',
    trade.instrument || '',
    trade.entryDate || '',
    trade.closeDate || '',
    trade.entryPrice?.toString() || '',
    trade.closePrice?.toString() || '',
    (trade.quantity || 0).toString(),
    trade.entryId || '',
    trade.closeId || '',
    (trade.timeInPosition || 0).toString(),
    trade.side || '',
    trade.pnl?.toString() || '',
    trade.commission?.toString() || '',
  ].join('|')

  return uuidv5(tradeSignature, TRADE_NAMESPACE)
}

export async function saveTradesAction(
  data: any[],
  options?: { userId?: string }
): Promise<TradeResponse> {
  const userId = options?.userId ?? await getUserId()
  logger.info(`[saveTrades] Saving trades`, { count: data.length, userId })

  if (!Array.isArray(data) || data.length === 0) {
    return { error: 'INVALID_DATA', numberOfTradesAdded: 0, details: 'No trades provided' }
  }

  try {
    const userAssignedTrades = data.map(trade => {
      return {
        ...trade,
        userId: userId,
        entryPrice: new Decimal(trade.entryPrice),
        closePrice: new Decimal(trade.closePrice),
        pnl: new Decimal(trade.pnl),
        commission: new Decimal(trade.commission || 0),
        id: generateTradeUUID({ ...trade, userId: userId }),
      }
    })

    const result = await prisma.trade.createMany({
      data: userAssignedTrades,
      skipDuplicates: true
    })

    if (result.count === 0) {
      logger.info('[saveTrades] No trades added. Duplicate check.')
      return {
        error: 'DUPLICATE_TRADES',
        numberOfTradesAdded: 0
      }
    }

    updateTag(`trades-${userId}`)
    return { error: false, numberOfTradesAdded: result.count }
  } catch (error) {
    logger.error('[saveTrades] Database error', { error })
    return {
      error: 'DATABASE_ERROR',
      numberOfTradesAdded: 0,
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getTradesAction(
  userId: string | null = null,
  page: number = 1,
  pageSize: number = 50,
  forceRefresh: boolean = false
): Promise<PaginatedTrades> {
  const currentUserId = userId || await getUserId()
  if (!currentUserId) throw new Error('User not found')

  const subscriptionDetails = await getSubscriptionDetails()
  const isSubscribed = subscriptionDetails?.isActive || false

  const tag = `trades-${currentUserId}`

  if (forceRefresh) {
    updateTag(tag)
  }

  const where: Prisma.TradeWhereInput = { userId: currentUserId }

  if (!isSubscribed) {
    const twoWeeksAgo = startOfDay(new Date())
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    where.entryDate = { gte: twoWeeksAgo.toISOString() }
  }

  try {
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { entryDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.trade.count({ where })
    ])

    const totalPages = Math.ceil(total / pageSize)

    return {
      trades: trades.map(serializeTrade),
      metadata: {
        total,
        page,
        totalPages,
        hasMore: page < totalPages
      }
    }
  } catch (error) {
    logger.error('getTradesAction failed', { error })
    throw error
  }
}

export async function updateTradesAction(tradesIds: string[], update: Partial<Trade> & {
  entryDateOffset?: number
  closeDateOffset?: number
  instrumentTrim?: { fromStart: number; fromEnd: number }
  instrumentPrefix?: string
  instrumentSuffix?: string
}): Promise<number> {
  const userId = await getUserId()
  if (!userId) return 0

  try {
    if (update.entryDateOffset || update.closeDateOffset || update.instrumentTrim || update.instrumentPrefix || update.instrumentSuffix) {
      const trades = await prisma.trade.findMany({
        where: { id: { in: tradesIds }, userId },
        select: { id: true, entryDate: true, closeDate: true, instrument: true }
      })

      await Promise.all(trades.map(async (trade) => {
        const data: any = {}

        if (update.entryDateOffset) {
          const d = new Date(trade.entryDate)
          d.setHours(d.getHours() + update.entryDateOffset)
          data.entryDate = formatTimestamp(d.toISOString())
        }
        if (update.closeDateOffset && trade.closeDate) {
          const d = new Date(trade.closeDate)
          d.setHours(d.getHours() + update.closeDateOffset)
          data.closeDate = formatTimestamp(d.toISOString())
        }

        let newInst = trade.instrument
        if (update.instrumentTrim) {
          newInst = newInst.substring(update.instrumentTrim.fromStart, newInst.length - update.instrumentTrim.fromEnd)
        }
        if (update.instrumentPrefix) newInst = update.instrumentPrefix + newInst
        if (update.instrumentSuffix) newInst = newInst + update.instrumentSuffix

        if (newInst !== trade.instrument) data.instrument = newInst

        if (Object.keys(data).length > 0) {
          await prisma.trade.update({ where: { id: trade.id }, data })
        }
      }))
    }

    const {
      entryDateOffset, closeDateOffset, instrumentTrim, instrumentPrefix, instrumentSuffix,
      ...standardUpdates
    } = update

    if (Object.keys(standardUpdates).length > 0) {
      await prisma.trade.updateMany({
        where: { id: { in: tradesIds }, userId },
        data: standardUpdates,
      })
    }

    updateTag(`trades-${userId}`)
    return tradesIds.length
  } catch (error) {
    logger.error('[updateTrades] Error', { error })
    return 0
  }
}

export async function updateTradeCommentAction(tradeId: string, comment: string | null) {
  try {
    await prisma.trade.update({
      where: { id: tradeId },
      data: { comment }
    })
    revalidatePath('/')
  } catch (error) {
    logger.error("[updateTradeComment] Error", { error })
    throw error
  }
}

export async function updateTradeVideoUrlAction(tradeId: string, videoUrl: string | null) {
  try {
    await prisma.trade.update({
      where: { id: tradeId },
      data: { videoUrl }
    })
    revalidatePath('/')
  } catch (error) {
    logger.error("[updateTradeVideoUrl] Error", { error })
    throw error
  }
}

export async function loadDashboardLayoutAction(): Promise<Layouts | null> {
  const userId = await getUserId()
  console.log('[loadDashboardLayoutAction] Loading layout for userId:', userId)
  
  try {
    const dashboard = await prisma.dashboardLayout.findUnique({
      where: { userId },
    })

    if (!dashboard) {
      console.log('[loadDashboardLayoutAction] No layout found for userId:', userId)
      return null
    }

    console.log('[loadDashboardLayoutAction] Layout found:', {
      userId,
      desktopWidgets: Array.isArray(dashboard.desktop) ? dashboard.desktop.length : 0,
      mobileWidgets: Array.isArray(dashboard.mobile) ? dashboard.mobile.length : 0,
      updatedAt: dashboard.updatedAt
    })

    const parse = (json: any): Widget[] => {
      if (Array.isArray(json)) return json as unknown as Widget[]
      return []
    }

    return {
      desktop: parse(dashboard.desktop),
      mobile: parse(dashboard.mobile)
    }
  } catch (error) {
    console.error('[loadDashboardLayoutAction] Error loading layout:', error)
    logger.error('[loadDashboardLayout] Error', { error })
    return null
  }
}

export async function saveDashboardLayoutAction(layouts: DashboardLayout): Promise<SaveLayoutResult> {
  const userId = await getUserId()
  
  console.log('[saveDashboardLayoutAction] Starting save for userId:', userId)
  
  if (!userId) {
    console.error('[saveDashboardLayoutAction] No userId found')
    return { success: false, error: 'User not authenticated' }
  }
  
  if (!layouts) {
    console.error('[saveDashboardLayoutAction] No layouts provided')
    return { success: false, error: 'Layouts data is required' }
  }
  
  console.log('[saveDashboardLayoutAction] Layout data:', {
    desktopWidgets: layouts.desktop?.length || 0,
    mobileWidgets: layouts.mobile?.length || 0
  })
  
  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayout] Validation failed', { userId })
    console.error('[saveDashboardLayoutAction] Validation failed for userId:', userId)
    return { success: false, error: 'Invalid layout structure' }
  }

  const lockKey = `layout:${userId}`
  
  if (saveLocks.has(lockKey)) {
    logger.info('[saveDashboardLayout] Debouncing concurrent save', { userId })
    console.log('[saveDashboardLayoutAction] Debouncing concurrent save for userId:', userId)
    return { success: true }
  }

  const savePromise = (async (): Promise<SaveLayoutResult> => {
    try {
      console.log('[saveDashboardLayoutAction] Executing database upsert for userId:', userId)
      await prisma.$transaction(async (tx) => {
        await tx.dashboardLayout.upsert({
          where: { userId },
          update: {
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray,
            updatedAt: new Date()
          },
          create: {
            userId,
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray
          },
        })
      })

      updateTag(`dashboard-${userId}`)
      revalidatePath('/')
      
      console.log('[saveDashboardLayoutAction] Successfully saved for userId:', userId)
      logger.info('[saveDashboardLayout] Success', { userId })
      return { success: true }
    } catch (error) {
      logger.error('[saveDashboardLayout] Error', { error, userId })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      }
    }
  })()

  saveLocks.set(lockKey, savePromise)
  
  try {
    const result = await savePromise
    return result
  } finally {
    saveLocks.delete(lockKey)
  }
}

export async function createDefaultDashboardLayout(userId: string): Promise<void> {
  try {
    const existing = await prisma.dashboardLayout.findUnique({ where: { userId } })
    if (existing) return

    await prisma.dashboardLayout.create({
      data: {
        userId,
        desktop: defaultLayouts.desktop as unknown as Prisma.JsonArray,
        mobile: defaultLayouts.mobile as unknown as Prisma.JsonArray
      }
    })
  } catch (error) {
    logger.warn('[createDefaultDashboardLayout] Failed (likely exists)', { error })
  }
}

export async function createLayoutVersionAction(
  layoutId: string,
  versionData: {
    desktop: unknown
    mobile: unknown
    version: number
    checksum: string
    description?: string
    deviceId: string
    changeType: string
  }
): Promise<void> {
  try {
    await prisma.layoutVersion.create({
      data: {
        layoutId,
        desktop: versionData.desktop as Prisma.JsonArray,
        mobile: versionData.mobile as Prisma.JsonArray,
        version: versionData.version,
        checksum: versionData.checksum,
        description: versionData.description,
        deviceId: versionData.deviceId,
        changeType: versionData.changeType
      }
    })

    await prisma.dashboardLayout.update({
      where: { id: layoutId },
      data: {
        version: versionData.version,
        checksum: versionData.checksum,
        deviceId: versionData.deviceId
      }
    })

    logger.info('[createLayoutVersion] Success', { layoutId, version: versionData.version })
  } catch (error) {
    logger.error('[createLayoutVersion] Error', { error, layoutId })
    throw error
  }
}

export async function getLayoutVersionHistoryAction(
  layoutId: string,
  limit = 20
): Promise<Array<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
}>> {
  try {
    const versions = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      take: limit
    })

    return versions.map(v => ({
      id: v.id,
      version: v.version,
      desktop: v.desktop,
      mobile: v.mobile,
      checksum: v.checksum,
      description: v.description ?? undefined,
      deviceId: v.deviceId,
      changeType: v.changeType,
      createdAt: v.createdAt
    }))
  } catch (error) {
    logger.error('[getLayoutVersionHistory] Error', { error, layoutId })
    return []
  }
}

export async function getLayoutVersionByNumberAction(
  layoutId: string,
  versionNumber: number
): Promise<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
} | null> {
  try {
    const version = await prisma.layoutVersion.findUnique({
      where: {
        id: await prisma.layoutVersion.findFirst({
          where: { layoutId, version: versionNumber },
          select: { id: true }
        }).then(v => v?.id)
      }
    })

    if (!version) return null

    return {
      id: version.id,
      version: version.version,
      desktop: version.desktop,
      mobile: version.mobile,
      checksum: version.checksum,
      description: version.description ?? undefined,
      deviceId: version.deviceId,
      changeType: version.changeType,
      createdAt: version.createdAt
    }
  } catch (error) {
    logger.error('[getLayoutVersionByNumber] Error', { error, layoutId, versionNumber })
    return null
  }
}

export async function cleanupOldLayoutVersionsAction(
  layoutId: string,
  keepCount = 50
): Promise<void> {
  try {
    const totalCount = await prisma.layoutVersion.count({ where: { layoutId } })
    
    if (totalCount <= keepCount) return

    const versionsToDelete = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      skip: keepCount,
      select: { id: true }
    })

    if (versionsToDelete.length === 0) return

    await prisma.layoutVersion.deleteMany({
      where: {
        id: { in: versionsToDelete.map(v => v.id) }
      }
    })

    logger.info('[cleanupOldLayoutVersions] Success', { 
      layoutId, 
      deletedCount: versionsToDelete.length 
    })
  } catch (error) {
    logger.error('[cleanupOldLayoutVersions] Error', { error, layoutId })
  }
}

export async function saveDashboardLayoutWithVersionAction(
  layouts: DashboardLayout,
  versionData: {
    description?: string
    changeType: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
    deviceId: string
  }
): Promise<SaveLayoutResult> {
  const userId = await getUserId()
  
  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }
  
  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }
  
  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayoutWithVersion] Validation failed', { userId })
    return { success: false, error: 'Invalid layout structure' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.dashboardLayout.findUnique({
        where: { userId },
        select: { id: true, version: true, checksum: true }
      })

      const newVersion = (existing?.version ?? 0) + 1
      
      const crypto = await import('crypto')
      const checksum = crypto.createHash('sha256')
        .update(JSON.stringify({ desktop: layouts.desktop, mobile: layouts.mobile }))
        .digest('hex')

      await tx.dashboardLayout.upsert({
        where: { userId },
        update: {
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId,
          updatedAt: new Date()
        },
        create: {
          userId,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId
        },
      })

      await tx.layoutVersion.create({
        data: {
          layoutId: existing?.id || userId,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          description: versionData.description,
          deviceId: versionData.deviceId,
          changeType: versionData.changeType
        }
      })
    })

    updateTag(`dashboard-${userId}`)
    revalidatePath('/')
    
    logger.info('[saveDashboardLayoutWithVersion] Success', { userId })
    return { success: true }
  } catch (error) {
    logger.error('[saveDashboardLayoutWithVersion] Error', { error, userId })
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }
  }
}

export async function groupTradesAction(tradeIds: string[]): Promise<boolean> {
  try {
    const userId = await getUserId()
    const groupId = crypto.randomUUID()

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId }
    })

    revalidatePath('/')
    return true
  } catch (error) {
    logger.error('[groupTrades] Error', { error })
    return false
  }
}

export async function ungroupTradesAction(tradeIds: string[]): Promise<boolean> {
  try {
    const userId = await getUserId()
    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId: "" }
    })

    revalidatePath('/')
    return true
  } catch (error) {
    logger.error('[ungroupTrades] Error', { error })
    return false
  }
}