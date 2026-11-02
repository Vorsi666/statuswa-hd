'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Trash2,
  Edit,
  BarChart2,
  FileVideo,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
  Filter,
  MoreVertical,
  Star,
  Smile,
  Heart as HeartIcon,
  Target,
  CloudRain,
  MessageSquare,
  AlertTriangle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusCard } from '@/components/status-card'
import { cn, formatNumber, formatRelativeTime, formatBytes, formatDuration } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Status, User } from '@prisma/client'

interface DashboardContentProps {
  user: User
  uploads: (Status & {
    category: { name: string; slug: string; color: string | null; icon: string | null } | null
    tags: Array<{ name: string; slug: string }>
    _count: { bookmarks: number }
  })[]
  stats: {
    totalUploads: number
    pendingCount: number
    approvedCount: number
    rejectedCount: number
    totalViews: number
    totalDownloads: number
  }
  bookmarks: (Status & {
    category: { name: string; slug: string; color: string | null; icon: string | null } | null
    author: { name: string | null; image: string | null }
    tags: Array<{ name: string; slug: string }>
    _count: { bookmarks: number }
  })[]
}

export function DashboardContent({ user, uploads, stats, bookmarks }: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'uploads' | 'bookmarks'>('uploads')
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredUploads = uploads.filter((u) => 
    filterStatus === 'all' || u.status === filterStatus
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus status ini? Tindakan ini tidak dapat dibatalkan.')) return
    
    setDeletingId(id)
    try {
      const response = await fetch(`/api/statuses/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Berhasil', description: 'Status telah dihapus' })
        router.refresh()
      } else {
        toast({ title: 'Gagal', description: 'Tidak dapat menghapus status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleRemoveBookmark = async (statusId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${statusId}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Dihapus', description: 'Status dihapus dari bookmark' })
        router.refresh()
      } else {
        toast({ title: 'Gagal', description: 'Tidak dapat menghapus bookmark', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const statusIcons = {
    PENDING: <Clock className="h-3 w-3" aria-hidden="true" />,
    APPROVED: <CheckCircle className="h-3 w-3" aria-hidden="true" />,
    REJECTED: <XCircle className="h-3 w-3" aria-hidden="true" />,
  }

  const statusLabels = {
    PENDING: 'Menunggu',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Kelola status, lihat statistik, dan bookmark Anda</p>
            </div>
            <Link href="/upload">
              <Button className="whatsapp-gradient text-white hover:opacity-90 gap-2">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload Baru
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Upload" value={stats.totalUploads} icon={Upload} color="blue" />
            <StatCard title="Menunggu" value={stats.pendingCount} icon={Clock} color="yellow" />
            <StatCard title="Disetujui" value={stats.approvedCount} icon={CheckCircle} color="green" />
            <StatCard title="Ditolak" value={stats.rejectedCount} icon={XCircle} color="red" />
            <StatCard title="Total Views" value={formatNumber(stats.totalViews)} icon={Eye} color="purple" />
            <StatCard title="Total Download" value={formatNumber(stats.totalDownloads)} icon={Download} color="orange" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uploads">
              <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              Upload Saya ({uploads.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Heart className="h-4 w-4 mr-2" aria-hidden="true" />
              Bookmark ({bookmarks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Label htmlFor="status-filter" className="text-sm font-medium">Filter:</Label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Menunggu Moderasi</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>

            {filteredUploads.length === 0 ? (
              <EmptyState
                icon={Upload}
                title={filterStatus === 'all' ? 'Belum Ada Upload' : `Tidak Ada Status ${statusLabels[filterStatus as keyof typeof statusLabels]}`}
                description={filterStatus === 'all' 
                  ? 'Mulai upload status pertama Anda untuk berbagi ke komunitas'
                  : 'Coba ubah filter atau upload status baru'}
                action={filterStatus === 'all' ? (
                  <Link href="/upload">
                    <Button className="whatsapp-gradient text-white hover:opacity-90 gap-2">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Upload Status Pertama
                    </Button>
                  </Link>
                ) : null}
              />
            ) : (
              <div className="space-y-4">
                {filteredUploads.map((status) => (
                  <UploadRow
                    key={status.id}
                    status={status}
                    onDelete={handleDelete}
                    deleting={deletingId === status.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks">
            {bookmarks.length === 0 ? (
              <EmptyState
                icon={Heart}
                title='Belum Ada Bookmark'
                description='Simpan status favorit Anda dengan menekan ikon bookmark di halaman detail status'
                action={
                  <Link href="/explore">
                    <Button className="whatsapp-gradient text-white hover:opacity-90 gap-2">
                      <Filter className="h-4 w-4" aria-hidden="true" />
                      Jelajahi Status
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bookmarks.map((status, index) => (
                  <StatusCard
                    key={status.id}
                    status={status}
                    variant="default"
                    priority={index < 4}
                    onBookmark={(e) => { e.stopPropagation(); handleRemoveBookmark(status.id) }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(value)}</p>
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color as keyof typeof colorClasses])}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, title, description, action }: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

function UploadRow({ status, onDelete, deleting }: { 
  status: typeof uploads[0]
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const isVideo = status.type === 'VIDEO'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <img
              src={status.thumbnail}
              alt={status.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              {isVideo ? <FileVideo className="h-6 w-6 text-white" /> : <ImageIcon className="h-6 w-6 text-white" />}
            </div>
            {status.duration && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(status.duration)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{status.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{status.description || 'Tanpa deskripsi'}</p>
              </div>
              <Badge className={cn('flex-shrink-0 ml-2', statusColors[status.status as keyof typeof statusColors])}>
                {statusIcons[status.status as keyof typeof statusIcons]}
                {statusLabels[status.status as keyof typeof statusLabels]}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {status.category && (
                <Badge variant="outline" className="gap-1" style={status.category.color ? { borderColor: status.category.color } : undefined}>
                  {status.category.name}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {formatNumber(status.views)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {formatNumber(status.downloads)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatRelativeTime(status.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                {isVideo ? <FileVideo className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                {status.resolution}
              </span>
              {status.status === 'REJECTED' && status.rejectionReason && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="truncate max-w-[200px]">{status.rejectionReason}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                {status.status === 'APPROVED' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/status/${status.slug}`}>
                        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                        Lihat Detail
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {status.status === 'PENDING' && (
                  <>
                    <DropdownMenuLabel className="text-muted-foreground">Menunggu moderasi...</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                {status.status === 'REJECTED' && (
                  <>
                    <DropdownMenuLabel className="text-muted-foreground">Ditolak: {status.rejectionReason}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(status.id)}
                  disabled={deleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : 'Hapus'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {status.status === 'APPROVED' && (
              <Link href={`/status/${status.slug}`} className="text-center">
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart2 className="h-4 w-4 mr-1" aria-hidden="true" />
                  Statistik
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}