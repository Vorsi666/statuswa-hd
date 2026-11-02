import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UploadForm } from './UploadForm'

export const metadata = {
  title: 'Upload Status',
  description: 'Upload video atau gambar status WhatsApp HD Anda ke StatusWA HD',
}

export default async function UploadPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect('/login?callbackUrl=/upload')
  }

  const categories = await prisma.category.findMany({
    where: { statuses: { some: { status: 'APPROVED' } } },
    select: { id: true, name: true, slug: true, color: true, icon: true },
    orderBy: { order: 'asc' },
  })

  const tags = await prisma.tag.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  return <UploadForm categories={categories} tags={tags} userId={session.user.id} />
}