import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

export function getCloudinaryUrl(publicId: string, options: Record<string, any> = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  })
}

export function getThumbnailUrl(publicId: string, options: Record<string, any> = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'video',
    format: 'jpg',
    transformation: [
      { width: 400, height: 711, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:low' },
      ...(options.transformation || []),
    ],
    ...options,
  })
}

export function getVideoUrl(publicId: string, options: Record<string, any> = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'video',
    transformation: [
      { quality: 'auto' },
      { format: 'mp4' },
      ...(options.transformation || []),
    ],
    ...options,
  })
}

export function getOptimizedImageUrl(publicId: string, options: Record<string, any> = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      ...(options.transformation || []),
    ],
    ...options,
  })
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'video' | 'image' = 'video') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

export async function getVideoDuration(publicId: string): Promise<number | null> {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: 'video' })
    return result.duration ? Math.round(result.duration) : null
  } catch {
    return null
  }
}

export function generateSignedUploadParams(
  folder: string = 'statuswa-hd',
  options: Record<string, any> = {}
) {
  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    timestamp,
    folder,
    ...options,
  }

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

  return {
    ...params,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  }
}

export const UPLOAD_PRESETS = {
  STATUS_VIDEO: 'statuswa_hd_video',
  STATUS_IMAGE: 'statuswa_hd_image',
  THUMBNAIL: 'statuswa_hd_thumb',
} as const