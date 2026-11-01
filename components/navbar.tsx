'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, Search, User, LogOut, LayoutDashboard, Settings, Crown, Heart, Upload, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Beranda', href: '/', icon: '🏠' },
  { name: 'Jelajahi', href: '/explore', icon: '🔍' },
  { name: 'Kategori', href: '/categories', icon: '📂' },
  { name: 'Trending', href: '/trending', icon: '🔥' },
]

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Status', href: '/upload', icon: Upload },
  { name: 'Bookmark', href: '/bookmarks', icon: Heart },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Panel Admin', href: '/admin', icon: Crown },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, setUser } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setUser(null)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-200',
        scrolled
          ? 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Navigasi utama">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="StatusWA HD - Beranda">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-whatsapp-green">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-1.646-4.45 9.877 9.877 0 015.281-5.598 9.868 9.868 0 015.422 1.387 9.865 9.865 0 011.847 4.306c-.082.928-.304 1.793-.71 2.56a9.882 9.882 0 01-5.143 3.163zm-.007-11.579c-3.265 0-5.903 2.638-5.903 5.884 0 1.362.54 2.574 1.414 3.47.793.81 1.822 1.688 3.04 2.542 1.176.823 2.156 1.483 2.432 1.645.08.048.159.05.238-.051.155-.195.705-.839 1.191-1.47.555-.717 1.164-1.579 1.473-2.067.36-.574.568-1.132.568-1.708 0-2.593-2.11-4.675-4.714-4.675z"/>
              </svg>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">StatusWA HD</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <Link
              href="/explore"
              className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground hover:bg-accent transition-colors"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Cari status...</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            </Button>

            {user ? (
              <>
                {/* Notification bell */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">3</span>
                </Button>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                        <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium text-sm">{user.name || 'Pengguna'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.role === 'ADMIN' && (
                          <Badge variant="secondary" className="w-fit mt-1">Admin</Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {user.role === 'ADMIN' && (
                      <>
                        <DropdownMenuSeparator />
                        {adminNavigation.map((item) => (
                          <DropdownMenuItem key={item.name} asChild>
                            <Link href={item.href} className="flex items-center gap-2 text-primary">
                              <item.icon className="h-4 w-4" aria-hidden="true" />
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/explore"
                className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Cari status...</span>
              </Link>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-base font-medium',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {user ? (
              <div className="space-y-2">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
                {user.role === 'ADMIN' && adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-2" aria-hidden="true" />
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Masuk</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">Daftar</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}