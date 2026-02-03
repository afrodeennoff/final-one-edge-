import { prisma } from "@/lib/prisma"
import { getUserId } from "@/server/auth"
import { DASHBOARD_LAYOUT_VERSION } from "@/lib/dashboardLayoutVersion"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(null)
    }

    const rec = await prisma.dashboardLayout.findUnique({
      where: { userId }
    })

    if (!rec) return NextResponse.json(null)

    return NextResponse.json({
      layout: rec,
      version: rec.version ?? 1
    })
  } catch (error) {
    console.error("[API] Dashboard layout GET error:", error)
    return NextResponse.json(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { layout, version } = body

    await prisma.dashboardLayout.upsert({
      where: { userId },
      update: {
        desktop: layout.desktop,
        mobile: layout.mobile,
        version
      },
      create: {
        userId,
        desktop: layout.desktop,
        mobile: layout.mobile,
        version
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] Dashboard layout POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to save layout" }, { status: 500 })
  }
}
