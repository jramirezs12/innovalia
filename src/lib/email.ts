import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export interface DownloadNotification {
  documentTitle: string | null
  documentYear: number | null
  ip: string
  location: string
  device: string
  createdAt: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://innovalia.org'

/** Correos de todos los administradores registrados. */
async function getAdminEmails(): Promise<string[]> {
  try {
    const snap = await getAdminDb().collection('admins').get()
    const emails: string[] = []
    for (const d of snap.docs) {
      const data = d.data() as { email?: string }
      if (data.email) {
        emails.push(data.email)
        continue
      }
      try {
        const u = await getAdminAuth().getUser(d.id)
        if (u.email) emails.push(u.email)
      } catch {
        // El usuario de Auth ya no existe; se omite.
      }
    }
    return Array.from(new Set(emails))
  } catch {
    return []
  }
}

function buildHtml(info: DownloadNotification): string {
  const adminUrl = `${SITE_URL}/admin/accesos`
  const fecha = new Date(info.createdAt).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const doc = info.documentTitle ?? 'Estado financiero'
  const year = info.documentYear ? ` (${info.documentYear})` : ''

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:#71717a;font-size:13px;vertical-align:top;width:120px;">${label}</td>
      <td style="padding:8px 0;color:#18181b;font-size:13px;font-weight:600;">${value || '—'}</td>
    </tr>`

  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e4e7;">
        <!-- Header -->
        <tr>
          <td style="background:#141f49;padding:24px 28px;">
            <img src="${SITE_URL}/logo-innovalia-white.png" alt="Fundación INNOVALIA" height="34" style="height:34px;display:block;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 4px;color:#0e8fa6;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Alerta de descarga</p>
            <h1 style="margin:0 0 16px;color:#18181b;font-size:20px;">Se descargó un estado financiero</h1>
            <p style="margin:0 0 20px;color:#52525b;font-size:14px;line-height:1.6;">
              Un visitante descargó el siguiente documento del sitio web:
            </p>

            <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:16px 18px;margin-bottom:22px;">
              <p style="margin:0;color:#18181b;font-size:15px;font-weight:700;">${doc}${year}</p>
            </div>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;">
              ${row('Fecha y hora', fecha)}
              ${row('Ubicación', info.location)}
              ${row('IP', info.ip)}
              ${row('Dispositivo', info.device)}
            </table>

            <!-- Botón -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
              <tr>
                <td style="border-radius:8px;background:#141f49;">
                  <a href="${adminUrl}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
                    Ver detalle del acceso →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;color:#a1a1aa;font-size:12px;">
              O abre: <a href="${adminUrl}" style="color:#52525b;">${adminUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;border-top:1px solid #e4e4e7;padding:18px 28px;">
            <p style="margin:0;color:#a1a1aa;font-size:11px;line-height:1.5;">
              Notificación automática del panel de administración de Fundación INNOVALIA.
              Recibes este correo porque eres administrador del sitio.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Envía una notificación por correo a los administradores cuando se descarga
 * un documento. Es un no-op silencioso si Resend no está configurado, para no
 * interrumpir nunca el registro de accesos.
 */
export async function sendDownloadNotification(info: DownloadNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return // Correo no configurado todavía.

  const from = process.env.RESEND_FROM ?? 'Fundación INNOVALIA <onboarding@resend.dev>'

  const to = await getAdminEmails()
  if (to.length === 0) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `📥 Descarga: ${info.documentTitle ?? 'Estado financiero'}`,
        html: buildHtml(info),
      }),
    })
  } catch {
    // No interrumpir por un fallo de envío de correo.
  }
}
