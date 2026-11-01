import { forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Play, Download, Share2, Bookmark, Heart, Eye, Clock, FileVideo, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDuration, formatNumber, formatRelativeTime, getVideoAspectRatio } from '@/lib/utils'
import type { Status } from '@prisma/client'

interface Tag {
  id: string
  name: string
  slug: string
}

interface StatusCardProps {
  status: Status & {
    category?: { name: string; slug: string; color?: string | null; icon?: string | null }
    author?: { name: string | null; image: string | null }
    tags?: Tag[]
    _count?: { bookmarks: number }
  }
  variant?: 'default' | 'compact' | 'featured'
  priority?: boolean
  onClick?: () => void
  onDownload?: (e: React.MouseEvent) => void
  onShare?: (e: React.MouseEvent) => void
  onBookmark?: (e: React.MouseEvent) => void
}

const StatusCard = forwardRef<HTMLDivElement, StatusCardProps>(
  (
    {
      status,
      variant = 'default',
      priority = false,
      onClick,
      onDownload,
      onShare,
      onBookmark,
    },
    ref
  ) => {
    const isVideo = status.type === 'VIDEO'
    const aspectRatio = getVideoAspectRatio(status.resolution)
    const isBookmarked = false // Would come from store/context

    const handleClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLButtonElement ||
        target.closest('button') ||
        target.closest('a')
      ) return
      onClick?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.()
      }
    }

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className="group flex gap-3 p-2 rounded-lg transition-colors hover:bg-accent cursor-pointer"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
        >
          <div
            className="relative flex-shrink-0 overflow-hidden rounded-md bg-muted"
            style={{ width: 120, height: 120 / aspectRatio }}
          >
            <Image
              src={status.thumbnail}
              alt={status.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="120px"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <Play className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 flex gap-1">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {isVideo ? <FileVideo className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
              </Badge>
            </div>
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {status.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{formatNumber(status.views)}</span>
                <Eye className="h-3 w-3" aria-hidden="true" />
                <span>{formatNumber(status.downloads)}</span>
                <Download className="h-3 w-3" aria-hidden="true" />
              </div>
            </div>
            {status.category && (
              <Badge variant="secondary" className="w-fit mt-2 text-xs">
                {status.category.name}
              </Badge>
            )}
          </div>
        </div>
      )
    }

    if (variant === 'featured') {
      return (
        <article
          ref={ref}
          className="group relative overflow-hidden rounded-xl bg-card border shadow-sm transition-all duration-300 hover:shadow-lg"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
        >
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: `${aspectRatio}` }}
          >
            <Image
              src={status.thumbnail}
              alt={status.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {isVideo && (
              <button
                onClick={(e) => { e.stopPropagation(); onClick?.() }}
                className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Putar video: ${status.title}`}
              >
                <Play className="h-16 w-16 drop-shadow-lg" aria-hidden="true" />
              </button>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status.category && (
                    <Badge
                      variant="outline"
                      className="bg-white/90 backdrop-blur-sm text-foreground"
                      style={{ backgroundColor: status.category.color ? `${status.category.color}20` : undefined }}
                    >
                      {status.category.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-white text-sm">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>{formatNumber(status.views)}</span>
                  <Download className="h-4 w-4 ml-2" aria-hidden="true" />
                  <span>{formatNumber(status.downloads)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {status.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{status.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {status.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  #{tag.name}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatRelativeTime(status.createdAt)}</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onBookmark?.(e) }}
                  className={isBookmarked ? 'text-primary' : ''}
                  aria-label={isBookmarked ? 'Hapus dari bookmark' : 'Simpan ke bookmark'}
                >
                  <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onShare?.(e) }}
                  aria-label="Bagikan"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onDownload?.(e) }}
                  aria-label="Unduh HD"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      )
    }

    return (
      <Card
        ref={ref}
        className="group overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
      >
        <div
          className="relative overflow-hidden bg-muted"
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          <Image
            src={status.thumbnail}
            alt={status.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <Play className="h-10 w-10 text-white drop-shadow-lg" aria-hidden="true" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {isVideo ? (
                <>
                  <FileVideo className="h-3 w-3 mr-1" aria-hidden="true" />
                  {status.duration ? formatDuration(status.duration) : 'Video'}
                </>
              ) : (
                <>
                  <ImageIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                  Gambar
                </>
              )}
            </Badge>
          </div>
          {status.category && (
            <div className="absolute bottom-2 left-2">
              <Badge
                variant="secondary"
                className="text-xs"
                style={status.category.color ? { backgroundColor: `${status.category.color}20`, borderColor: status.category.color } : undefined}
              >
                {status.category.name}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3 space-y-2">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {status.title}
          </h3>
          {status.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{status.description}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {status.tags?.slice(0, 4).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs h-5 px-2">
                #{tag.name}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden="true" />
                {formatNumber(status.views)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" aria-hidden="true" />
                {formatNumber(status.downloads)}
              </span>
              {status.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDuration(status.duration)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onBookmark?.(e) }}
                className={isBookmarked ? 'text-primary' : 'text-muted-foreground'}
                aria-label={isBookmarked ? 'Hapus bookmark' : 'Bookmark'}
              >
                <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onShare?.(e) }}
                aria-label="Bagikan"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDownload?.(e) }}
                aria-label="Unduh HD"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }
)

StatusCard.displayName = 'StatusCard'

export { StatusCard }