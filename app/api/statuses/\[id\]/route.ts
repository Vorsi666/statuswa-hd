import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateStatusSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const status = await prisma.status.findUnique({
      where: { id },
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

    return NextResponse.json(status)
  } catch (error) {
    console.error('GET /api/statuses/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateStatusSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    // Check ownership or admin
    const status = await prisma.status.findUnique({ where: { id } })
    if (!status) {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    const isOwner = status.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, categoryId, type, url, thumbnail, duration, size, resolution, tags } = validated.data

    const updatedStatus = await prisma.status.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        type,
        url,
        thumbnail,
        duration,
        size,
        resolution,
        tags: tags ? { set: tags.map(id => ({ id })) } : undefined,
      },
      include: {
        category: { select: { name: true, slug: true, color: true, icon: true } },
        author: { select: { name: true, image: true } },
        tags: { select: { name: true, slug: true } },
        _count: { select: { bookmarks: true } },
      },
    })

    return NextResponse.json(updatedStatus)
  } catch (error) {
    console.error('PATCH /api/statuses/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership or admin
    const status = await prisma.status.findUnique({ where: { id } })
    if (!status) {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    const isOwner = status.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.status.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/statuses/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}