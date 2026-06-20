import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  const decoded = await verifyAdmin(request)
  if (!decoded) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { uid } = params

  if (uid === decoded.uid) {
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
  }

  try {
    await getAdminDb().collection('admins').doc(uid).delete()
    try {
      await getAdminAuth().deleteUser(uid)
    } catch {
      // User may not exist in Firebase Auth; Firestore record already removed
    }
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar usuario'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
