import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean up existing data (in development)
  if (process.env.NODE_ENV === 'development') {
    await prisma.report.deleteMany()
    await prisma.bookmark.deleteMany()
    await prisma.status.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.category.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()
    console.log('🗑️  Cleared existing data')
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@statuswa-hd.com' },
    update: {},
    create: {
      email: 'admin@statuswa-hd.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('👑 Created admin user:', admin.email)

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@statuswa-hd.com' },
    update: {},
    create: {
      email: 'user@statuswa-hd.com',
      name: 'Demo User',
      password: userPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })
  console.log('👤 Created demo user:', demoUser.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Lucu',
        slug: 'lucu',
        icon: 'smile',
        description: 'Status lucu dan menghibur',
        color: '#F59E0B',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Islami',
        slug: 'islami',
        icon: 'star',
        description: 'Status islami dan doa',
        color: '#059669',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Motivasi',
        slug: 'motivasi',
        icon: 'target',
        description: 'Status motivasi dan semangat',
        color: '#3B82F6',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cinta',
        slug: 'cinta',
        icon: 'heart',
        description: 'Status cinta dan romantis',
        color: '#EC4899',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sedih',
        slug: 'sedih',
        icon: 'cloud-rain',
        description: 'Status sedih dan galau',
        color: '#6366F1',
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Ucapan',
        slug: 'ucapan',
        icon: 'message-square',
        description: 'Ucapan selamat, ucapan hari raya, dll',
        color: '#8B5CF6',
        order: 6,
      },
    }),
  ])
  console.log('📂 Created', categories.length, 'categories')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Viral', slug: 'viral' } }),
    prisma.tag.create({ data: { name: 'HD', slug: 'hd' } }),
    prisma.tag.create({ data: { name: '4K', slug: '4k' } }),
    prisma.tag.create({ data: { name: 'Pendek', slug: 'pendek' } }),
    prisma.tag.create({ data: { name: 'Full Screen', slug: 'full-screen' } }),
    prisma.tag.create({ data: { name: 'No Watermark', slug: 'no-watermark' } }),
    prisma.tag.create({ data: { name: 'Trending', slug: 'trending' } }),
    prisma.tag.create({ data: { name: 'WhatsApp', slug: 'whatsapp' } }),
    prisma.tag.create({ data: { name: 'Status', slug: 'status' } }),
    prisma.tag.create({ data: { name: 'Gratis', slug: 'gratis' } }),
  ])
  console.log('🏷️  Created', tags.length, 'tags')

  // Sample status data (using placeholder Cloudinary URLs)
  // In production, these would be real Cloudinary URLs
  const sampleStatuses = [
    {
      title: 'Lucu Banget! Anak Kecil Ngomong Ngaco',
      description: 'Video lucu anak kecil yang ngomongnya ngaco banget bikin ngakak tersendiri. Cocok buat status WA biar temen-temen ikut seneng.',
      type: 'VIDEO',
      categorySlug: 'lucu',
      duration: 15,
      size: 2500000,
      resolution: '1080x1920',
      tags: ['viral', 'hd', 'lucu', 'anak', 'whatsapp'],
      views: 15420,
      downloads: 3210,
      status: 'APPROVED',
    },
    {
      title: 'Doa Sebelum Tidur - Voice Merdu',
      description: 'Doa sebelum tidur dengan suara yang merdu dan menenangkan. Bikin hati jadi tenang sebelum tidur.',
      type: 'VIDEO',
      categorySlug: 'islami',
      duration: 30,
      size: 4200000,
      resolution: '1080x1920',
      tags: ['islami', 'doa', 'hd', 'tenang', 'whatsapp'],
      views: 28750,
      downloads: 8920,
      status: 'APPROVED',
    },
    {
      title: 'Motivasi Pagi: Bangun & Berlari!',
      description: 'Video motivasi pagi hari yang bikin semangat bangun tidur dan olahraga. Jangan biarkan kemalasan mengalahkan mimpi kamu!',
      type: 'VIDEO',
      categorySlug: 'motivasi',
      duration: 45,
      size: 6800000,
      resolution: '1080x1920',
      tags: ['motivasi', 'pagi', 'olahraga', 'semangat', 'hd'],
      views: 42100,
      downloads: 12500,
      status: 'APPROVED',
    },
    {
      title: 'Quote Cinta: Kamu Adalah Alasanku',
      description: 'Gambar aesthetic dengan quote cinta yang romantis. Cocok buat status buat pacar atau crush.',
      type: 'IMAGE',
      categorySlug: 'cinta',
      size: 850000,
      resolution: '1080x1920',
      tags: ['cinta', 'romantis', 'aesthetic', 'quote', 'hd'],
      views: 18900,
      downloads: 5670,
      status: 'APPROVED',
    },
    {
      title: 'Sedih: Kenangan yang Tak Terhapus',
      description: 'Video sedih tentang kenangan mantan yang masih tersimpan di hati. Bikin nangis lihatnya.',
      type: 'VIDEO',
      categorySlug: 'sedih',
      duration: 50,
      size: 7200000,
      resolution: '1080x1920',
      tags: ['sedih', 'galau', 'mantan', 'kenangan', 'hd'],
      views: 31200,
      downloads: 7800,
      status: 'APPROVED',
    },
    {
      title: 'Ucapan Selamat Idul Fitri 1445 H',
      description: 'Kartu ucapan Idul Fitri yang indah dan elegan. Bisa dikirim ke keluarga dan teman-teman.',
      type: 'IMAGE',
      categorySlug: 'ucapan',
      size: 1200000,
      resolution: '1080x1920',
      tags: ['lebaran', 'idulfitri', 'ucapan', 'kartu', 'hd'],
      views: 55600,
      downloads: 18900,
      status: 'APPROVED',
    },
    {
      title: 'Kucing Lucu Mainin Kotak Kardus',
      description: 'Video kucing lucu main kotak kardus. Hewan peliharaan paling lucu di dunia!',
      type: 'VIDEO',
      categorySlug: 'lucu',
      duration: 20,
      size: 3100000,
      resolution: '1080x1920',
      tags: ['kucing', 'hewan', 'lucu', 'viral', 'hd'],
      views: 67800,
      downloads: 21000,
      status: 'APPROVED',
    },
    {
      title: 'Ayat Kursi - Bacaan Lengkap',
      description: 'Video Ayat Kursi dengan bacaan lengkap dan terjemahan. Bermanfaat untuk dibaca setiap hari.',
      type: 'VIDEO',
      categorySlug: 'islami',
      duration: 60,
      size: 9500000,
      resolution: '1080x1920',
      tags: ['ayatkursi', 'alquran', 'bacaan', 'islami', 'hd'],
      views: 89300,
      downloads: 34200,
      status: 'APPROVED',
    },
    {
      title: 'Jangan Menyerah - Motivasi Hidup',
      description: 'Kutipan motivasi: "Jangan menyerah, saat paling sulit itu tanda kemenangan sudah dekat." Background aesthetic gelap.',
      type: 'IMAGE',
      categorySlug: 'motivasi',
      size: 920000,
      resolution: '1080x1920',
      tags: ['motivasi', 'quote', 'hidup', 'menyerah', 'aesthetic', 'hd'],
      views: 23400,
      downloads: 6700,
      status: 'APPROVED',
    },
    {
      title: 'Ucapan Selamat Ulang Tahun Aesthetic',
      description: 'Template ucapan ulang tahun yang aesthetic dan modern. Bisa edit nama sendiri.',
      type: 'IMAGE',
      categorySlug: 'ucapan',
      size: 1100000,
      resolution: '1080x1920',
      tags: ['ultah', 'ulangtahun', 'ucapan', 'aesthetic', 'template', 'hd'],
      views: 41200,
      downloads: 13400,
      status: 'APPROVED',
    },
  ]

  // Create statuses
  for (let i = 0; i < sampleStatuses.length; i++) {
    const s = sampleStatuses[i]
    const category = categories.find((c) => c.slug === s.categorySlug)
    if (!category) continue

    const statusTags = tags.filter((t) => s.tags.includes(t.slug))

    const slugBase = slugify(s.title)
    const slug = `${slugBase}-${i + 1}`

    const cloudinaryBase = 'https://res.cloudinary.com/demo/video/upload'
    const isVideo = s.type === 'VIDEO'

    await prisma.status.create({
      data: {
        slug,
        title: s.title,
        description: s.description,
        type: s.type,
        url: `${cloudinaryBase}/v1/sample-${isVideo ? 'video' : 'image'}-${i + 1}.${isVideo ? 'mp4' : 'jpg'}`,
        thumbnail: `https://res.cloudinary.com/demo/image/upload/v1/sample-thumb-${i + 1}.jpg`,
        duration: s.duration,
        size: s.size,
        resolution: s.resolution,
        views: s.views,
        downloads: s.downloads,
        status: s.status,
        publishedAt: new Date(Date.now() - i * 86400000), // staggered dates
        categoryId: category.id,
        authorId: i % 2 === 0 ? admin.id : demoUser.id,
        tags: {
          connect: statusTags.map((t) => ({ id: t.id })),
        },
      },
    })
  }
  console.log('📹 Created', sampleStatuses.length, 'sample statuses')

  // Create some pending statuses for moderation demo
  const pendingStatuses = [
    {
      title: 'Video Baru: Testing Upload',
      description: 'Status ini masih pending moderasi',
      type: 'VIDEO',
      categorySlug: 'lucu',
      duration: 10,
      size: 1500000,
      resolution: '720x1280',
      tags: ['test', 'pending'],
      status: 'PENDING',
    },
    {
      title: 'Gambar Test Rejected',
      description: 'Ini contoh yang ditolak',
      type: 'IMAGE',
      categorySlug: 'motivasi',
      size: 500000,
      resolution: '1080x1920',
      tags: ['test', 'rejected'],
      status: 'REJECTED',
      rejectionReason: 'Konten tidak sesuai kategori',
    },
  ]

  for (let i = 0; i < pendingStatuses.length; i++) {
    const s = pendingStatuses[i]
    const category = categories.find((c) => c.slug === s.categorySlug)
    if (!category) continue

    const statusTags = tags.filter((t) => s.tags.includes(t.slug))

    const slugBase = slugify(s.title)
    const slug = `${slugBase}-pending-${i + 1}`

    await prisma.status.create({
      data: {
        slug,
        title: s.title,
        description: s.description,
        type: s.type,
        url: `https://res.cloudinary.com/demo/video/upload/v1/sample-${s.type === 'VIDEO' ? 'video' : 'image'}-pending-${i + 1}.${s.type === 'VIDEO' ? 'mp4' : 'jpg'}`,
        thumbnail: `https://res.cloudinary.com/demo/image/upload/v1/sample-thumb-pending-${i + 1}.jpg`,
        duration: s.duration,
        size: s.size,
        resolution: s.resolution,
        views: 0,
        downloads: 0,
        status: s.status,
        rejectionReason: s.rejectionReason,
        categoryId: category.id,
        authorId: demoUser.id,
        tags: {
          connect: statusTags.map((t) => ({ id: t.id })),
        },
      },
    })
  }
  console.log('⏳ Created', pendingStatuses.length, 'pending/rejected statuses')

  console.log('✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })