import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

async function verifyAdmin(request: NextRequest) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const decoded = await getAdminAuth().verifyIdToken(auth.substring(7))
    const snap = await getAdminDb().collection('admins').doc(decoded.uid).get()
    if (!snap.exists) return null
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const decoded = await verifyAdmin(request)
  if (!decoded) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const snapshot = await getAdminDb()
    .collection('access-logs')
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .get()

  const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(logs)
}
