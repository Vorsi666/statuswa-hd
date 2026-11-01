import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const status = await prisma.status.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true, color: true, icon: true } },
        author: { select: { id: true, name: true, image: true } },
        tags: { select: { id: true, name: true, slug: true } },
        _count: { select: { bookmarks: true } },
      },
    })

    if (!status) {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    // Only return approved statuses for public access
    if (status.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('GET /api/statuses/[slug] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}