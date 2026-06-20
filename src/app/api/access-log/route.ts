import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { sendDownloadNotification } from '@/lib/email'

export const dynamic = 'force-dynamic'

function parseUserAgent(ua: string) {
  const u = ua.toLowerCase()

  let os = 'Desconocido'
  if (/windows nt/.test(u)) os = 'Windows'
  else if (/android/.test(u)) os = 'Android'
  else if (/iphone|ipad|ipod/.test(u)) os = 'iOS'
  else if (/mac os x|macintosh/.test(u)) os = 'macOS'
  else if (/linux/.test(u)) os = 'Linux'

  let browser = 'Desconocido'
  if (/edg\//.test(u)) browser = 'Edge'
  else if (/opr\/|opera/.test(u)) browser = 'Opera'
  else if (/chrome\//.test(u) && !/edg\//.test(u)) browser = 'Chrome'
  else if (/firefox\//.test(u)) browser = 'Firefox'
  else if (/safari\//.test(u) && !/chrome/.test(u)) browser = 'Safari'

  let device = 'Computador'
  if (/ipad|tablet/.test(u)) device = 'Tablet'
  else if (/mobile|iphone|android/.test(u)) device = 'Móvil'

  return { browser, os, device }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { documentId, title, year, action } = body as {
      documentId?: string
      title?: string
      year?: number
      action?: string
    }

    const h = request.headers
    const decode = (v: string | null) => {
      if (!v) return ''
      try {
        return decodeURIComponent(v)
      } catch {
        return v
      }
    }

    const ipRaw = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? ''
    const ip = ipRaw.split(',')[0].trim() || 'Desconocida'
    const ua = h.get('user-agent') ?? ''
    const { browser, os, device } = parseUserAgent(ua)
    const city = decode(h.get('x-vercel-ip-city'))
    const region = decode(h.get('x-vercel-ip-country-region'))
    const country = h.get('x-vercel-ip-country') ?? ''
    const resolvedAction = action === 'download' ? 'download' : 'view'
    const createdAt = new Date().toISOString()

    await getAdminDb()
      .collection('access-logs')
      .add({
        documentId: documentId ?? null,
        documentTitle: title ?? null,
        documentYear: typeof year === 'number' ? year : null,
        action: resolvedAction,
        ip,
        city,
        region,
        country,
        timezone: h.get('x-vercel-ip-timezone') ?? '',
        latitude: h.get('x-vercel-ip-latitude') ?? '',
        longitude: h.get('x-vercel-ip-longitude') ?? '',
        userAgent: ua,
        browser,
        os,
        device,
        language: (h.get('accept-language') ?? '').split(',')[0] ?? '',
        referer: h.get('referer') ?? '',
        createdAt,
      })

    // Notificar a los administradores solo en descargas.
    if (resolvedAction === 'download') {
      const location = [city, region, country].filter(Boolean).join(', ') || 'Desconocida'
      const deviceLabel =
        [browser, os].filter((p) => p && p !== 'Desconocido').join(' · ') || 'Desconocido'
      await sendDownloadNotification({
        documentTitle: title ?? null,
        documentYear: typeof year === 'number' ? year : null,
        ip,
        location,
        device: device ? `${deviceLabel} (${device})` : deviceLabel,
        createdAt,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Nunca interrumpimos al visitante por un fallo de registro.
    return NextResponse.json({ ok: false })
  }
}
