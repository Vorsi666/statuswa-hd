import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCategorySchema, updateCategorySchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { statuses: true } } },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

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
    const validated = updateCategorySchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    // Check if slug is unique
    if (validated.data.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: validated.data.slug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 400 })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validated.data,
      include: { _count: { select: { statuses: true } } },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('PATCH /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if category has statuses
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { statuses: true } } },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}