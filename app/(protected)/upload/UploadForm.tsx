'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileVideo,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Hash,
  Tag,
  Trash2,
  Play,
  Pause,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { cn, formatBytes, formatDuration, generateSignedUploadParams } from '@/lib/utils'
import { useUploadStore } from '@/lib/store'
import type { Category, Tag } from '@prisma/client'

interface UploadFormProps {
  categories: (Category & { icon: string | null })[]
  tags: Tag[]
  userId: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_DURATION = 60 // seconds
const ALLOWED_VIDEO_TYPES = ['video/mp4']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_TYPES = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES]

export function UploadForm({ categories, tags, userId }: UploadFormProps) {
  const router = useRouter()
  const { addUpload, updateUpload, removeUpload } = useUploadStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<Map<string, string>>(new Map())
  const [durations, setDurations] = useState<Map<string, number>>(new Map())
  const [resolutions, setResolutions] = useState<Map<string, string>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleFilesChange = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    const newPreviews = new Map(previews)
    const newDurations = new Map(durations)
    const newResolutions = new Map(resolutions)

    fileArray.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: 'Tipe file tidak didukung',
          description: `${file.name}: Hanya MP4, JPG, PNG, WebP yang diperbolehkan`,
          variant: 'destructive',
        })
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File terlalu besar',
          description: `${file.name}: Maksimal 50MB`,
          variant: 'destructive',
        })
        return
      }

      if (file.type.startsWith('video/')) {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          if (video.duration > MAX_DURATION) {
            toast({
              title: 'Video terlalu panjang',
              description: `${file.name}: Maksimal 60 detik (durasi: ${Math.round(video.duration)} detik)`,
              variant: 'destructive',
            })
            URL.revokeObjectURL(video.src)
            return
          }
          newDurations.set(file.name, Math.round(video.duration))
          newResolutions.set(file.name, `${video.videoWidth}x${video.videoHeight}`)
          URL.revokeObjectURL(video.src)
          setDurations(new Map(newDurations))
          setResolutions(new Map(newResolutions))
        }
        video.src = URL.createObjectURL(file)
      } else {
        const img = new Image()
        img.onload = () => {
          newResolutions.set(file.name, `${img.width}x${img.height}`)
          setResolutions(new Map(newResolutions))
          URL.revokeObjectURL(img.src)
        }
        img.src = URL.createObjectURL(file)
      }

      const previewUrl = URL.createObjectURL(file)
      newPreviews.set(file.name, previewUrl)
      validFiles.push(file)
    })

    setFiles((prev) => [...prev, ...validFiles])
    setPreviews(newPreviews)
  }, [previews, durations, resolutions])

  const removeFile = (fileName: string) => {
    const previewUrl = previews.get(fileName)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    
    setFiles((prev) => prev.filter((f) => f.name !== fileName))
    setPreviews((prev) => {
      const next = new Map(prev)
      next.delete(fileName)
      return next
    })
    setDurations((prev) => {
      const next = new Map(prev)
      next.delete(fileName)
      return next
    })
    setResolutions((prev) => {
      const next = new Map(prev)
      next.delete(fileName)
      return next
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      handleFilesChange(e.dataTransfer.files)
    }
  }

  const openFileDialog = () => fileInputRef.current?.click()

  const uploadToCloudinary = async (file: File, onProgress: (progress: number) => void): Promise<{ url: string; publicId: string }> => {
    const params = generateSignedUploadParams('statuswa-hd/uploads', {
      resource_type: file.type.startsWith('video/') ? 'video' : 'image',
      folder: 'statuswa-hd/uploads',
    })

    const formData = new FormData()
    Object.entries(params).forEach(([key, value]) => formData.append(key, value as string))
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          resolve({ url: response.secure_url, publicId: response.public_id })
        } else {
          reject(new Error('Upload gagal'))
        }
      })
      xhr.addEventListener('error', () => reject(new Error('Upload gagal')))
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${file.type.startsWith('video/') ? 'video' : 'image'}/upload`)
      xhr.send(formData)
    })
  }

  const generateThumbnail = async (videoUrl: string): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const publicId = videoUrl.split('/upload/')[1]?.split('.')[0]
    if (!publicId) return videoUrl
    return `https://res.cloudinary.com/${cloudName}/video/upload/w_400,h_711,c_fill,g_auto,q_auto:low/${publicId}.jpg`
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Judul wajib diisi', variant: 'destructive' })
      return
    }
    if (!categoryId) {
      toast({ title: 'Kategori wajib dipilih', variant: 'destructive' })
      return
    }
    if (files.length === 0) {
      toast({ title: 'Minimal 1 file wajib diupload', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    try {
      for (const file of files) {
        const uploadId = `${file.name}-${Date.now()}`
        
        addUpload({
          id: uploadId,
          file,
          title,
          description,
          categoryId,
          tags: selectedTags,
          progress: 0,
          status: 'uploading',
        })

        const { url, publicId } = await uploadToCloudinary(file, (progress) => {
          updateUpload(uploadId, { progress })
        })

        updateUpload(uploadId, { status: 'processing' })

        const isVideo = file.type.startsWith('video/')
        const thumbnailUrl = isVideo 
          ? await generateThumbnail(url)
          : url

        const duration = durations.get(file.name)
        const resolution = resolutions.get(file.name) || '1080x1920'

        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${publicId.slice(-8)}`
        
        const response = await fetch('/api/statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            categoryId,
            type: isVideo ? 'VIDEO' : 'IMAGE',
            url,
            thumbnail: thumbnailUrl,
            duration,
            size: file.size,
            resolution,
            tags: selectedTags,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Gagal membuat status')
        }

        updateUpload(uploadId, { status: 'complete', progress: 100 })
      }

      toast({ title: 'Berhasil!', description: `${files.length} status berhasil diupload dan menunggu moderasi` })
      router.push('/dashboard')
    } catch (error) {
      toast({ 
        title: 'Upload gagal', 
        description: error instanceof Error ? error.message : 'Terjadi kesalahan', 
        variant: 'destructive' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isVideoTab = activeTab === 'video'
  const acceptedTypes = isVideoTab ? ALLOWED_VIDEO_TYPES.join(',') : ALLOWED_IMAGE_TYPES.join(',')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Upload Status Baru</h1>
          <p className="text-muted-foreground mt-1">
            Upload video (MP4) atau gambar (JPG, PNG, WebP) dengan kualitas HD 1080p.
            Maksimal 50MB, durasi video maksimal 60 detik.
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'video'}
            onClick={() => setActiveTab('video')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              activeTab === 'video'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileVideo className="h-4 w-4 mr-2 inline" aria-hidden="true" />
            Video
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'image'}
            onClick={() => setActiveTab('image')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              activeTab === 'image'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ImageIcon className="h-4 w-4 mr-2 inline" aria-hidden="true" />
            Gambar
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" aria-hidden="true" />
                Pilih File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                  files.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50'
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFileDialog}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog() }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedTypes}
                  multiple
                  onChange={(e) => e.target.files && handleFilesChange(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Pilih file video atau gambar"
                />
                
                {files.length === 0 ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="text-lg font-medium">Seret & lepas file di sini</p>
                    <p className="text-sm text-muted-foreground">atau klik untuk memilih file</p>
                    <p className="text-xs text-muted-foreground">
                      {isVideoTab 
                        ? 'MP4 • Maks 50MB • Maks 60 detik • Min 720p'
                        : 'JPG, PNG, WebP • Maks 50MB • Min 720p'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {files.length} file dipilih {files.length < 5 ? '(klik untuk tambah)' : ''}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {files.map((file) => (
                        <FilePreviewItem
                          key={file.name}
                          file={file}
                          preview={previews.get(file.name)}
                          duration={durations.get(file.name)}
                          resolution={resolutions.get(file.name)}
                          onRemove={() => removeFile(file.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" aria-hidden="true" />
                Detail Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Status *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Lucu Banget! Anak Kecil Ngomong Ngaco"
                  maxLength={100}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tambahkan deskripsi singkat tentang status ini (opsional)"
                  maxLength={500}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
              </div>

              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                            {cat.icon && (
                              <span className="text-xs" style={{ color: cat.color }}>
                                {cat.icon}
                              </span>
                            )}
                          </div>
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tag</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.slice(0, 15).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTags((prev) => 
                        prev.includes(tag.id) ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                      )}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition-colors',
                        selectedTags.includes(tag.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTags.length} tag dipilih
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                Panduan Upload
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" /> Konten harus original atau memiliki hak cipta</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" /> Tidak berisi konten dewasa, kekerasan, atau SARA</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" /> Video: MP4, maks 50MB, maks 60 detik, min 720p</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" /> Gambar: JPG/PNG/WebP, maks 50MB, min 720p</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" /> Status akan dimoderasi sebelum dipublikasikan</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || files.length === 0} className="whatsapp-gradient text-white hover:opacity-90 gap-2">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Mengupload...' : 'Publish Status'}
            </Button>
          </div>
        </form>

        {useUploadStore.getState().pendingUploads.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Upload Berlangsung</h3>
            {useUploadStore.getState().pendingUploads.map((upload) => (
              <UploadProgressItem key={upload.id} upload={upload} onRemove={() => removeUpload(upload.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilePreviewItem({ file, preview, duration, resolution, onRemove }: {
  file: File
  preview: string | undefined
  duration: number | undefined
  resolution: string | undefined
  onRemove: () => void
}) {
  const isVideo = file.type.startsWith('video/')
  
  return (
    <div className="relative group bg-muted rounded-lg p-2 border border-border">
      <div className="relative aspect-video rounded-md overflow-hidden bg-black/10">
        {preview ? (
          isVideo ? (
            <video src={preview} className="w-full h-full object-cover" muted playsInline />
          ) : (
            <img src={preview} alt={file.name} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isVideo ? <FileVideo className="h-8 w-8 text-muted-foreground" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
          </div>
        )}
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Hapus file"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        {isVideo && duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(duration)}
          </div>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          {resolution && <span>• {resolution}</span>}
          {isVideo && duration && <span>• {formatDuration(duration)}</span>}
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {isVideo ? <FileVideo className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function UploadProgressItem({ upload, onRemove }: {
  upload: { id: string; file: File; progress: number; status: string; error?: string }
  onRemove: () => void
}) {
  const isVideo = upload.file.type.startsWith('video/')
  
  return (
    <Card className="border-primary/30">
      <CardContent className="pt-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            {isVideo ? <FileVideo className="h-8 w-8 text-muted-foreground" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{upload.file.name}</p>
              <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <Progress value={upload.progress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{upload.progress}%</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                upload.status === 'complete' && 'bg-green-100 text-green-800',
                upload.status === 'error' && 'bg-red-100 text-red-800',
                upload.status === 'uploading' && 'bg-blue-100 text-blue-800',
                upload.status === 'processing' && 'bg-yellow-100 text-yellow-800',
              )}>
                {upload.status === 'complete' && 'Selesai'}
                {upload.status === 'error' && `Error: ${upload.error}`}
                {upload.status === 'uploading' && 'Mengupload...'}
                {upload.status === 'processing' && 'Memproses...'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}