import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminPanel } from './AdminPanel'

export const metadata = {
  title: 'Admin Panel',
  description: 'Panel administrasi StatusWA HD',
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  // Get stats
  const [
    totalUsers,
    totalStatuses,
    pendingStatuses,
    totalDownloads,
    totalViews,
    recentReports,
    categories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.status.count({ where: { status: 'APPROVED' } }),
    prisma.status.count({ where: { status: 'PENDING' } }),
    prisma.status.aggregate({ where: { status: 'APPROVED' }, _sum: { downloads: true } }),
    prisma.status.aggregate({ where: { status: 'APPROVED' }, _sum: { views: true } }),
    prisma.report.findMany({
      where: { status: 'PENDING' },
      take: 5,
      include: {
        statusRef: { select: { id: true, title: true, thumbnail: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      include: { _count: { select: { statuses: true } } },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <AdminPanel
      stats={{
        totalUsers,
        totalStatuses,
        pendingStatuses,
        totalDownloads: totalDownloads._sum.downloads || 0,
        totalViews: totalViews._sum.views || 0,
      }}
      recentReports={recentReports}
      categories={categories}
    />
  )
}