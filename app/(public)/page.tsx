import { Metadata } from 'next'
import Link from 'next/link'
import { Search, Play, Download, TrendingUp, Star, Heart, Zap, CloudRain, MessageSquare, Smile, Target, ArrowRight, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusCard } from '@/components/status-card'
import { prisma } from '@/lib/prisma'
import { formatNumber, formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'StatusWA HD - Download Video & Gambar Status WhatsApp HD 1080p',
  description: 'Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p. Gratis, cepat, dan tanpa watermark.',
  openGraph: {
    title: 'StatusWA HD - Download Status WhatsApp HD 1080p',
    description: 'Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p.',
    images: ['/og-image.png'],
  },
}

const categories = [
  { name: 'Lucu', slug: 'lucu', icon: Smile, color: '#F59E0B', count: 1240 },
  { name: 'Islami', slug: 'islami', icon: Star, color: '#059669', count: 890 },
  { name: 'Motivasi', slug: 'motivasi', icon: Target, color: '#3B82F6', count: 2100 },
  { name: 'Cinta', slug: 'cinta', icon: Heart, color: '#EC4899', count: 1560 },
  { name: 'Sedih', slug: 'sedih', icon: CloudRain, color: '#6366F1', count: 780 },
  { name: 'Ucapan', slug: 'ucapan', icon: MessageSquare, color: '#8B5CF6', count: 2340 },
]

async function getTrendingStatuses() {
  return prisma.status.findMany({
    where: { status: 'APPROVED' },
    orderBy: [{ views: 'desc' }, { downloads: 'desc' }, { createdAt: 'desc' }],
    take: 12,
    include: {
      category: { select: { name: true, slug: true, color: true, icon: true } },
      author: { select: { name: true, image: true } },
      tags: { select: { name: true, slug: true } },
      _count: { select: { bookmarks: true } },
    },
  })
}

async function getLatestStatuses() {
  return prisma.status.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      category: { select: { name: true, slug: true, color: true, icon: true } },
      author: { select: { name: true, image: true } },
      tags: { select: { name: true, slug: true } },
      _count: { select: { bookmarks: true } },
    },
  })
}

async function getMostDownloadedStatuses() {
  return prisma.status.findMany({
    where: { status: 'APPROVED' },
    orderBy: { downloads: 'desc' },
    take: 8,
    include: {
      category: { select: { name: true, slug: true, color: true, icon: true } },
      author: { select: { name: true, image: true } },
      tags: { select: { name: true, slug: true } },
      _count: { select: { bookmarks: true } },
    },
  })
}

async function getStats() {
  const [totalStatuses, totalViews, totalDownloads, totalCategories] = await Promise.all([
    prisma.status.count({ where: { status: 'APPROVED' } }),
    prisma.status.aggregate({ where: { status: 'APPROVED' }, _sum: { views: true } }),
    prisma.status.aggregate({ where: { status: 'APPROVED' }, _sum: { downloads: true } }),
    prisma.category.count(),
  ])

  return {
    totalStatuses,
    totalViews: totalViews._sum.views || 0,
    totalDownloads: totalDownloads._sum.downloads || 0,
    totalCategories,
  }
}

