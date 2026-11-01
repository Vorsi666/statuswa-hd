import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://statuswa-hd.com'

    // Get all approved statuses
    const statuses = await prisma.status.findMany({
      where: { status: 'APPROVED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 50000, // Sitemap limit
    })

    // Get all categories
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    })

    // Static pages
    const staticPages = [
      { url: baseUrl, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { url: `${baseUrl}/explore`, lastmod: new Date().toISOString(), changefreq: 'hourly', priority: 0.9 },
      { url: `${baseUrl}/categories`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/trending`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/login`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
      { url: `${baseUrl}/register`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
      { url: `${baseUrl}/upload`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.5 },
      { url: `${baseUrl}/dashboard`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.5 },
      { url: `${baseUrl}/bookmarks`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.5 },
    ]

    // Category pages
    const categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/explore?category=${cat.slug}`,
      lastmod: cat.updatedAt.toISOString(),
      changefreq: 'daily',
      priority: 0.7,
    }))

    // Status pages
    const statusPages = statuses.map((status) => ({
      url: `${baseUrl}/status/${status.slug}`,
      lastmod: status.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    }))

    const allUrls = [...staticPages, ...categoryPages, ...statusPages]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allUrls
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}