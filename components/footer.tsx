import Link from 'next/link'
import { Github, Twitter, Instagram, Youtube, Mail, Heart, Code2, Globe, Shield, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const footerLinks = {
  product: [
    { name: 'Beranda', href: '/' },
    { name: 'Jelajahi Status', href: '/explore' },
    { name: 'Kategori', href: '/categories' },
    { name: 'Trending', href: '/trending' },
    { name: 'Terbaru', href: '/explore?sort=terbaru' },
    { name: 'Paling Populer', href: '/explore?sort=terpopuler' },
  ],
  features: [
    { name: 'Download HD', href: '/features/download' },
    { name: 'Bagikan ke WA', href: '/features/share' },
    { name: 'Bookmark', href: '/bookmarks' },
    { name: 'Mode Gelap', href: '/features/dark-mode' },
    { name: 'PWA Install', href: '/features/pwa' },
    { name: 'API', href: '/api/docs' },
  ],
  support: [
    { name: 'Bantuan', href: '/help' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Kontak Kami', href: '/contact' },
    { name: 'Lapor Konten', href: '/report' },
    { name: 'Kebijakan Privasi', href: '/privacy' },
    { name: 'Syarat Ketentuan', href: '/terms' },
  ],
  legal: [
    { name: 'DMCA', href: '/dmca' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
}

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github, label: 'Kode sumber di GitHub' },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter, label: 'Ikuti di Twitter' },
  { name: 'Instagram', href: 'https://instagram.com', icon: Instagram, label: 'Ikuti di Instagram' },
  { name: 'YouTube', href: 'https://youtube.com', icon: Youtube, label: 'Tonton di YouTube' },
  { name: 'Email', href: 'mailto:hello@statuswa-hd.com', icon: Mail, label: 'Kirim email' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2" aria-label="StatusWA HD - Beranda">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-whatsapp-green">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-1.646-4.45 9.877 9.877 0 015.281-5.598 9.868 9.868 0 015.422 1.387 9.865 9.865 0 011.847 4.306c-.082.928-.304 1.793-.71 2.56a9.882 9.882 0 01-5.143 3.163zm-.007-11.579c-3.265 0-5.903 2.638-5.903 5.884 0 1.362.54 2.574 1.414 3.47.793.81 1.822 1.688 3.04 2.542 1.176.823 2.156 1.483 2.432 1.645.08.048.159.05.238-.051.155-.195.705-.839 1.191-1.47.555-.717 1.164-1.579 1.473-2.067.36-.574.568-1.132.568-1.708 0-2.593-2.11-4.675-4.714-4.675z"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-foreground">StatusWA HD</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Platform terbaik untuk menonton, mengunduh, dan membagikan video/gambar status WhatsApp berkualitas HD 1080p.
              Gratis, cepat, dan tanpa watermark.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    'text-muted-foreground hover:text-foreground transition-colors',
                    'h-9 w-9 flex items-center justify-center rounded-lg bg-muted hover:bg-accent'
                  )}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 grid grid-cols-2 gap-8 md:grid-cols-4 mt-12 xl:mt-0">
            <div>
              <h3 className="font-semibold text-sm">Produk</h3>
              <ul className="mt-4 space-y-3" role="list">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Fitur</h3>
              <ul className="mt-4 space-y-3" role="list">
                {footerLinks.features.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Dukungan</h3>
              <ul className="mt-4 space-y-3" role="list">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Legal</h3>
              <ul className="mt-4 space-y-3" role="list">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} StatusWA HD. Dibangun dengan{' '}
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" aria-hidden="true" />
                <Code2 className="h-3 w-3" aria-hidden="true" />
              </span>{' '}
              menggunakan Next.js, TypeScript, & Tailwind CSS
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                Aman & Privasi
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                HD 1080p
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                Indonesia
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}