export default async function HomePage() {
  const [trendingStatuses, latestStatuses, mostDownloadedStatuses, stats] = await Promise.all([
    getTrendingStatuses(),
    getLatestStatuses(),
    getMostDownloadedStatuses(),
    getStats(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative hero-gradient py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span>10.000+ Status HD siap diunduh</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-slide-up">
              Status WhatsApp{' '}
              <span className="gradient-text">HD 1080p</span>{' '}
              Gratis & Tanpa Watermark
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              Temukan ribuan video & gambar status WhatsApp berkualitas tinggi. Unduh, bagikan, dan simpan favoritmu dengan satu klik.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/explore">
                <Button size="xl" className="whatsapp-gradient text-white hover:opacity-90 gap-2 w-full sm:w-auto">
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Jelajahi Status
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
                  <Play className="h-5 w-5" aria-hidden="true" />
                  Upload Statusmu
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
              <span className="flex items-center gap-1"><Download className="h-4 w-4" aria-hidden="true" /> HD 1080p</span>
              <span className="flex items-center gap-1"><Zap className="h-4 w-4" aria-hidden="true" /> Cepat</span>
              <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" aria-hidden="true" /> Gratis</span>
              <span className="flex items-center gap-1"><Shield className="h-4 w-4" aria-hidden="true" /> Aman</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <StatCard label="Total Status" value={formatNumber(stats.totalStatuses)} icon={Play} />
            <StatCard label="Total Views" value={formatNumber(stats.totalViews)} icon={TrendingUp} />
            <StatCard label="Total Download" value={formatNumber(stats.totalDownloads)} icon={Download} />
            <StatCard label="Kategori" value={stats.totalCategories.toString()} icon={Star} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Jelajahi Kategori</h2>
              <p className="text-muted-foreground mt-1">Temukan status sesuai mood dan kebutuhanmu</p>
            </div>
            <Link href="/categories" className="hidden sm:block text-primary font-medium hover:underline flex items-center gap-1">
              Semua kategori <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/explore?category=${category.slug}`}
                className="group relative p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <category.icon className="h-6 w-6" style={{ color: category.color }} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatNumber(category.count)} status</p>
                <ChevronRight className="absolute bottom-4 right-4 h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Status */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
                Trending Status HD
              </h2>
              <p className="text-muted-foreground mt-1">Status paling populer minggu ini</p>
            </div>
            <Link href="/explore?sort=trending" className="hidden sm:block text-primary font-medium hover:underline flex items-center gap-1">
              Lihat semua <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingStatuses.length > 0 ? (
              trendingStatuses.map((status, index) => (
                <StatusCard
                  key={status.id}
                  status={status}
                  variant="default"
                  priority={index < 4}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" aria-hidden="true" />
                <p className="mt-4 text-muted-foreground">Memuat status trending...</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/explore?sort=trending">
              <Button variant="outline" className="w-full sm:w-auto">Lihat Semua Trending</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest & Most Downloaded */}
      <div className="grid md:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8 py-16">
        {/* Latest Uploads */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                Baru Diupload
              </h2>
              <p className="text-muted-foreground mt-1">Status terbaru dari komunitas</p>
            </div>
            <Link href="/explore?sort=terbaru" className="hidden sm:block text-primary font-medium hover:underline flex items-center gap-1 text-sm">
              Lihat semua <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="space-y-3">
            {latestStatuses.length > 0 ? (
              latestStatuses.map((status) => (
                <StatusCard key={status.id} status={status} variant="compact" />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-muted-foreground">Memuat status terbaru...</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center sm:hidden">
            <Link href="/explore?sort=terbaru">
              <Button variant="outline" className="w-full">Lihat Semua Terbaru</Button>
            </Link>
          </div>
        </section>

        {/* Most Downloaded */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Download className="h-6 w-6 text-green-500" aria-hidden="true" />
                Paling Banyak Didownload
              </h2>
              <p className="text-muted-foreground mt-1">Status favorit pengguna</p>
            </div>
            <Link href="/explore?sort=terpopuler" className="hidden sm:block text-primary font-medium hover:underline flex items-center gap-1 text-sm">
              Lihat semua <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="space-y-3">
            {mostDownloadedStatuses.length > 0 ? (
              mostDownloadedStatuses.map((status) => (
                <StatusCard key={status.id} status={status} variant="compact" />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-muted-foreground">Memuat status populer...</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center sm:hidden">
            <Link href="/explore?sort=terpopuler">
              <Button variant="outline" className="w-full">Lihat Semua Populer</Button>
            </Link>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap Berbagi Statusmu?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Upload video/gambar statusmu sendiri dan bagikan ke jutaan pengguna StatusWA HD.
            Gratis, mudah, dan cepat!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="xl" variant="secondary" className="gap-2 w-full sm:w-auto">
                <Play className="h-5 w-5" aria-hidden="true" />
                Mulai Upload
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="xl" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto gap-2">
                <Search className="h-5 w-5" aria-hidden="true" />
                Jelajahi Dulu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Fitur Unggulan</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Semua yang kamu butuhkan untuk pengalaman status terbaik</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Download}
              title="Download HD 1080p"
              description="Unduh video dan gambar status dengan kualitas penuh 1080p tanpa kompresi dan tanpa watermark."
            />
            <FeatureCard
              icon={ArrowRight}
              title="Bagikan ke WhatsApp"
              description="Bagikan status langsung ke WhatsApp dengan satu klik menggunakan wa.me link atau Web Share API."
            />
            <FeatureCard
              icon={Heart}
              title="Bookmark & Favorit"
              description="Simpan status favoritmu di koleksi pribadi dan akses kapan saja tanpa perlu mencari lagi."
            />
            <FeatureCard
              icon={Zap}
              title="Super Cepat & Ringan"
              description="CDN global Cloudinary memastikan loading cepat di seluruh Indonesia. Optimasi PWA untuk offline."
            />
            <FeatureCard
              icon={Shield}
              title="Aman & Privasi"
              description="Moderasi konten ketat, laporan spam/kopi, dan data pribadi terenkripsi. Tidak ada iklan mengganggu."
            />
            <FeatureCard
              icon={Play}
              title="Player Video Custom"
              description="Putar video status langsung di browser dengan kontrol penuh: kecepatan, fullscreen, keyboard shortcut."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="text-center p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-center gap-2 text-primary mb-2">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}