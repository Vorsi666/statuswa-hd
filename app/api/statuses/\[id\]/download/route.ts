import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment downloads atomically
    await prisma.status.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/statuses/[id]/download error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}