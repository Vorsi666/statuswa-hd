import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Status, Category, Tag, User } from '@prisma/client'

interface AppState {
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Filters (for explore page)
  filters: {
    category: string | null
    type: 'VIDEO' | 'IMAGE' | null
    sort: 'terbaru' | 'terpopuler' | 'trending'
    minDuration: number | null
    maxDuration: number | null
    resolution: string | null
  }
  setFilters: (filters: Partial<AppState['filters']>) => void
  resetFilters: () => void

  // View mode
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void

  // User preferences
  autoPlay: boolean
  setAutoPlay: (autoPlay: boolean) => void
  showDownloadButton: boolean
  setShowDownloadButton: (show: boolean) => void

  // Bookmarks (cached)
  bookmarkedIds: Set<string>
  addBookmark: (id: string) => void
  removeBookmark: (id: string) => void
  toggleBookmark: (id: string) => void
  isBookmarked: (id: string) => boolean

  // Recently viewed (for recommendations)
  recentlyViewed: string[]
  addRecentlyViewed: (id: string) => void

  // Upload progress
  uploadProgress: Record<string, number>
  setUploadProgress: (id: string, progress: number) => void
  clearUploadProgress: (id: string) => void
}

const defaultFilters = {
  category: null,
  type: null,
  sort: 'terbaru' as const,
  minDuration: null,
  maxDuration: null,
  resolution: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      resetFilters: () => set({ filters: defaultFilters }),

      // View mode
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Preferences
      autoPlay: true,
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      showDownloadButton: true,
      setShowDownloadButton: (show) => set({ showDownloadButton: show }),

      // Bookmarks
      bookmarkedIds: new Set(),
      addBookmark: (id) => set((state) => {
        const newSet = new Set(state.bookmarkedIds)
        newSet.add(id)
        return { bookmarkedIds: newSet }
      }),
      removeBookmark: (id) => set((state) => {
        const newSet = new Set(state.bookmarkedIds)
        newSet.delete(id)
        return { bookmarkedIds: newSet }
      }),
      toggleBookmark: (id) => set((state) => {
        const newSet = new Set(state.bookmarkedIds)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return { bookmarkedIds: newSet }
      }),
      isBookmarked: (id) => get().bookmarkedIds.has(id),

      // Recently viewed
      recentlyViewed: [],
      addRecentlyViewed: (id) => set((state) => {
        const filtered = state.recentlyViewed.filter((v) => v !== id)
        return { recentlyViewed: [id, ...filtered].slice(0, 20) }
      }),

      // Upload progress
      uploadProgress: {},
      setUploadProgress: (id, progress) => set((state) => ({
        uploadProgress: { ...state.uploadProgress, [id]: progress }
      })),
      clearUploadProgress: (id) => set((state) => {
        const newProgress = { ...state.uploadProgress }
        delete newProgress[id]
        return { uploadProgress: newProgress }
      }),
    }),
    {
      name: 'statuswa-hd-storage',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        autoPlay: state.autoPlay,
        showDownloadButton: state.showDownloadButton,
        bookmarkedIds: Array.from(state.bookmarkedIds),
        recentlyViewed: state.recentlyViewed,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.bookmarkedIds = new Set(state.bookmarkedIds as unknown as string[])
        }
      },
    }
  )
)

// Auth store
interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (data: Partial<User>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      isLoading: true,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'statuswa-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Upload store
interface UploadState {
  pendingUploads: Array<{
    id: string
    file: File
    title: string
    description: string
    categoryId: string
    tags: string[]
    progress: number
    status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
    error?: string
    result?: Status
  }>
  addUpload: (upload: UploadState['pendingUploads'][0]) => void
  updateUpload: (id: string, data: Partial<UploadState['pendingUploads'][0]>) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void
}

export const useUploadStore = create<UploadState>((set) => ({
  pendingUploads: [],
  addUpload: (upload) => set((state) => ({ pendingUploads: [...state.pendingUploads, upload] })),
  updateUpload: (id, data) => set((state) => ({
    pendingUploads: state.pendingUploads.map((u) => u.id === id ? { ...u, ...data } : u)
  })),
  removeUpload: (id) => set((state) => ({
    pendingUploads: state.pendingUploads.filter((u) => u.id !== id)
  })),
  clearCompleted: () => set((state) => ({
    pendingUploads: state.pendingUploads.filter((u) => u.status !== 'complete' && u.status !== 'error')
  })),
}))