import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'INNOVALIA — Centro de Innovación para la Transformación Digital y el Desarrollo Tecnológico',
  description:
    'Sitio web oficial de INNOVALIA, Centro de Innovación para la Transformación Digital y el Desarrollo Tecnológico. Investigación, desarrollo e innovación tecnológica (I+D+i) en TIC, información institucional y estados financieros.',
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
