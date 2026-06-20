'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { firebaseDb, firebaseStorage } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import type { EstadoFinanciero } from '@/types'
import {
  Upload,
  FileText,
  Trash2,
  Pencil,
  X,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BarChart2,
} from 'lucide-react'
import clsx from 'clsx'

const currentYear = new Date().getFullYear()

function formatBytes(bytes: number) {
  if (!bytes) return '—'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [docs, setDocs] = useState<EstadoFinanciero[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)

  const [year, setYear] = useState(currentYear)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [editing, setEditing] = useState<EstadoFinanciero | null>(null)
  const [editYear, setEditYear] = useState(currentYear)
  const [editTitle, setEditTitle] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  async function fetchDocs() {
    setLoadingDocs(true)
    try {
      const db = firebaseDb()
      const q = query(collection(db, 'estados-financieros'), orderBy('year', 'desc'))
      const snapshot = await getDocs(q)
      setDocs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EstadoFinanciero)))
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') {
      setUploadError('Solo se permiten archivos PDF.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setUploadError('El archivo no puede superar 20 MB.')
      return
    }
    setFile(f)
    setUploadError('')
    if (!title) setTitle(`Estados Financieros ${year}`)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !user) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')
    setUploadProgress(0)

    const safeName = file.name.replace(/\s+/g, '_')
    const storagePath = `estados-financieros/${year}/${Date.now()}_${safeName}`
    const storageRef = ref(firebaseStorage(), storagePath)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        setUploadError(`Error al subir el archivo: ${err.message}`)
        setUploading(false)
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          await addDoc(collection(firebaseDb(), 'estados-financieros'), {
            year,
            title: title || `Estados Financieros ${year}`,
            filename: safeName,
            url,
            storagePath,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user.email ?? user.uid,
          })
          setUploadSuccess('Documento publicado correctamente.')
          setFile(null)
          setTitle('')
          setYear(currentYear)
          if (fileInputRef.current) fileInputRef.current.value = ''
          await fetchDocs()
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido'
          setUploadError(`Error al guardar metadatos: ${msg}`)
        } finally {
          setUploading(false)
        }
      }
    )
  }

  function openEdit(documento: EstadoFinanciero) {
    setEditing(documento)
    setEditYear(documento.year)
    setEditTitle(documento.title)
    setEditError('')
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSavingEdit(true)
    setEditError('')
    try {
      const newTitle = editTitle.trim() || `Estados Financieros ${editYear}`
      await updateDoc(doc(firebaseDb(), 'estados-financieros', editing.id), {
        year: editYear,
        title: newTitle,
      })
      setDocs((prev) =>
        prev
          .map((d) => (d.id === editing.id ? { ...d, year: editYear, title: newTitle } : d))
          .sort((a, b) => b.year - a.year)
      )
      setEditing(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setEditError(`No se pudo guardar: ${msg}`)
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(documento: EstadoFinanciero) {
    if (!confirm(`¿Eliminar "${documento.title}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(documento.id)
    try {
      await deleteDoc(doc(firebaseDb(), 'estados-financieros', documento.id))
      try {
        await deleteObject(ref(firebaseStorage(), documento.storagePath))
      } catch {
        // Storage object may not exist; Firestore record is the source of truth
      }
      setDocs((prev) => prev.filter((d) => d.id !== documento.id))
    } finally {
      setDeletingId(null)
    }
  }

  const totalDocs = docs.length
  const docsThisYear = docs.filter((d) => d.year === currentYear).length

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Total de documentos', value: totalDocs, icon: FileText },
          { label: `Documentos en ${currentYear}`, value: docsThisYear, icon: BarChart2 },
          { label: 'Años con documentos', value: new Set(docs.map((d) => d.year)).size, icon: BarChart2 },
        ].map((stat) => (
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

      {/* Upload form */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-5 flex items-center gap-2">
          <Upload className="w-5 h-5 text-gold-500" /> Subir nuevo documento
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Año fiscal</label>
              <input
                type="number"
                min={2000}
                max={currentYear + 1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Título del documento</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Estados Financieros ${year}`}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Archivo PDF</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                file
                  ? 'border-navy-400 bg-navy-50'
                  : 'border-slate-300 hover:border-navy-400 hover:bg-slate-50'
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3 text-navy-900">
                  <FileText className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Haz clic para seleccionar un PDF</p>
                  <p className="text-xs mt-1">Máximo 20 MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {uploading && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-navy-900 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {uploadSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
            ) : (
              <><Upload className="w-4 h-4" /> Publicar documento</>
            )}
          </button>
        </form>
      </div>

      {/* Document list */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-500" /> Documentos publicados
        </h2>

        {loadingDocs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay documentos publicados aún.</p>
          </div>
        ) : (
          <>
            {/* Cards — móvil */}
            <div className="sm:hidden space-y-3">
              {docs.map((documento) => (
                <div key={documento.id} className="border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 text-sm leading-snug">{documento.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{documento.filename}</p>
                    </div>
                    <span className="bg-navy-50 text-navy-900 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                      {documento.year}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <p className="text-xs text-slate-400">{formatBytes(documento.size)}</p>
                    <div className="flex items-center gap-1">
                      <a href={documento.url} target="_blank" rel="noopener noreferrer" title="Ver PDF"
                        className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </a>
                      <a href={documento.url} download={documento.filename} title="Descargar"
                        className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => openEdit(documento)} title="Editar"
                        className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(documento)} disabled={deletingId === documento.id} title="Eliminar"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === documento.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla — sm+ */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4">Documento</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 w-16">Año</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4">Tamaño</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 hidden md:table-cell">Publicado por</th>
                    <th className="pb-3 w-28" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {docs.map((documento) => (
                    <tr key={documento.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="font-medium text-slate-800 truncate max-w-[200px]">{documento.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 ml-6 truncate max-w-[200px]">{documento.filename}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="bg-navy-50 text-navy-900 text-xs font-semibold px-2.5 py-1 rounded-full">{documento.year}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{formatBytes(documento.size)}</td>
                      <td className="py-3 text-slate-500 text-xs hidden md:table-cell">Administrador</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <a href={documento.url} target="_blank" rel="noopener noreferrer" title="Ver PDF"
                            className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </a>
                          <a href={documento.url} download={documento.filename} title="Descargar"
                            className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                          <button onClick={() => openEdit(documento)} title="Editar"
                            className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(documento)} disabled={deletingId === documento.id} title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                            {deletingId === documento.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de edición */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !savingEdit && setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-gold-500" /> Editar documento
              </h3>
              <button
                onClick={() => setEditing(null)}
                disabled={savingEdit}
                className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Año fiscal</label>
                <input
                  type="number"
                  min={2000}
                  max={currentYear + 1}
                  value={editYear}
                  onChange={(e) => setEditYear(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del documento</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder={`Estados Financieros ${editYear}`}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>

              {editError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {editError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={savingEdit}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {savingEdit ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Guardar cambios</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}