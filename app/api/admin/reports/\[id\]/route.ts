import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'resolve' or 'dismiss'

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
    }

    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 })
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: action === 'resolve' ? 'RESOLVED' : 'DISMISSED',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('PATCH /api/admin/reports/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}