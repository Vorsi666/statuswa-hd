import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createReportSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createReportSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    const { statusId, reason } = validated.data

    // Check if status exists
    const status = await prisma.status.findUnique({ where: { id: statusId } })
    if (!status) {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    // Check if user already reported this status
    const existing = await prisma.report.findFirst({
      where: { reporterId: session.user.id, statusId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Anda sudah melaporkan status ini' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        statusId,
        reporterId: session.user.id,
        reason,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('POST /api/reports error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}