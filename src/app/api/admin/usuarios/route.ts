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

export async function GET(request: NextRequest) {
  const decoded = await verifyAdmin(request)
  if (!decoded) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const snapshot = await getAdminDb().collection('admins').get()
  const users = []

  for (const d of snapshot.docs) {
    try {
      const firebaseUser = await getAdminAuth().getUser(d.id)
      users.push({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        createdAt: (d.data().createdAt as string) ?? new Date().toISOString(),
      })
    } catch {
      // Firebase Auth user no longer exists; skip
    }
  }

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const decoded = await verifyAdmin(request)
  if (!decoded) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { email, password, displayName } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
  }

  try {
    const newUser = await getAdminAuth().createUser({
      email,
      password,
      displayName: displayName ?? '',
    })

    await getAdminDb().collection('admins').doc(newUser.uid).set({
      email,
      displayName: displayName ?? '',
      createdAt: new Date().toISOString(),
      createdBy: decoded.uid,
    })

    return NextResponse.json({ uid: newUser.uid, email: newUser.email })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear usuario'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
