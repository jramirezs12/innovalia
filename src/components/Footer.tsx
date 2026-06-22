import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/logo-innovalia-white.png"
              alt="Fundación INNOVALIA"
              width={553}
              height={286}
              className="h-12 w-auto"
            />
            <p className="text-sm leading-relaxed text-slate-400">
              Centro de Innovación para la Transformación Digital y el Desarrollo Tecnológico.
              Entidad sin ánimo de lucro dedicada a la investigación, el desarrollo y la innovación
              tecnológica (I+D+i) en TIC, impulsando la transformación digital y el emprendimiento
              mediante la cooperación entre los sectores público, privado y académico.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/#sobre-nosotros', label: 'Sobre Nosotros' },
                { href: '/#proposito', label: 'Objeto y Visión' },
                { href: '/estados-financieros', label: 'Estados Financieros' },
                { href: '/#contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold-500" />
                <span>Avenida Calle 26 # 69-76, Torre 3, Of. 1501-1502, Bogotá, Colombia</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 shrink-0 text-gold-500" />
                <a href="mailto:administrador@innovaliacolombia.com" className="hover:text-white transition-colors">
                  administrador@innovaliacolombia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {year} INNOVALIA — Centro de Innovación. Todos los derechos reservados.</p>
          <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
            Acceso administradores
          </Link>
        </div>
      </div>
    </footer>
  )
}
