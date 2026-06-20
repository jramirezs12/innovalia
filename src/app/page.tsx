import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Target,
  Eye,
  FlaskConical,
  ClipboardCheck,
  Rocket,
  Landmark,
  Megaphone,
  FileText,
  ChevronDown,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const lineas = [
  {
    icon: FlaskConical,
    title: 'Proyectos de I+D+i',
    desc: 'Realizar proyectos de investigación fundamental o industrial en cooperación con empresas e instituciones públicas o privadas, tanto nacionales como internacionales.',
  },
  {
    icon: ClipboardCheck,
    title: 'Asesoría y Asistencia Técnica',
    desc: 'Ofrecer diagnósticos tecnológicos, estudios de viabilidad, vigilancia y prospectiva tecnológica, y formación técnica especializada.',
  },
  {
    icon: Rocket,
    title: 'Fomento al Emprendimiento',
    desc: 'Impulsar la investigación cooperativa en PYMES y el desarrollo de emprendedores digitales o empresas de la «nueva economía».',
  },
  {
    icon: Landmark,
    title: 'Administración Electrónica',
    desc: 'Prestar servicios de asesoramiento y transferencia tecnológica con especial interés en el ámbito del sector público y la gestión del conocimiento.',
  },
  {
    icon: Megaphone,
    title: 'Divulgación y Eventos',
    desc: 'Elaborar, editar y publicar materiales en soporte papel, audiovisual o multimedia, así como organizar conferencias, seminarios, coloquios y cursos relacionados.',
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-navy-800/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-gold-600/10 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10 py-32 text-center">
          <Image
            src="/logo-innovalia-white.png"
            alt="Fundación INNOVALIA"
            width={553}
            height={286}
            priority
            className="h-24 sm:h-28 w-auto mx-auto mb-8"
          />

          <span className="inline-block mb-6 text-xs font-semibold tracking-widest text-gold-500 uppercase border border-gold-500/40 rounded-full px-4 py-1.5">
            Innovación · Tecnología · I+D+i · Colombia
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Fundación
            <br />
            <span className="text-gold-500">INNOVALIA</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Potenciamos el beneficio social y la competitividad empresarial a través de la
            investigación, el desarrollo y la innovación tecnológica (I+D+i) en TIC.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#sobre-nosotros" className="btn-secondary">
              Conocer más <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/estados-financieros" className="btn-outline border-white text-white hover:bg-white hover:text-navy-900">
              Ver estados financieros <FileText className="w-4 h-4" />
            </Link>
          </div>

          <a
            href="#sobre-nosotros"
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 hover:text-white transition-colors animate-bounce"
            aria-label="Scroll hacia abajo"
          >
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* ── SOBRE NOSOTROS ── */}
      <section id="sobre-nosotros" className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block mb-3 text-xs font-semibold tracking-widest text-gold-600 uppercase">
              Quiénes somos
            </span>
            <h2 className="section-title">Sobre Nosotros</h2>
            <div className="w-16 h-1 bg-gold-500 rounded-full mx-auto mb-6" />
            <p className="text-slate-600 leading-relaxed text-lg mb-4">
              La Fundación INNOVALIA es un centro de innovación, entidad sin ánimo de lucro
              dedicada a la investigación, el desarrollo y la innovación tecnológica (I+D+i) en
              TIC, generando y transfiriendo conocimiento de alto valor añadido.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Impulsamos la sociedad de la información, el emprendimiento digital y la transformación
              tecnológica mediante la cooperación estratégica entre los sectores público, privado y
              académico, a nivel nacional e internacional, con plena transparencia en la gestión de
              los recursos que nos son confiados.
            </p>
          </div>
        </div>
      </section>

      {/* ── OBJETO SOCIAL Y VISIÓN ── */}
      <section id="proposito" className="py-20 bg-slate-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 text-xs font-semibold tracking-widest text-gold-600 uppercase">
              Nuestra razón de ser
            </span>
            <h2 className="section-title">Objeto Social y Visión</h2>
            <div className="w-16 h-1 bg-gold-500 rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Objeto Social */}
            <div className="card border-t-4 border-t-navy-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-gold-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-900">Objeto Social</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Somos una fundación dedicada a potenciar el beneficio social y la competitividad
                empresarial a través de la investigación, el desarrollo y la innovación tecnológica
                en TIC (I+D+i). Nos comprometemos a generar y transferir conocimiento de alto valor
                añadido, impulsando la sociedad de la información, el emprendimiento digital y la
                transformación tecnológica mediante la cooperación estratégica entre los sectores
                público, privado y académico a nivel nacional e internacional.
              </p>
            </div>

            {/* Visión */}
            <div className="card border-t-4 border-t-gold-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-navy-900">Visión</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Para el año 2032, el Centro de Innovación INNOVALIA será reconocido como un nodo
                líder y referente en la transformación digital de las organizaciones y la
                administración electrónica en la región. Consolidaremos un ecosistema tecnológico
                PYME altamente competitivo, apalancado en la investigación cooperativa, la formación
                especializada de vanguardia y la ejecución de proyectos de alto impacto que integren
                la ciencia, la gestión del conocimiento y la apropiación tecnológica social.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LÍNEAS DE ACCIÓN ── */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 text-xs font-semibold tracking-widest text-gold-600 uppercase">
              Lo que hacemos
            </span>
            <h2 className="section-title">Líneas de Acción</h2>
            <div className="w-16 h-1 bg-gold-500 rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {lineas.map((l) => (
              <div key={l.title} className="card hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <l.icon className="w-6 h-6 text-navy-900" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{l.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESTADOS FINANCIEROS CTA ── */}
      <section className="py-20 bg-navy-900">
        <div className="section-container text-center">
          <FileText className="w-14 h-14 text-gold-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Transparencia Financiera
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Como entidad sin ánimo de lucro, ponemos a disposición del público nuestros estados
            financieros anuales, en cumplimiento de la normativa vigente de la DIAN.
          </p>
          <Link href="/estados-financieros" className="btn-secondary text-base px-8 py-4">
            Consultar estados financieros <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="py-20 bg-slate-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 text-xs font-semibold tracking-widest text-gold-600 uppercase">
              Comunícate con nosotros
            </span>
            <h2 className="section-title">Contacto</h2>
            <div className="w-16 h-1 bg-gold-500 rounded-full mx-auto mb-4" />
            {/* TODO: Actualizar con información de contacto real */}
            <p className="section-subtitle mx-auto text-center">
              Estamos disponibles para resolver tus inquietudes sobre nuestra fundación y sus
              proyectos de innovación.
            </p>
          </div>

          <div className="max-w-md mx-auto card text-center space-y-4">
            <p className="text-slate-500 text-sm">Correo electrónico</p>
            <a
              href="mailto:info@innovalia.org"
              className="text-navy-900 font-semibold hover:text-gold-600 transition-colors"
            >
              info@innovalia.org
            </a>
            {/* TODO: Agregar más información de contacto: dirección, teléfono, redes sociales */}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
