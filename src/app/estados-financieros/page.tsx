'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase'
import type { EstadoFinanciero } from '@/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, Download, Eye, Calendar, HardDrive, Loader2 } from 'lucide-react'

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function logAccess(documento: EstadoFinanciero, action: 'view' | 'download') {
  try {
    const payload = JSON.stringify({
      documentId: documento.id,
      title: documento.title,
      year: documento.year,
      action,
    })
    const blob = new Blob([payload], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/access-log', blob)
    } else {
      fetch('/api/access-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // El registro nunca debe interrumpir la navegación del usuario.
  }
}

export default function EstadosFinancierosPage() {
  const [docs, setDocs] = useState<EstadoFinanciero[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      try {
        const db = firebaseDb()
        const q = query(collection(db, 'estados-financieros'), orderBy('year', 'desc'))
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EstadoFinanciero))
        setDocs(data)
      } catch (err) {
        console.error('Error al cargar documentos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const byYear = docs.reduce<Record<number, EstadoFinanciero[]>>((acc, doc) => {
    if (!acc[doc.year]) acc[doc.year] = []
    acc[doc.year].push(doc)
    return acc
  }, {})

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <>
      <Navbar />

      <div className="bg-navy-900 pt-28 pb-14 text-center">
        <div className="section-container">
          <FileText className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Estados Financieros</h1>
          <p className="text-slate-300 max-w-xl mx-auto">
            Documentos financieros anuales de la Fundación INNOVALIA, publicados en cumplimiento
            de los requerimientos de la DIAN para entidades sin ánimo de lucro.
          </p>
        </div>
      </div>

      <main className="py-16 bg-slate-50 min-h-[60vh]">
        <div className="section-container">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p>Cargando documentos...</p>
            </div>
          ) : years.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No hay documentos disponibles aún.</p>
              <p className="text-sm mt-1">Los estados financieros serán publicados próximamente.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {years.map((year) => (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="bg-navy-900 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                      {year}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {byYear[year].map((doc) => (
                      <div key={doc.id} className="card hover:shadow-md transition-shadow group">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-navy-900 text-sm leading-snug group-hover:text-navy-700 transition-colors">
                              {doc.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.filename}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.uploadedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatBytes(doc.size)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => logAccess(doc, 'view')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-navy-900 border border-navy-200 hover:bg-navy-50 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver
                          </a>
                          <a
                            href={doc.url}
                            download={doc.filename}
                            onClick={() => logAccess(doc, 'download')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-navy-900 hover:bg-navy-700 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
