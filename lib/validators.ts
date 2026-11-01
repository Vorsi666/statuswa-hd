import { z } from 'zod'

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter').optional(),
  image: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Password minimal 6 karakter'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

// Status validators
export const createStatusSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
  categoryId: z.string().cuid('Kategori tidak valid'),
  type: z.enum(['VIDEO', 'IMAGE']),
  url: z.string().url('URL tidak valid'),
  thumbnail: z.string().url('URL thumbnail tidak valid'),
  duration: z.number().int().positive().max(60, 'Durasi maksimal 60 detik').optional(),
  size: z.number().int().positive().max(50 * 1024 * 1024, 'Ukuran file maksimal 50MB'),
  resolution: z.string().regex(/^\d+x\d+$/, 'Format resolusi tidak valid (contoh: 1080x1920)'),
  tags: z.array(z.string().cuid()).optional(),
})

export const updateStatusSchema = createStatusSchema.partial().extend({
  id: z.string().cuid(),
})

export const statusFilterSchema = z.object({
  category: z.string().optional(),
  type: z.enum(['VIDEO', 'IMAGE']).optional(),
  sort: z.enum(['terbaru', 'terpopuler', 'trending']).default('terbaru'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().optional(),
  minDuration: z.coerce.number().int().positive().optional(),
  maxDuration: z.coerce.number().int().positive().optional(),
  resolution: z.string().optional(),
})

// Upload validators
export const uploadInitSchema = z.object({
  fileName: z.string().min(1, 'Nama file wajib diisi'),
  fileType: z.enum(['video/mp4', 'image/jpeg', 'image/png', 'image/webp']),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024, 'Ukuran file maksimal 50MB'),
  duration: z.number().int().positive().max(60).optional(), // only for video
})

// Category validators
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter').max(50, 'Slug maksimal 50 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  icon: z.string().optional(),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna hex tidak valid').optional(),
  order: z.number().int().default(0),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid(),
})

// Tag validators
export const createTagSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(30, 'Nama maksimal 30 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter').max(30, 'Slug maksimal 30 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
})

// Report validators
export const createReportSchema = z.object({
  statusId: z.string().cuid('Status tidak valid'),
  reason: z.string().min(10, 'Alasan minimal 10 karakter').max(500, 'Alasan maksimal 500 karakter'),
})

// Admin validators
export const moderateStatusSchema = z.object({
  statusId: z.string().cuid(),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().max(500).optional(),
}).refine((data) => data.action !== 'reject' || data.rejectionReason, {
  message: 'Alasan penolakan wajib diisi',
  path: ['rejectionReason'],
})

export const adminStatsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
})

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateStatusInput = z.infer<typeof createStatusSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type StatusFilterInput = z.infer<typeof statusFilterSchema>
export type UploadInitInput = z.infer<typeof uploadInitSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type ModerateStatusInput = z.infer<typeof moderateStatusSchema>