'use client'

import { AuthProvider, useAuth } from '@/lib/auth-context'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  LayoutDashboard,
  LogOut,
  Globe,
  Loader2,
  ChevronRight,
  Menu,
  X,
  Activity,
} from 'lucide-react'
import clsx from 'clsx'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/accesos', label: 'Accesos', icon: Activity, exact: false },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, exact: false },
]

function SidebarContent({
  pathname,
  onSignOut,
  onClose,
}: {
  pathname: string
  onSignOut: () => void
  onClose?: () => void
}) {
  return (
    <div className="w-60 h-full bg-navy-950 flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-navy-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo-mark-white.png"
            alt="INNOVALIA"
            width={359}
            height={203}
            className="h-8 w-auto shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate">
              Fundación INNOVALIA
            </p>
            <p className="text-slate-500 text-xs">Administración</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {adminNav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-navy-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-navy-800'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-navy-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <Globe className="w-4 h-4" /> Ver sitio web
        </Link>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!loading && !isLoginPage && (!user || !isAdmin)) {
      router.replace('/admin/login')
    }
  }, [user, loading, isAdmin, isLoginPage, router])

  // Cierra el drawer al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isLoginPage) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  async function handleSignOut() {
    await signOut()
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar — escritorio */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col">
        <SidebarContent pathname={pathname} onSignOut={handleSignOut} />
      </aside>

      {/* Overlay oscuro — móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer — móvil */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          pathname={pathname}
          onSignOut={handleSignOut}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3">
          {/* Hamburger — solo móvil */}
          <button
            className="md:hidden p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 truncate ml-auto">{user.email}</p>
        </div>

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  )
}
