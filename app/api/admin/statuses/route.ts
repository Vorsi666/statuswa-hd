import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moderateStatusSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
        { author: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [statuses, total] = await Promise.all([
      prisma.status.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true, slug: true, color: true, icon: true } },
          author: { select: { id: true, name: true, email: true, image: true } },
          tags: { select: { name: true, slug: true } },
          _count: { select: { bookmarks: true } },
        },
      }),
      prisma.status.count({ where }),
    ])

    return NextResponse.json({
      statuses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('GET /api/admin/statuses error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = moderateStatusSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    const { statusId, action, rejectionReason } = validated.data

    const status = await prisma.status.findUnique({ where: { id: statusId } })
    if (!status) {
      return NextResponse.json({ error: 'Status tidak ditemukan' }, { status: 404 })
    }

    const updatedStatus = await prisma.status.update({
      where: { id: statusId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        rejectionReason: action === 'reject' ? rejectionReason : null,
        publishedAt: action === 'approve' ? new Date() : null,
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
    console.error('PATCH /api/admin/statuses error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}