// Crea (o reutiliza) un usuario en Firebase Auth y lo registra como administrador.
//
// Uso:
//   node scripts/seed-admin.mjs <correo> <contraseña> ["Nombre Completo"]
// o con variables de entorno: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
//
// Requiere que .env.local tenga las credenciales FIREBASE_ADMIN_*.

import { readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (!match) continue
  let value = match[2].trim()
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
  process.env[match[1]] = value
}

const email = process.argv[2] ?? process.env.ADMIN_EMAIL
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD
const displayName = process.argv[4] ?? process.env.ADMIN_NAME ?? ''

if (!email || !password) {
  console.error('Uso: node scripts/seed-admin.mjs <correo> <contraseña> ["Nombre"]')
  process.exit(1)
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const auth = getAuth()

let userRecord
try {
  userRecord = await auth.getUserByEmail(email)
  console.log(`Usuario existente en Auth: ${email} (${userRecord.uid})`)
} catch {
  userRecord = await auth.createUser({ email, password, displayName })
  console.log(`Usuario creado en Auth: ${email} (${userRecord.uid})`)
}

await getFirestore().collection('admins').doc(userRecord.uid).set({
  email,
  displayName,
  createdAt: new Date().toISOString(),
  createdBy: 'seed',
})

console.log(`Admin ${email} registrado correctamente. Ya puedes iniciar sesión en /admin/login`)
process.exit(0)
