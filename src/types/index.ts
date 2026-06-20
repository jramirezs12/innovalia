export interface EstadoFinanciero {
  id: string
  year: number
  title: string
  filename: string
  url: string
  storagePath: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

export interface AdminUser {
  uid: string
  email: string
  displayName?: string
  createdAt: string
}

export interface AccessLog {
  id: string
  documentId: string | null
  documentTitle: string | null
  documentYear: number | null
  action: 'view' | 'download'
  ip: string
  city: string
  region: string
  country: string
  timezone: string
  latitude: string
  longitude: string
  userAgent: string
  browser: string
  os: string
  device: string
  language: string
  referer: string
  createdAt: string
}
