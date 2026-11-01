import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://statuswa-hd.com'

  const robots = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /upload/
Disallow: /login
Disallow: /register
Disallow: /api/
Disallow: /_next/
Disallow: /*.json$

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Host
Host: ${baseUrl}`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}