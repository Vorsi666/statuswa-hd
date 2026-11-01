# StatusWA HD - Platform Status WhatsApp HD 1080p

Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p. Dibangun dengan Next.js 14, TypeScript, Tailwind CSS, dan Prisma.

## 🚀 Fitur Utama

- **Homepage** dengan hero section, trending status, kategori, dan statistik
- **Jelajahi (/explore)** dengan filter kategori, tipe, durasi, sort, infinite scroll
- **Detail Status (/status/[slug])** dengan video player custom, OG tags untuk share WA
- **Upload (/upload)** drag & drop, validasi file, progress bar, preview
- **Dashboard (/dashboard)** kelola upload, bookmark, statistik
- **Auth** NextAuth.js (Google, GitHub, Credentials)
- **Admin Panel (/admin)** moderasi, kelola kategori, laporan, statistik
- **PWA** installable, offline support
- **Dark Mode** dengan next-themes
- **SEO-friendly** metadata dinamis, sitemap, robots.txt, JSON-LD

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL (production), SQLite (development) |
| Storage | Cloudinary |
| Auth | NextAuth.js v5 |
| State | Zustand + React Query |
| Validation | Zod |
| Upload | React Dropzone + Cloudinary signed upload |

## 📦 Instalasi

### Prasyarat

- Node.js 18+
- PostgreSQL (atau gunakan SQLite untuk development)
- Akun Cloudinary
- Akun Google Cloud Console (untuk OAuth)
- Akun GitHub (untuk OAuth, opsional)

### 1. Clone & Install

```bash
git clone <repository-url>
cd statuswa-hd
npm install
```

### 2. Setup Environment

Copy `.env.example` ke `.env` dan isi nilai-nilainya:

```bash
cp .env.example .env
```

Variabel wajib:
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/statuswa_hd"
# Atau untuk development: DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Atau migrasi (production)
npm run db:migrate

# Seed data contoh
npm run db:seed
```

### 4. Jalankan Development

```bash
npm run dev
```

Buka http://localhost:3000

## 🔧 Konfigurasi Cloudinary

### 1. Buat Upload Presets

Di Cloudinary Dashboard → Settings → Upload → Upload presets, buat 2 preset:

**statuswa_hd_video** (Signed):
- Mode: Signed
- Folder: statuswa-hd/videos
- Resource type: Video
- Allowed formats: mp4
- Max file size: 50MB
- Video max duration: 60s

**statuswa_hd_image** (Signed):
- Mode: Signed
- Folder: statuswa-hd/images
- Resource type: Image
- Allowed formats: jpg, png, webp
- Max file size: 50MB

### 2. Transformations

Cloudinary akan otomatis generate thumbnail untuk video dengan transformasi:
- `w_400,h_711,c_fill,g_auto,q_auto:low` untuk thumbnail
- `q_auto,f_auto` untuk optimasi gambar

## 📁 Struktur Proyek

```
statuswa-hd/
├── app/
│   ├── (public)/          # Public routes
│   │   ├── page.tsx       # Homepage
│   │   ├── explore/       # Jelajahi status
│   │   └── status/[slug]/ # Detail status
│   ├── (auth)/            # Auth routes
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/       # Protected routes
│   │   ├── dashboard/
│   │   └── upload/
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── status-card.tsx
│   ├── video-player.tsx
│   ├── navbar.tsx
│   └── footer.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── validators.ts
│   ├── utils.ts
│   └── store.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── hooks/
│   └── use-toast.ts
├── public/
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🗄️ Database Schema

Model utama:
- **User** - Pengguna (role: USER/ADMIN)
- **Status** - Video/gambar status (status: PENDING/APPROVED/REJECTED)
- **Category** - Kategori status (Lucu, Islami, Motivasi, dll)
- **Tag** - Tag untuk pencarian
- **Bookmark** - Bookmark user
- **Report** - Laporan konten

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/statuses` | List status dengan filter & pagination |
| GET | `/api/statuses/[slug]` | Detail status by slug |
| POST | `/api/statuses` | Create status (auth) |
| PATCH | `/api/statuses/[id]` | Update status (owner/admin) |
| DELETE | `/api/statuses/[id]` | Delete status (owner/admin) |
| POST | `/api/statuses/[id]/view` | Increment views |
| POST | `/api/statuses/[id]/download` | Increment downloads |
| POST | `/api/upload/sign` | Get Cloudinary signed upload params |
| GET | `/api/categories` | List categories |
| POST | `/api/bookmarks` | Toggle bookmark |
| POST | `/api/reports` | Create report |
| GET | `/api/admin/statuses` | Admin: list all statuses |
| PATCH | `/api/admin/statuses` | Admin: moderate status |
| PATCH | `/api/admin/reports/[id]` | Admin: resolve report |

## 🎨 Customization

### Tambah Kategori Baru

1. Via Admin Panel: `/admin` → tab Kategori
2. Via Database: `prisma category create`
3. Via Seed: Edit `prisma/seed.ts`

### Ubah Tema Warna

Edit `tailwind.config.ts` → `theme.extend.colors`

### Tambah Validasi Upload

Edit `lib/validators.ts` → `uploadInitSchema`

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. New Project → Import dari GitHub
3. Framework: Next.js
4. Environment Variables: Tambahkan semua dari `.env`
5. Deploy

### 3. Setup Database Production

Gunakan [Neon](https://neon.tech) atau [Supabase](https://supabase.com) untuk PostgreSQL:
1. Buat project baru
2. Copy connection string ke `DATABASE_URL`
3. Run migration: `npx prisma migrate deploy`

### 4. Setup Cloudinary Production

Pastikan upload presets sudah dibuat di Cloudinary Dashboard.

## 📱 PWA Support

Aplikasi sudah PWA-ready dengan:
- `public/site.webmanifest` - Manifest file
- Service worker (Next.js built-in)
- Icons di `public/icons/`
- Install prompt otomatis di mobile

## 🔒 Security

- **Rate Limiting** - Upstash Redis (tambahkan di `middleware.ts`)
- **CSRF Protection** - NextAuth built-in
- **XSS Protection** - React auto-escape + headers
- **SQL Injection** - Prisma parameterized queries
- **File Upload** - Validasi tipe, ukuran, durasi di client & server

## 🧪 Testing

```bash
# Linting
npm run lint

# Type check
npx tsc --noEmit

# Build check
npm run build
```

## 📄 License

MIT License - bebas digunakan untuk project pribadi maupun komersial.

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📞 Support

- **Email**: hello@statuswa-hd.com
- **GitHub Issues**: [Repository Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

**StatusWA HD** - Dibangun dengan ❤️ untuk komunitas Indonesia