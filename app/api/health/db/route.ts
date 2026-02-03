import { NextResponse } from 'next/server'
import { prismaHealthCheck } from '@/lib/prisma-health-check'

export async function GET() {
  const ok = await prismaHealthCheck()

  return NextResponse.json(
    { database: ok ? 'up' : 'down' },
    { status: ok ? 200 : 503 }
  )
}
