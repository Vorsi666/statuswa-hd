'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight, Filter, X, Grid, List, Loader2, RotateCcw, Search, Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusCard } from '@/components/status-card'
import { cn, formatNumber } from '@/lib/utils'
import { useInView } from 'react-intersection-observer'

interface Status {
  id: string
  slug: string
  title: string
  description: string | null
  type: 'VIDEO' | 'IMAGE'
  url: string
  thumbnail: string
  duration: number | null
  size: number
  resolution: string
  views: number
  downloads: number
  status: string
  createdAt: string
  category: { name: string; slug: string; color: string | null; icon: string | null } | null
  author: { name: string | null; image: string | null } | null
  tags: Array<{ name: string; slug: string }>
  _count: { bookmarks: number }
}

interface ApiResponse {
  statuses: Status[]
  nextCursor: string | null
  hasMore: boolean
  total: number
}

const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terpopuler', label: 'Terpopuler' },
  { value: 'trending', label: 'Trending' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'IMAGE', label: 'Gambar' },
]

const DURATION_OPTIONS = [
  { value: '', label: 'Semua Durasi' },
  { value: '15', label: '≤ 15 detik' },
  { value: '30', label: '≤ 30 detik' },
  { value: '60', label: '≤ 60 detik' },
]

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'terbaru',
    maxDuration: searchParams.get('maxDuration') || '',
    search: searchParams.get('search') || '',
  })
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { ref: loadMoreRefInView, inView } = useInView({ threshold: 0.1 })

  const buildQueryString = useCallback((params: Record<string, string>) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value)
    })
    return searchParams.toString()
  }, [])

  const fetchStatuses = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)

    try {
      const params: Record<string, string> = {
        ...filters,
        limit: '20',
      }
      if (cursor) params.cursor = cursor

      const queryString = buildQueryString(params)
      const response = await fetch(`/api/statuses?${queryString}`)
      const data: ApiResponse = await response.json()

      if (isLoadMore) {
        setStatuses((prev) => [...prev, ...data.statuses])
      } else {
        setStatuses(data.statuses)
      }
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters, cursor, buildQueryString])

  useEffect(() => {
    setStatuses([])
    setCursor(null)
    setHasMore(true)
    fetchStatuses(false)
  }, [filters])

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      fetchStatuses(true)
    }
  }, [inView, hasMore, loadingMore, fetchStatuses])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('cursor')
    router.push(`/explore?${params.toString()}`, { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const search = formData.get('search') as string
    handleFilterChange('search', search)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      type: '',
      sort: 'terbaru',
      maxDuration: '',
      search: '',
    })
    router.push('/explore', { scroll: false })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== 'terbaru')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Jelajahi Status</h1>
              <p className="text-muted-foreground mt-1">
                {total > 0 ? `Ditemukan ${formatNumber(total)} status` : 'Tidak ada status ditemukan'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Tampilan grid"
              >
                <Grid className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="Tampilan daftar"
              >
                <List className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 animate-slide-up space-y-4 p-4 bg-muted/50 rounded-xl border border-border">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="search"
                  name="search"
                  placeholder="Cari status..."
                  defaultValue={filters.search}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Cari status"
                />
                <Button type="submit" className="whitespace-nowrap">
                  <Search className="h-4 w-4 mr-1" aria-hidden="true" />
                  Cari
                </Button>
              </form>
              <div className="grid grid-cols-2 gap-3">
                <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.sort} onValueChange={(v) => handleFilterChange('sort', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.maxDuration} onValueChange={(v) => handleFilterChange('maxDuration', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full justify-center">
                  <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
                  Hapus Semua Filter
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <StatusGridSkeleton count={viewMode === 'grid' ? 8 : 4} />
        ) : statuses.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <div
              className={cn(
                'gap-4',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col'
              )}
              role="list"
              aria-label="Daftar status"
            >
              {statuses.map((status, index) => (
                <StatusCard
                  key={status.id}
                  status={status}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  priority={index < 4 && viewMode === 'grid'}
                />
              ))}
            </div>

            <div ref={loadMoreRefInView} className="py-8 text-center" aria-live="polite">
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Memuat lebih banyak...</span>
                </div>
              )}
              {hasMore && !loadingMore && statuses.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Menampilkan {statuses.length} dari {formatNumber(total)} status
                </p>
              )}
              {!hasMore && statuses.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Semua status telah dimuat ({formatNumber(total)} total)
                </p>
              )}
            </div>
          </>
        )}
      </main>

      <aside className="hidden lg:block fixed top-24 right-4 w-72 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="sticky top-20 bg-background border border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filter</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Hapus filter">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          <form onSubmit={handleSearch} className="mb-4">
            <label htmlFor="search" className="sr-only">Cari status</label>
            <input
              id="search"
              type="search"
              name="search"
              placeholder="Cari status..."
              defaultValue={filters.search}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              aria-label="Cari status"
            />
          </form>
          <div className="space-y-4">
            <FilterSection label="Kategori">
              <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            <FilterSection label="Tipe">
              <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            <FilterSection label="Urutkan">
              <Select value={filters.sort} onValueChange={(v) => handleFilterChange('sort', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Terbaru" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            <FilterSection label="Durasi Maksimal">
              <Select value={filters.maxDuration} onValueChange={(v) => handleFilterChange('maxDuration', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Durasi" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
          </div>
        </div>
      </aside>
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  )
}

function StatusGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <div className="aspect-[9/16] bg-muted" />
          <CardContent className="p-3 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded-full w-16" />
              <div className="h-5 bg-muted rounded-full w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Search className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold mb-2">
        {hasFilters ? 'Tidak Ada Hasil' : 'Belum Ada Status'}
      </h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        {hasFilters
          ? 'Coba ubah filter atau kata kunci pencarian untuk menemukan status yang kamu cari.'
          : 'Belum ada status yang diupload. Jadilah yang pertama mengupload status!'}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Hapus Filter
        </Button>
      ) : (
        <a href="/upload">
          <Button className="gap-2 whatsapp-gradient text-white hover:opacity-90">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Upload Status Pertama
          </Button>
        </a>
      )}
    </div>
  )
}

const categories = [
  { name: 'Lucu', slug: 'lucu', icon: 'Smile', color: '#F59E0B' },
  { name: 'Islami', slug: 'islami', icon: 'Star', color: '#059669' },
  { name: 'Motivasi', slug: 'motivasi', icon: 'Target', color: '#3B82F6' },
  { name: 'Cinta', slug: 'cinta', icon: 'Heart', color: '#EC4899' },
  { name: 'Sedih', slug: 'sedih', icon: 'CloudRain', color: '#6366F1' },
  { name: 'Ucapan', slug: 'ucapan', icon: 'MessageSquare', color: '#8B5CF6' },
]