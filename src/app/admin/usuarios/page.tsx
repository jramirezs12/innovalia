'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { AdminUser } from '@/types'
import {
  UserPlus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  X,
} from 'lucide-react'

async function getAuthHeader(user: { getIdToken: () => Promise<string> }) {
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export default function UsuariosPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add user form
  const [showForm, setShowForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const [deletingUid, setDeletingUid] = useState<string | null>(null)

  async function fetchUsers() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const headers = await getAuthHeader(user)
      const res = await fetch('/api/admin/usuarios', { headers })
      if (!res.ok) throw new Error('No autorizado')
      const data = await res.json()
      setUsers(data)
    } catch {
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setAdding(true)
    setAddError('')
    setAddSuccess('')
    try {
      const headers = {
        ...(await getAuthHeader(user)),
        'Content-Type': 'application/json',
      }
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: newEmail, password: newPassword, displayName: newName }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al crear usuario')
      }
      setAddSuccess(`Usuario ${newEmail} creado correctamente.`)
      setNewEmail('')
      setNewPassword('')
      setNewName('')
      setShowForm(false)
      await fetchUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setAddError(msg)
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(uid: string, email: string) {
    if (!user) return
    if (!confirm(`¿Eliminar al administrador ${email}? Perderá acceso inmediatamente.`)) return
    if (uid === user.uid) {
      alert('No puedes eliminarte a ti mismo.')
      return
    }
    setDeletingUid(uid)
    try {
      const headers = await getAuthHeader(user)
      await fetch(`/api/admin/usuarios/${uid}`, { method: 'DELETE', headers })
      setUsers((prev) => prev.filter((u) => u.uid !== uid))
    } finally {
      setDeletingUid(null)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-500" /> Administradores
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setAddError('')
            setAddSuccess('')
          }}
          className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Agregar administrador'}
        </button>
      </div>

      {/* Add user form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Nuevo administrador</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña temporal
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="Nombre completo"
              />
            </div>

            {addError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {addError}
              </div>
            )}

            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {adding ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Crear administrador</>
              )}
            </button>
          </form>
        </div>
      )}

      {addSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {addSuccess}
        </div>
      )}

      {/* Users list */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : (
          <>
            {/* Cards — móvil */}
            <div className="sm:hidden space-y-3">
              {users.map((u) => (
                <div key={u.uid} className="border border-slate-100 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 text-sm truncate">{u.email}</p>
                      {u.uid === user?.uid && (
                        <span className="text-xs bg-navy-50 text-navy-700 font-medium px-2 py-0.5 rounded-full shrink-0">
                          Tú
                        </span>
                      )}
                    </div>
                    {u.displayName && (
                      <p className="text-xs text-slate-400 mt-0.5">{u.displayName}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(u.createdAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(u.uid, u.email)}
                    disabled={deletingUid === u.uid || u.uid === user?.uid}
                    title={u.uid === user?.uid ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    {deletingUid === u.uid ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Tabla — sm+ */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4">
                    Usuario
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3">
                    Agregado
                  </th>
                  <th className="pb-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">{u.email}</p>
                      {u.displayName && (
                        <p className="text-xs text-slate-400">{u.displayName}</p>
                      )}
                      {u.uid === user?.uid && (
                        <span className="text-xs bg-navy-50 text-navy-700 font-medium px-2 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(u.uid, u.email)}
                        disabled={deletingUid === u.uid || u.uid === user?.uid}
                        title={u.uid === user?.uid ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {deletingUid === u.uid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
