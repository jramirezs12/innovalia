import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

function getAdminApp() {
  const existing = getApps().find((a) => a.name === 'admin')
  if (existing) return existing

  return initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    },
    'admin'
  )
}

let _auth: Auth | null = null
let _db: Firestore | null = null

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(getAdminApp())
  return _auth
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(getAdminApp())
  return _db
}
