import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validators'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    const { name, email, password } = validated.data

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify for credentials
      },
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}