import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify cron secret (optional - for manual testing)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      deletedPendingUploads: 0,
      deletedOldReports: 0,
      deletedExpiredSessions: 0,
      updatedStats: 0,
    }

    // 1. Hapus status PENDING yang lebih dari 7 hari (tidak dimoderasi)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const deletedPending = await prisma.status.deleteMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: sevenDaysAgo },
      },
    })
    results.deletedPendingUploads = deletedPending.count

    // 2. Hapus laporan RESOLVED/DISMISSED yang lebih dari 30 hari
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const deletedReports = await prisma.report.deleteMany({
      where: {
        status: { in: ['RESOLVED', 'DISMISSED'] },
        reviewedAt: { lt: thirtyDaysAgo },
      },
    })
    results.deletedOldReports = deletedReports.count

    // 3. Hapus session expired (NextAuth handle tapi backup)
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expires: { lt: new Date() },
      },
    })
    results.deletedExpiredSessions = deletedSessions.count

    // 4. Update view/download counts dari cache (jika pakai Redis)
    // Skip - handle di API real-time

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Support POST untuk Vercel Cron
export async function POST(request: Request) {
  return GET(request)
}