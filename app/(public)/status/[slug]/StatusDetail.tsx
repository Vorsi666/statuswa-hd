'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Download,
  Share2,
  Heart,
  Bookmark,
  Flag,
  Eye,
  Clock,
  FileVideo,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Star,
  Target,
  Smile,
  CloudRain,
  ChevronLeft,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VideoPlayer } from '@/components/video-player'
import { StatusCard } from '@/components/status-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatDuration, formatNumber, formatRelativeTime, getVideoAspectRatio, formatBytes } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Status } from '@prisma/client'

interface StatusDetailProps {
  status: Status & {
    category: { name: string; slug: string; color: string | null; icon: string | null } | null
    author: { id: string; name: string | null; image: string | null } | null
    tags: Array<{ id: string; name: string; slug: string }>
    _count: { bookmarks: number }
  }
}

export function StatusDetail({ status }: StatusDetailProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [relatedStatuses, setRelatedStatuses] = useState<Array<typeof status>>([])

  const isVideo = status.type === 'VIDEO'
  const aspectRatio = getVideoAspectRatio(status.resolution)

  useEffect(() => {
    fetch(`/api/statuses?category=${status.category?.slug}&exclude=${status.id}&limit=6`)
      .then(res => res.json())
      .then(data => setRelatedStatuses(data.statuses || []))
      .catch(console.error)
  }, [status.category?.slug, status.id])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/statuses/${status.id}/download`, { method: 'POST' })
      if (response.ok) {
        const a = document.createElement('a')
        a.href = status.url
        a.download = `${status.slug}.${isVideo ? 'mp4' : 'jpg'}`
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast({ title: 'Download dimulai', description: 'File sedang diunduh...' })
      } else {
        toast({ title: 'Gagal', description: 'Tidak dapat memulai download', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan saat download', variant: 'destructive' })
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: status.title,
      text: status.description || `Lihat status ini: ${status.title}`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        await fetch(`/api/statuses/${status.id}/share`, { method: 'POST' })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          openWhatsAppShare()
        }
      }
    } else {
      openWhatsAppShare()
    }
  }

  const openWhatsAppShare = () => {
    const text = encodeURIComponent(`${status.title}\n\n${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    fetch(`/api/statuses/${status.id}/share`, { method: 'POST' }).catch(console.error)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Link disalin', description: 'Link status telah disalin ke clipboard' })
    } catch {
      toast({ title: 'Gagal', description: 'Tidak dapat menyalin link', variant: 'destructive' })
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: status.id }),
      })
      if (response.ok) {
        toast({ title: 'Disimpan', description: 'Status ditambahkan ke bookmark' })
      } else if (response.status === 401) {
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.href))
      } else {
        toast({ title: 'Gagal', description: 'Tidak dapat menyimpan bookmark', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) return
    setReporting(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: status.id, reason: reportReason }),
      })
      if (response.ok) {
        toast({ title: 'Laporan terkirim', description: 'Tim kami akan meninjau laporan ini' })
        setReportOpen(false)
        setReportReason('')
      } else if (response.status === 401) {
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.href))
      } else {
        toast({ title: 'Gagal', description: 'Tidak dapat mengirim laporan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setReporting(false)
    }
  }

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    lucu: Smile,
    islami: Star,
    motivasi: Target,
    cinta: Heart,
    sedih: CloudRain,
    ucapan: MessageSquare,
  }

  const CategoryIcon = status.category?.slug ? categoryIcons[status.category.slug] : Star

  return (
    <article className="min-h-screen">
      <section className="relative w-full" style={{ aspectRatio: `${aspectRatio}` }}>
        {isVideo ? (
          <VideoPlayer
            src={status.url}
            poster={status.thumbnail}
            title={status.title}
            onDownload={handleDownload}
            onShare={handleShare}
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full relative bg-black">
            <img
              src={status.thumbnail}
              alt={status.title}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  {status.category && (
                    <Badge
                      variant="outline"
                      className="mb-2 bg-white/90 backdrop-blur-sm text-sm"
                      style={status.category.color ? { backgroundColor: `${status.category.color}20`, borderColor: status.category.color } : undefined}
                    >
                      <CategoryIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                      {status.category.name}
                    </Badge>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{status.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Download className="h-5 w-5" aria-hidden="true" />
                    {downloading ? 'Mengunduh...' : 'Unduh HD'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white/10 text-white hover:bg-white/20 gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" aria-hidden="true" />
                    Bagikan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/explore"
          className="absolute top-4 left-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          aria-label="Kembali ke jelajahi"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
      </section>

      <section className="py-6 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap gap-2">
                {status.tags.slice(0, 8).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/explore?search=%23${tag.slug}`}
                    className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>

              {status.description && (
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{status.description}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {formatNumber(status.views)} views
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {formatNumber(status.downloads)} downloads
                </span>
                {status.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {formatDuration(status.duration)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {isVideo ? <FileVideo className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  {status.resolution}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {formatNumber(status._count.bookmarks)} bookmark
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatRelativeTime(status.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={status.author?.image || ''} alt={status.author?.name || 'Author'} />
                  <AvatarFallback>{status.author?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{status.author?.name || 'Anonim'}</p>
                  <p className="text-sm text-muted-foreground">Pengupload</p>
                </div>
                <Link
                  href={`/user/${status.author?.id}`}
                  className="ml-auto text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Lihat Profil
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2 whatsapp-gradient text-white hover:opacity-90"
                      onClick={handleDownload}
                      disabled={downloading}
                      size="lg"
                    >
                      <Download className="h-5 w-5" aria-hidden="true" />
                      {downloading ? 'Mengunduh...' : 'Unduh HD 1080p'}
                    </Button>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{formatNumber(status.views)}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{formatNumber(status.downloads)}</p>
                        <p className="text-xs text-muted-foreground">Downloads</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <p>Ukuran: {formatBytes(status.size)}</p>
                      <p>Resolusi: {status.resolution}</p>
                      <p>Tipe: {isVideo ? 'Video (MP4)' : 'Gambar (JPG/PNG)'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full gap-2 justify-start"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                      Bagikan ke WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 justify-start"
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Disalin!' : 'Salin Link'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 justify-start"
                      onClick={handleBookmark}
                    >
                      <Bookmark className="h-4 w-4" aria-hidden="true" />
                      Simpan ke Bookmark
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardContent className="pt-6">
                  <Button
                    variant="outline"
                    className="w-full gap-2 justify-start text-destructive hover:bg-destructive/10"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="h-4 w-4" aria-hidden="true" />
                    Laporkan Konten
                  </Button>
                </CardContent>
              </Card>

              {status.category && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: `${status.category.color}15` }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${status.category.color}30` }}>
                        <CategoryIcon className="h-5 w-5" style={{ color: status.category.color }} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium">{status.category.name}</p>
                        <p className="text-sm text-muted-foreground">Kategori</p>
                      </div>
                    </div>
                    <Link
                      href={`/explore?category=${status.category.slug}`}
                      className="block mt-3 text-center text-sm text-primary hover:underline"
                    >
                      Lihat status serupa →
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {relatedStatuses.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Status Serupa</h2>
              <Link
                href={`/explore?category=${status.category?.slug}`}
                className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
              >
                Lihat semua <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relatedStatuses.map((relatedStatus, index) => (
                <StatusCard
                  key={relatedStatus.id}
                  status={relatedStatus}
                  variant="default"
                  priority={index < 4}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={() => setReportOpen(false)}>
          <div className="w-full max-w-md bg-background rounded-xl p-6 shadow-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Laporkan Konten</h3>
              <Button variant="ghost" size="icon" onClick={() => setReportOpen(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Jelaskan alasan melaporkan status ini. Tim kami akan meninjau laporan Anda.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Tulis alasan laporan (minimal 10 karakter)..."
              className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
              maxLength={500}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleReport} disabled={reporting || reportReason.length < 10}>
                {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim Laporan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}