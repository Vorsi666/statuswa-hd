'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster: string
  title: string
  onDownload?: () => void
  onShare?: () => void
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'auto' | 'metadata' | 'none'
}

export function VideoPlayer({
  src,
  poster,
  title,
  onDownload,
  onShare,
  autoPlay = false,
  muted = true,
  loop = false,
  preload = 'metadata',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
      return () => clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying, showSettings])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }, [])

  const handleEnded = useCallback(() => {
    if (loop && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(console.error)
    } else {
      setIsPlaying(false)
    }
  }, [loop])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = percent * videoRef.current.duration
  }, [])

  const handleVolumeChange = useCallback((value: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = value
    setVolume(value)
    setIsMuted(value === 0)
  }, [])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.error('Fullscreen error:', err)
      }
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (err) {
        console.error('Exit fullscreen error:', err)
      }
    }
  }, [isFullscreen])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!videoRef.current) return
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowLeft':
        e.preventDefault()
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
        break
      case 'ArrowRight':
        e.preventDefault()
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
        break
      case 'ArrowUp':
        e.preventDefault()
        handleVolumeChange(Math.min(1, volume + 0.1))
        break
      case 'ArrowDown':
        e.preventDefault()
        handleVolumeChange(Math.max(0, volume - 0.1))
        break
      case 'm':
        toggleMute()
        break
      case 'f':
        toggleFullscreen()
        break
      case 'Escape':
        if (isFullscreen) toggleFullscreen()
        break
    }
  }, [togglePlay, duration, volume, handleVolumeChange, toggleMute, toggleFullscreen, isFullscreen])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [isPlaying, showSettings])

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-black rounded-lg overflow-hidden', isFullscreen && 'fixed inset-0 z-50 rounded-none')}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
      onClick={() => !showSettings && setShowControls(true)}
      tabIndex={0}
      role="region"
      aria-label={`Video player: ${title}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        preload={preload}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume)
          setIsMuted(e.currentTarget.muted)
        }}
        className="w-full h-full object-contain"
        aria-label={title}
      />

      {/* Loading overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity',
          isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        aria-hidden="true"
      >
        <Button
          variant="ghost"
          size="xl"
          className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Jeda' : 'Putar'}
        >
          <Play className="h-8 w-8 ml-1" aria-hidden="true" />
        </Button>
      </div>

      {/* Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300',
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        )}
      >
        {/* Progress bar */}
        <div
          className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-2"
          onClick={handleProgressClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleProgressClick(e as any)
          }}
          tabIndex={0}
          role="slider"
          aria-label="Kemajuan video"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={duration > 0 ? Math.round((currentTime / duration) * 100) : 0}
        >
          <div
            className="h-full bg-whatsapp-green rounded-full transition-all duration-100"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
          <div
            className="absolute top-1/2 left-0 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>

        {/* Time & Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white text-sm font-mono">
            <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => videoRef.current && (videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10))}
              aria-label="Mundur 10 detik"
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => videoRef.current && (videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10))}
              aria-label="Maju 10 detik"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
                aria-label={isMuted ? 'Bunyikan' : 'Bisu'}
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="h-2 w-24 appearance-none bg-white/30 rounded-full cursor-pointer"
                  style={{ transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: 'right' }}
                  aria-label="Volume"
                />
              </div>
            </div>

            {/* Playback rate */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Pengaturan"
                aria-expanded={showSettings}
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
              </Button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 rounded-lg shadow-lg min-w-[120px]">
                  <div className="text-white text-xs mb-2 px-2">Kecepatan</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => { setPlaybackRate(rate); setShowSettings(false) }}
                      className={cn(
                        'w-full text-left px-2 py-1 text-sm text-white hover:bg-white/10 rounded',
                        playbackRate === rate && 'bg-white/20'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>

            {/* Actions */}
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onDownload}
                aria-label="Unduh video"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
              </Button>
            )}
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onShare}
                aria-label="Bagikan"
              >
                <Share2 className="h-5 w-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}