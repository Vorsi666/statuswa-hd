'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  FileVideo,
  Clock,
  Download,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  BarChart2,
  Settings,
  MoreVertical,
  Star,
  Smile,
  Heart,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusCard } from '@/components/status-card'
import { cn, formatNumber, formatRelativeTime } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Category, Report, User } from '@prisma/client'

interface AdminPanelProps {
  stats: {
    totalUsers: number
    totalStatuses: number
    pendingStatuses: number
    totalDownloads: number
    totalViews: number
  }
  recentReports: (Report & {
    statusRef: { id: string; title: string; thumbnail: string }
    reporter: { id: string; name: string | null; email: string }
  })[]
  categories: (Category & { _count: { statuses: number } })[]
}

type TabValue = 'overview' | 'moderation' | 'categories' | 'reports' | 'users'

export function AdminPanel({ stats, recentReports, categories }: AdminPanelProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabValue>('overview')
  const [moderationStatus, setModerationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '', color: '#3B82F6', description: '', order: 0 })
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleModerate = async (statusId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    setProcessingId(statusId)
    try {
      const response = await fetch('/api/admin/statuses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId, action, rejectionReason }),
      })
      if (response.ok) {
        toast({ title: 'Berhasil', description: `Status ${action === 'approve' ? 'disetujui' : 'ditolak'}` })
        router.refresh()
      } else {
        toast({ title: 'Gagal', description: 'Tidak dapat memoderasi status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleResolveReport = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (response.ok) {
        toast({ title: 'Berhasil', description: `Laporan ${action === 'resolve' ? 'diselesaikan' : 'dibatalkan'}` })
        router.refresh()
      } else {
        toast({ title: 'Gagal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.slug) return
    setCreatingCategory(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })
      if (response.ok) {
        toast({ title: 'Berhasil', description: 'Kategori dibuat' })
        router.refresh()
      } else {
        toast({ title: 'Gagal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setCreatingCategory(false)
      setNewCategory({ name: '', slug: '', icon: '', color: '#3B82F6', description: '', order: 0 })
    }
  }

  const handleUpdateCategory = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      })
      if (response.ok) {
        toast({ title: 'Berhasil', description: 'Kategori diperbarui' })
        setEditingCategory(null)
        router.refresh()
      } else {
        toast({ title: 'Gagal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Status di dalamnya tidak akan terhapus.')) return
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Berhasil', description: 'Kategori dihapus' })
        router.refresh()
      } else {
        toast({ title: 'Gagal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
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

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" aria-hidden="true" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">Kelola konten, pengguna, dan pengaturan platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Pengguna" value={stats.totalUsers} icon={Users} color="blue" />
          <StatCard title="Total Status" value={stats.totalStatuses} icon={FileVideo} color="green" />
          <StatCard title="Menunggu Review" value={stats.pendingStatuses} icon={Clock} color="yellow" />
          <StatCard title="Total Views" value={stats.totalViews} icon={Eye} color="purple" />
          <StatCard title="Total Download" value={stats.totalDownloads} icon={Download} color="orange" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="moderation">
              <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" />
              Moderasi ({stats.pendingStatuses})
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Star className="h-4 w-4 mr-2" aria-hidden="true" />
              Kategori
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Flag className="h-4 w-4 mr-2" aria-hidden="true" />
              Laporan ({recentReports.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" aria-hidden="true" />
              Pengguna
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                    Aksi Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/admin?tab=moderation">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      Review {stats.pendingStatuses} Status Pending
                    </Button>
                  </Link>
                  <Link href="/admin?tab=reports">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Flag className="h-4 w-4" aria-hidden="true" />
                      Cek {recentReports.length} Laporan Baru
                    </Button>
                  </Link>
                  <Link href="/admin?tab=categories">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Star className="h-4 w-4" aria-hidden="true" />
                      Kelola Kategori
                    </Button>
                  </Link>
                  <Link href="/admin?tab=users">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      Kelola Pengguna
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" aria-hidden="true" />
                    Laporan Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Tidak ada laporan baru</p>
                  ) : (
                    <div className="space-y-3">
                      {recentReports.map((report) => (
                        <div key={report.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <img
                            src={report.statusRef.thumbnail}
                            alt={report.statusRef.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{report.statusRef.title}</p>
                            <p className="text-sm text-muted-foreground">Dilaporkan oleh: {report.reporter.name || report.reporter.email}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(report.createdAt)}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleResolveReport(report.id, 'resolve')}>
                            Selesaikan
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={moderationStatus === status ? 'default' : 'outline'}
                    onClick={() => setModerationStatus(status)}
                    className="whitespace-nowrap"
                  >
                    {status === 'PENDING' && <Clock className="h-4 w-4 mr-1" />}
                    {status === 'APPROVED' && <CheckCircle className="h-4 w-4 mr-1" />}
                    {status === 'REJECTED' && <XCircle className="h-4 w-4 mr-1" />}
                    {status}
                  </Button>
                ))}
              </div>
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Cari status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <StatusModerationList
              statusFilter={moderationStatus}
              searchQuery={searchQuery}
              onModerate={handleModerate}
              processingId={processingId}
            />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Kelola Kategori</h2>
              <Button onClick={() => setCreatingCategory(true)} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah Kategori
              </Button>
            </div>

            {creatingCategory && (
              <CategoryForm
                category={newCategory}
                onChange={setNewCategory}
                onSubmit={handleCreateCategory}
                onCancel={() => setCreatingCategory(false)}
                isLoading={creatingCategory}
              />
            )}

            <div className="space-y-3">
              {categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  icons={categoryIcons}
                  onEdit={setEditingCategory}
                  onUpdate={handleUpdateCategory}
                  onDelete={handleDeleteCategory}
                />
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-3">
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Tidak ada laporan</p>
              ) : (
                recentReports.map((report) => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    onResolve={handleResolveReport}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
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

function StatusModerationList({ statusFilter, searchQuery, onModerate, processingId }: {
  statusFilter: 'PENDING' | 'APPROVED' | 'REJECTED'
  searchQuery: string
  onModerate: (id: string, action: 'approve' | 'reject', reason?: string) => void
  processingId: string | null
}) {
  return (
    <Card>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Penulis</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Views/Downloads</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Data dimuat dari API...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryRow({ category, icons, onEdit, onUpdate, onDelete }: {
  category: Category & { _count: { statuses: number } }
  icons: Record<string, React.ComponentType<{ className?: string }>>
  onEdit: (cat: Category) => void
  onUpdate: (cat: Category) => void
  onDelete: (id: string) => void
}) {
  const CategoryIcon = category.slug && icons[category.slug] ? icons[category.slug] : Star
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: category.name, color: category.color || '#3B82F6', description: category.description || '', order: category.order })

  if (editing) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
        <div className="flex gap-3">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nama"
            className="w-48"
          />
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-12 h-10 p-0"
          />
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Deskripsi"
            className="flex-1"
          />
          <Input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            className="w-20"
            placeholder="Urutan"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { onUpdate({ ...category, ...formData }); setEditing(false) }}>
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color || '#3B82F6'}20` }}>
        <CategoryIcon className="h-5 w-5" style={{ color: category.color || '#3B82F6' }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{category.name}</p>
        <p className="text-sm text-muted-foreground">{category.slug} • {category._count.statuses} status</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded border" style={{ backgroundColor: category.color || '#3B82F6' }} title={category.color || ''} />
        <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
          <Edit className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(category.id)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function CategoryForm({ category, onChange, onSubmit, onCancel, isLoading }: {
  category: { name: string; slug: string; icon: string; color: string; description: string; order: number }
  onChange: (cat: typeof category) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <Card className="mb-6 border-primary/30">
      <CardHeader>
        <CardTitle>Tambah Kategori Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cat-name">Nama *</Label>
            <Input id="cat-name" value={category.name} onChange={(e) => onChange({ ...category, name: e.target.value })} placeholder="Nama kategori" required />
          </div>
          <div>
            <Label htmlFor="cat-slug">Slug *</Label>
            <Input id="cat-slug" value={category.slug} onChange={(e) => onChange({ ...category, slug: e.target.value })} placeholder="slug-kategori" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cat-icon">Icon (Lucide name)</Label>
            <Input id="cat-icon" value={category.icon} onChange={(e) => onChange({ ...category, icon: e.target.value })} placeholder="smile, star, heart, etc" />
          </div>
          <div>
            <Label htmlFor="cat-color">Warna</Label>
            <Input id="cat-color" type="color" value={category.color} onChange={(e) => onChange({ ...category, color: e.target.value })} className="h-10 w-full p-0" />
          </div>
        </div>
        <div>
          <Label htmlFor="cat-desc">Deskripsi</Label>
          <Textarea id="cat-desc" value={category.description} onChange={(e) => onChange({ ...category, description: e.target.value })} placeholder="Deskripsi singkat" rows={2} />
        </div>
        <div>
          <Label htmlFor="cat-order">Urutan</Label>
          <Input id="cat-order" type="number" value={category.order} onChange={(e) => onChange({ ...category, order: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>Batal</Button>
          <Button onClick={onSubmit} disabled={isLoading || !category.name || !category.slug}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buat Kategori'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportRow({ report, onResolve }: {
  report: Report & {
    statusRef: { id: string; title: string; thumbnail: string }
    reporter: { id: string; name: string | null; email: string }
  }
  onResolve: (id: string, action: 'resolve' | 'dismiss') => void
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <img src={report.statusRef.thumbnail} alt={report.statusRef.title} className="w-16 h-16 rounded-lg object-cover" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium">{report.statusRef.title}</p>
            <p className="text-sm text-muted-foreground">Dilaporkan oleh: {report.reporter.name || report.reporter.email}</p>
            <p className="text-sm text-muted-foreground">Alasan: {report.reason}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(report.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onResolve(report.id, 'resolve')}>
              <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" />
              Selesaikan
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onResolve(report.id, 'dismiss')}>
              <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
              Batalkan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserManagement() {
  return (
    <Card>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Pengguna</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Peran</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Upload</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dibuat</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Data pengguna dimuat dari API...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}