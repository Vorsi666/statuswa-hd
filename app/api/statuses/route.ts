import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createStatusSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createStatusSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    const { title, description, categoryId, type, url, thumbnail, duration, size, resolution, tags } = validated.data

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    const userId = session.user.id

    // Generate slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    // Create status
    const status = await prisma.status.create({
      data: {
        slug,
        title,
        description,
        categoryId,
        type,
        url,
        thumbnail,
        duration,
        size,
        resolution,
        authorId: userId,
        status: 'PENDING',
        tags: tags?.length ? { connect: tags.map(id => ({ id })) } : undefined,
      },
      include: {
        category: { select: { name: true, slug: true, color: true, icon: true } },
        author: { select: { name: true, image: true } },
        tags: { select: { name: true, slug: true } },
        _count: { select: { bookmarks: true } },
      },
    })

    return NextResponse.json(status, { status: 201 })
  } catch (error) {
    console.error('POST /api/statuses error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}