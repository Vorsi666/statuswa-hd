import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusDetail } from './StatusDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const status = await prisma.status.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, image: true } },
      tags: { select: { name: true, slug: true } },
    },
  })

  if (!status) {
    return { title: 'Status Tidak Ditemukan' }
  }

  const isVideo = status.type === 'VIDEO'
  const ogImage = status.thumbnail

  return {
    title: status.title,
    description: status.description || `Tonton dan unduh ${status.title} - Status WhatsApp HD 1080p`,
    openGraph: {
      title: status.title,
      description: status.description || `Tonton dan unduh ${status.title} - Status WhatsApp HD 1080p`,
      type: isVideo ? 'video.other' : 'website',
      url: `https://statuswa-aionlvnvg-vorsi-666.vercel.app/status/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1080,
          height: 1920,
          alt: status.title,
        },
      ],
      ...(isVideo && {
        video: {
          url: status.url,
          type: 'video/mp4',
          width: 1080,
          height: 1920,
        },
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: status.title,
      description: status.description || `Tonton dan unduh ${status.title}`,
      images: [ogImage],
    },
  }
}

export default async function StatusPage({ params }: Props) {
  const { slug } = await params
  const status = await prisma.status.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true, color: true, icon: true } },
      author: { select: { id: true, name: true, image: true } },
      tags: { select: { id: true, name: true, slug: true } },
      _count: { select: { bookmarks: true } },
    },
  })

  if (!status || status.status !== 'APPROVED') {
    notFound()
  }

  fetch(`/api/statuses/${status.id}/view`, { method: 'POST' }).catch(console.error)

  return <StatusDetail status={status} />
}