import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Fundación INNOVALIA',
  description:
    'Sitio web oficial de la Fundación INNOVALIA, centro de innovación dedicado a la investigación, el desarrollo y la innovación tecnológica (I+D+i) en TIC. Información institucional y estados financieros.',
  keywords: [
    'Fundación INNOVALIA',
    'INNOVALIA',
    'Centro de Innovación',
    'I+D+i',
    'innovación tecnológica',
    'TIC',
    'transformación digital',
    'ESAL',
    'estados financieros',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
