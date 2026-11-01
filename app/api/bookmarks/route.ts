import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { statusId } = body

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID wajib diisi' }, { status: 400 })
    }

    // Check if status exists and is approved
    const status = await prisma.status.findUnique({
      where: { id: statusId },
      select: { id: true, status: true },
    })

    if (!status || status.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    const userId = session.user.id

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: { userId_statusId: { userId, statusId } },
    })

    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { userId_statusId: { userId, statusId } },
      })
      return NextResponse.json({ bookmarked: false })
    }

    // Add bookmark
    await prisma.bookmark.create({
      data: { userId, statusId },
    })

    return NextResponse.json({ bookmarked: true })
  } catch (error) {
    console.error('POST /api/bookmarks error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}