import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { generateSignedUploadParams } from '@/lib/cloudinary'
import { uploadInitSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = uploadInitSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: validated.error.flatten() }, { status: 400 })
    }

    const { fileName, fileType, fileSize } = validated.data

    // Determine resource type and folder
    const isVideo = fileType.startsWith('video/')
    const folder = isVideo ? 'statuswa-hd/videos' : 'statuswa-hd/images'
    const uploadPreset = isVideo ? 'statuswa_hd_video' : 'statuswa_hd_image'

    // Generate signed upload parameters
    const params = generateSignedUploadParams(folder, {
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    })

    return NextResponse.json({
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`,
      params,
      uploadPreset,
    })
  } catch (error) {
    console.error('POST /api/upload/sign error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}