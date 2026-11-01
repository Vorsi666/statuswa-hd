import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'StatusWA HD - Download Video & Gambar Status WhatsApp HD 1080p',
    template: '%s | StatusWA HD',
  },
  description: 'Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p. Gratis, cepat, dan tanpa watermark.',
  keywords: ['status whatsapp', 'download status', 'video status hd', 'gambar status', 'status wa', 'whatsapp status', 'status hd 1080p'],
  authors: [{ name: 'StatusWA HD' }],
  creator: 'StatusWA HD',
  publisher: 'StatusWA HD',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://statuswa-hd.com',
    siteName: 'StatusWA HD',
    title: 'StatusWA HD - Download Video & Gambar Status WhatsApp HD 1080p',
    description: 'Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StatusWA HD - Download Status WhatsApp HD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StatusWA HD - Download Status WhatsApp HD 1080p',
    description: 'Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p.',
    images: ['/og-image.png'],
    creator: '@statuswa_hd',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}