import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { statuses: true } } },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}