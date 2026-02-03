import { prisma } from './prisma'

export async function prismaHealthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Prisma health check failed:', error)
    return false
  }
}
