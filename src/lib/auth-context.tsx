'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, firebaseDb } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const auth = firebaseAuth()
    const db = firebaseDb()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid))
        setIsAdmin(adminDoc.exists())
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signOut = async () => {
    await firebaseSignOut(firebaseAuth())
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
