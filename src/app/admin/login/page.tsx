'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace('/admin')
    }
  }, [user, isAdmin, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(firebaseAuth(), email, password)
      router.replace('/admin')
    } catch {
      setError('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 to-navy-800 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo-innovalia-white.png"
            alt="Fundación INNOVALIA"
            width={553}
            height={286}
            priority
            className="h-12 w-auto mx-auto mb-4"
          />
          <p className="text-slate-400 text-sm mt-1">Panel de Administración</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-navy-900 text-xl font-semibold mb-6">Iniciar sesión</h2>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
