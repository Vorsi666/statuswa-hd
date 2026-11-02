import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardContent } from './DashboardContent'

export const metadata = {
  title: 'Dashboard',
  description: 'Kelola status yang Anda upload, lihat statistik, dan kelola bookmark',
}

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const userId = session.user.id

  const [uploads, stats, bookmarks] = await Promise.all([
    prisma.status.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true, color: true, icon: true } },
        tags: { select: { name: true, slug: true } },
        _count: { select: { bookmarks: true } },
      },
    }),
    prisma.status.aggregate({
      where: { authorId: userId, status: 'APPROVED' },
      _sum: { views: true, downloads: true },
      _count: true,
    }),
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        status: {
          include: {
            category: { select: { name: true, slug: true, color: true, icon: true } },
            author: { select: { name: true, image: true } },
            tags: { select: { name: true, slug: true } },
            _count: { select: { bookmarks: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const pendingCount = uploads.filter(u => u.status === 'PENDING').length
  const approvedCount = uploads.filter(u => u.status === 'APPROVED').length
  const rejectedCount = uploads.filter(u => u.status === 'REJECTED').length

  return (
    <DashboardContent
      user={session.user}
      uploads={uploads}
      stats={{
        totalUploads: uploads.length,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalViews: stats._sum.views || 0,
        totalDownloads: stats._sum.downloads || 0,
      }}
      bookmarks={bookmarks.map(b => b.status)}
    />
  )
}