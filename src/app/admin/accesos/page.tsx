'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { AccessLog } from '@/types'
import {
  Activity,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileDown,
  MapPin,
  Monitor,
  Globe2,
} from 'lucide-react'

async function getAuthHeader(user: { getIdToken: () => Promise<string> }) {
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

function formatDateTime(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function locationOf(log: AccessLog) {
  const parts = [log.city, log.region, log.country].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

function deviceOf(log: AccessLog) {
  const parts = [log.browser, log.os].filter((p) => p && p !== 'Desconocido')
  const base = parts.length ? parts.join(' · ') : 'Desconocido'
  return log.device ? `${base} (${log.device})` : base
}

export default function AccesosPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchLogs() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const headers = await getAuthHeader(user)
      const res = await fetch('/api/admin/access-logs', { headers })
      if (!res.ok) throw new Error('No autorizado')
      const data = await res.json()
      setLogs(data)
    } catch {
      setError('No se pudieron cargar los registros de acceso.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function exportCsv() {
    const cols: { key: keyof AccessLog; label: string }[] = [
      { key: 'createdAt', label: 'Fecha' },
      { key: 'action', label: 'Acción' },
      { key: 'documentTitle', label: 'Documento' },
      { key: 'documentYear', label: 'Año' },
      { key: 'ip', label: 'IP' },
      { key: 'city', label: 'Ciudad' },
      { key: 'region', label: 'Región' },
      { key: 'country', label: 'País' },
      { key: 'timezone', label: 'Zona horaria' },
      { key: 'latitude', label: 'Latitud' },
      { key: 'longitude', label: 'Longitud' },
      { key: 'browser', label: 'Navegador' },
      { key: 'os', label: 'Sistema' },
      { key: 'device', label: 'Dispositivo' },
      { key: 'language', label: 'Idioma' },
      { key: 'referer', label: 'Referente' },
      { key: 'userAgent', label: 'User-Agent' },
    ]
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = cols.map((c) => escape(c.label)).join(',')
    const rows = logs.map((log) => cols.map((c) => escape(log[c.key])).join(','))
    const csv = '﻿' + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accesos-estados-financieros.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const total = logs.length
  const views = logs.filter((l) => l.action === 'view').length
  const downloads = logs.filter((l) => l.action === 'download').length
  const uniqueIps = new Set(logs.map((l) => l.ip).filter((ip) => ip && ip !== 'Desconocida')).size

  const stats = [
    { label: 'Accesos totales', value: total, icon: Activity },
    { label: 'Visualizaciones', value: views, icon: Eye },
    { label: 'Descargas', value: downloads, icon: Download },
    { label: 'IPs únicas', value: uniqueIps, icon: Globe2 },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gold-500" /> Registro de accesos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rastro de quién consulta los estados financieros (vistas y descargas).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /> Actualizar
          </button>
          <button
            onClick={exportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center shrink-0">
              <stat.icon className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacidad */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Estos datos (IP, ubicación aproximada, dispositivo) son datos personales. Su recolección debe
          contar con un aviso de privacidad conforme a la Ley 1581 de 2012 (Habeas Data). La ubicación es
          aproximada y solo está disponible en producción (Vercel).
        </span>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aún no hay accesos registrados.</p>
          </div>
        ) : (
          <>
            {/* Cards — móvil */}
            <div className="lg:hidden space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border border-slate-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        log.action === 'download'
                          ? 'inline-flex items-center gap-1 text-xs font-semibold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-full'
                          : 'inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full'
                      }
                    >
                      {log.action === 'download' ? <Download className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {log.action === 'download' ? 'Descarga' : 'Vista'}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 leading-snug">
                    {log.documentTitle ?? '—'}{' '}
                    {log.documentYear ? <span className="text-slate-400">({log.documentYear})</span> : null}
                  </p>
                  <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-400" /> {locationOf(log)}</p>
                    <p className="flex items-center gap-1.5"><Globe2 className="w-3 h-3 text-slate-400" /> {log.ip}</p>
                    <p className="flex items-center gap-1.5"><Monitor className="w-3 h-3 text-slate-400" /> {deviceOf(log)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla — lg+ */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <th className="pb-3 pr-4">Fecha</th>
                    <th className="pb-3 pr-4">Acción</th>
                    <th className="pb-3 pr-4">Documento</th>
                    <th className="pb-3 pr-4">Ubicación</th>
                    <th className="pb-3 pr-4">IP</th>
                    <th className="pb-3 pr-4">Dispositivo</th>
                    <th className="pb-3">Idioma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors align-top">
                      <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            log.action === 'download'
                              ? 'inline-flex items-center gap-1 text-xs font-semibold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-full'
                              : 'inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full'
                          }
                        >
                          {log.action === 'download' ? <Download className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {log.action === 'download' ? 'Descarga' : 'Vista'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        <span className="font-medium">{log.documentTitle ?? '—'}</span>
                        {log.documentYear ? <span className="text-slate-400"> ({log.documentYear})</span> : null}
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{locationOf(log)}</td>
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{log.ip}</td>
                      <td className="py-3 pr-4 text-slate-500">{deviceOf(log)}</td>
                      <td className="py-3 text-slate-500">{log.language || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
