import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  Globe2,
  Info,
  Languages,
  Layers3,
  MessageCircle,
  Plane,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";

import {
  GB,
  FR,
  BR,
  ES,
} from "country-flag-icons/react/3x2";

type LanguageCode = "gb" | "fr" | "br" | "es";

type Language = {
  code: LanguageCode;
  name: string;
  status: string;
  available: boolean;
  icon: string;
  iconAlt: string;
};

const languages: Language[] = [
  {
    code: "gb",
    name: "Inglés",
    status: "Disponible",
    available: true,
    icon: "https://img.icons8.com/color/240/big-ben.png",
    iconAlt: "Big Ben",
  },
  {
    code: "fr",
    name: "Francés",
    status: "Próximamente",
    available: false,
    icon: "https://img.icons8.com/color/240/eiffel-tower.png",
    iconAlt: "Torre Eiffel",
  },
  {
    code: "br",
    name: "Portugués",
    status: "Próximamente",
    available: false,
    icon: "https://img.icons8.com/color/240/statue-of-christ-the-redeemer.png",
    iconAlt: "Cristo Redentor",
  },
  {
    code: "es",
    name: "Español",
    status: "Próximamente",
    available: false,
    icon: "https://img.icons8.com/color/240/sagrada-familia.png",
    iconAlt: "Sagrada Familia",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =========================================================
          FONDO
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[150px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
      </div>

      <div className="relative z-10">
        {/* =========================================================
            HEADER
        ========================================================= */}

        <header className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            {/* MARCA */}

            <Link
              href="/"
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-cyan-950/30">
                <span className="text-2xl font-black text-white">
                  L
                </span>
              </div>

              <div>
                <p className="text-xl font-black tracking-tight text-white">
                  LinguaGo
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Aprende. Practica. Avanza.
                </p>
              </div>
            </Link>

            {/* NAVEGACIÓN */}

            <nav className="hidden items-center gap-7 lg:flex">
              <a
                href="#idiomas"
                className="cursor-pointer text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                Idiomas
              </a>

              <a
                href="#funciones"
                className="cursor-pointer text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                Funciones
              </a>

              <a
                href="#metodo"
                className="cursor-pointer text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                Cómo funciona
              </a>

              <a
                href="#mundo"
                className="cursor-pointer text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                Más allá
              </a>
            </nav>

            {/* ACCESO */}

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-4"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="hidden cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/30 sm:inline-flex"
              >
                Crear cuenta

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center lg:px-8 lg:pb-28 lg:pt-28">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Aprende idiomas de una forma más organizada
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[1.07] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Convierte cada sesión de estudio en
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {" "}
              progreso real.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-400 sm:text-xl">
            LinguaGo reúne cursos progresivos, vocabulario personal,
            flashcards, pronunciación y seguimiento de tu avance para
            ayudarte a comprender, practicar y reforzar un nuevo idioma.
          </p>

          {/* BOTONES */}

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_-20px_rgba(34,211,238,0.45)]"
            >
              Comenzar a aprender

              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 font-bold text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              Ya tengo una cuenta
            </Link>
          </div>

          {/* BENEFICIOS */}

          <div className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Aprende a tu ritmo
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Practica pronunciación
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Sigue tu progreso
            </span>
          </div>
        </section>

        {/* =========================================================
            IDIOMAS
        ========================================================= */}

        <section
          id="idiomas"
          className="border-y border-white/[0.06] bg-white/[0.015]"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            {/* CABECERA */}

            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-300">
                <Languages className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
                Idiomas en LinguaGo
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                Un mismo sistema de aprendizaje para diferentes idiomas.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                Empieza con inglés y, a medida que LinguaGo crezca,
                podrás utilizar tus herramientas de aprendizaje con
                nuevos idiomas.
              </p>
            </div>

            {/* TARJETAS */}

            <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {languages.map((language) => (
                <LanguageCard
                  key={language.code}
                  language={language}
                />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FUNCIONES
        ========================================================= */}

        <section
          id="funciones"
          className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
              Tu aprendizaje conectado
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Más que memorizar palabras.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Cada herramienta de LinguaGo cumple una función dentro de
              tu aprendizaje. Estudia contenido nuevo, practica
              activamente y vuelve sobre aquello que necesitas reforzar.
            </p>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
            <ProductFeature
              icon={<BookOpen className="h-6 w-6" />}
              title="Cursos progresivos"
              description="Avanza mediante lecciones organizadas con explicaciones, vocabulario, ejemplos y ejercicios de dificultad progresiva."
            />

            <ProductFeature
              icon={<Languages className="h-6 w-6" />}
              title="Vocabulario personal"
              description="Construye tu propio banco de palabras con traducciones, pronunciación, ejemplos y notas."
            />

            <ProductFeature
              icon={<Layers3 className="h-6 w-6" />}
              title="Flashcards"
              description="Convierte las palabras que guardas en sesiones de repaso activo para reforzar lo aprendido."
            />

            <ProductFeature
              icon={<Volume2 className="h-6 w-6" />}
              title="Pronunciación"
              description="Escucha palabras, expresiones y ejemplos directamente mientras estudias."
            />

            <ProductFeature
              icon={<BrainCircuit className="h-6 w-6" />}
              title="Práctica activa"
              description="Responde ejercicios variados y utiliza el idioma en lugar de limitarte a leer contenido."
            />

            <ProductFeature
              icon={<BarChart3 className="h-6 w-6" />}
              title="Seguimiento de progreso"
              description="Continúa tus lecciones desde donde terminaste y observa tu avance a medida que completas el curso."
            />
          </div>
        </section>

        {/* =========================================================
            MÉTODO
        ========================================================= */}

        <section
          id="metodo"
          className="border-y border-white/[0.06] bg-white/[0.015]"
        >
          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:px-8">
            {/* INTRODUCCIÓN */}

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.07] text-cyan-300">
                <BrainCircuit className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
                Cómo funciona
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                Aprende paso a paso y construye sobre lo que ya sabes.
              </h2>

              <p className="mt-5 leading-7 text-slate-400">
                LinguaGo organiza el aprendizaje como un proceso continuo.
                Cada herramienta complementa las demás para ayudarte a
                mantener una práctica constante.
              </p>
            </div>

            {/* PASOS */}

            <div className="space-y-5">
              <LearningStep
                number="01"
                title="Comprende"
                description="Aprende conceptos, palabras y expresiones mediante contenido estructurado, explicaciones y ejemplos contextualizados."
              />

              <LearningStep
                number="02"
                title="Practica"
                description="Responde ejercicios, construye frases y escucha pronunciaciones para trabajar activamente con el idioma."
              />

              <LearningStep
                number="03"
                title="Refuerza"
                description="Guarda vocabulario y utiliza flashcards para volver sobre aquello que todavía necesitas consolidar."
              />

              <LearningStep
                number="04"
                title="Avanza"
                description="Completa tus lecciones progresivamente y continúa construyendo conocimiento sobre una base cada vez más sólida."
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            MÁS ALLÁ DEL IDIOMA
            LA PARTE DE VIAJE QUEDA SECUNDARIA
        ========================================================= */}

        <section
          id="mundo"
          className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-slate-900/40">
            {/* LUCES DE FONDO */}

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/[0.08] blur-[100px]" />

              <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-emerald-500/[0.06] blur-[100px]" />
            </div>

            <div className="relative grid gap-12 px-7 py-12 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-14">
              {/* TEXTO */}

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Globe2 className="h-6 w-6" />
                </div>

                <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
                  Más allá de las palabras
                </p>

                <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl">
                  Un nuevo idioma también puede acercarte a nuevas
                  personas y culturas.
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                  Aprender no consiste únicamente en traducir. También
                  significa comprender expresiones, contextos y otras
                  formas de comunicarse.
                </p>

                <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                  Lo que aprendes puede servirte al conversar con otras
                  personas, disfrutar contenido en su idioma original o
                  comprender mejor tu entorno cuando conozcas un lugar
                  diferente.
                </p>
              </div>

              {/* BENEFICIOS */}

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <WorldBenefit
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Comunícate"
                  text="Utiliza lo aprendido para desenvolverte con mayor confianza en conversaciones."
                />

                <WorldBenefit
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Comprende"
                  text="Descubre expresiones, contextos y formas diferentes de utilizar el idioma."
                />

                <WorldBenefit
                  icon={<Plane className="h-5 w-5" />}
                  title="Explora"
                  text="El idioma puede ayudarte a comprender mejor lo que ocurre a tu alrededor cuando visitas otro lugar."
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ACLARACIÓN EDUCATIVA
        ========================================================= */}

        <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
          <div className="flex flex-col gap-5 border-l-2 border-cyan-400/40 pl-6 sm:flex-row">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07] text-cyan-300">
              <Info className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-200">
                Una herramienta para apoyar tu aprendizaje
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-500">
                LinguaGo es una plataforma educativa destinada al estudio
                y la práctica de idiomas. Los niveles, resultados,
                porcentajes de progreso o actividades completadas dentro
                de la plataforma representan el avance del usuario dentro
                de LinguaGo y no constituyen una certificación oficial de
                competencia lingüística.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRIVACIDAD
        ========================================================= */}

        <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
          <div className="grid gap-8 border-t border-white/[0.06] pt-16 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-white">
                Tu cuenta, tu aprendizaje.
              </h2>
            </div>

            <div>
              <p className="leading-7 text-slate-400">
                Para ofrecer funciones como autenticación, vocabulario
                personal y seguimiento del progreso, LinguaGo necesita
                gestionar determinada información asociada a tu cuenta.
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Puedes consultar información sobre el uso de tus datos,
                las condiciones de utilización de la plataforma y las
                tecnologías necesarias para su funcionamiento en nuestras
                políticas.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
                <Link
                  href="/privacy"
                  className="cursor-pointer text-cyan-400 transition hover:text-cyan-300"
                >
                  Política de privacidad
                </Link>

                <Link
                  href="/terms"
                  className="cursor-pointer text-cyan-400 transition hover:text-cyan-300"
                >
                  Términos de uso
                </Link>

                <Link
                  href="/cookies"
                  className="cursor-pointer text-cyan-400 transition hover:text-cyan-300"
                >
                  Política de cookies
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA FINAL
        ========================================================= */}

        <section className="px-6 pb-24 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-6 py-14 text-center sm:px-10 sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-300">
              <Languages className="h-7 w-7" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Empieza hoy
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Construye tu progreso una lección a la vez.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Organiza lo que estudias, practica activamente y mantén
              todo tu aprendizaje conectado dentro de LinguaGo.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_-20px_rgba(34,211,238,0.45)]"
            >
              Crear mi cuenta

              <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="mx-auto mt-5 max-w-xl text-xs leading-5 text-slate-600">
              Al crear una cuenta declaras haber leído los{" "}
              <Link
                href="/terms"
                className="cursor-pointer text-slate-500 underline decoration-slate-700 underline-offset-4 transition hover:text-slate-300"
              >
                Términos de uso
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacy"
                className="cursor-pointer text-slate-500 underline decoration-slate-700 underline-offset-4 transition hover:text-slate-300"
              >
                Política de privacidad
              </Link>
              .
            </p>
          </div>
        </section>

        {/* =========================================================
            FOOTER
        ========================================================= */}

        <footer className="border-t border-white/[0.07] bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              {/* MARCA */}

              <div>
                <Link
                  href="/"
                  className="inline-flex cursor-pointer items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                    <span className="text-xl font-black text-white">
                      L
                    </span>
                  </div>

                  <span className="font-black text-white">
                    LinguaGo
                  </span>
                </Link>

                <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
                  Plataforma educativa para aprender idiomas mediante
                  cursos, vocabulario, práctica y repaso.
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Globe2 className="h-4 w-4 text-cyan-400" />
                  Aprende. Practica. Avanza.
                </div>
              </div>

              {/* PLATAFORMA */}

              <FooterColumn title="Plataforma">
                <a
                  href="#idiomas"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Idiomas
                </a>

                <a
                  href="#funciones"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Funciones
                </a>

                <a
                  href="#metodo"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Cómo funciona
                </a>

                <Link
                  href="/login"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Iniciar sesión
                </Link>
              </FooterColumn>

              {/* INFORMACIÓN */}

              <FooterColumn title="Información">
                <Link
                  href="/about"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Acerca de LinguaGo
                </Link>

                <Link
                  href="/contact"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Contacto
                </Link>
              </FooterColumn>

              {/* LEGAL */}

              <FooterColumn title="Legal">
                <Link
                  href="/privacy"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Política de privacidad
                </Link>

                <Link
                  href="/terms"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Términos de uso
                </Link>

                <Link
                  href="/cookies"
                  className="cursor-pointer transition hover:text-slate-300"
                >
                  Política de cookies
                </Link>
              </FooterColumn>
            </div>

            <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} LinguaGo. Todos los derechos
                reservados.
              </p>

              <p>
                Aprende. Practica. Avanza.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   TARJETA DE IDIOMA
========================================================= */

function LanguageCard({
  language,
}: {
  language: Language;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.8rem] border border-white/[0.09] bg-slate-900/70 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/25">
      {/* =====================================================
          BANDERA REAL COMO FONDO
      ===================================================== */}

      <div className="relative aspect-[3/2] overflow-hidden">
        <FlagBackground code={language.code} />

        {/* OSCURECIMIENTO */}
        <div className="absolute inset-0 bg-slate-950/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/5" />

        {/* =====================================================
            MONUMENTO
        ===================================================== */}

        <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
          <img
            src={language.icon}
            alt={language.iconAlt}
            draggable={false}
            className="h-[82%] w-[82%] select-none object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      {/* =====================================================
          SOLO IDIOMA Y ESTADO
          SIN PAÍS, CIUDAD NI MONUMENTO
      ===================================================== */}

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] p-4 sm:p-5">
        <h3 className="font-black text-white sm:text-lg">
          {language.name}
        </h3>

        <span
          className={`text-[10px] font-bold sm:text-xs ${
            language.available
              ? "text-emerald-400"
              : "text-slate-600"
          }`}
        >
          {language.status}
        </span>
      </div>
    </article>
  );
}

/* =========================================================
   BANDERAS DESDE country-flag-icons
   NO ESTÁN DIBUJADAS MANUALMENTE
========================================================= */

function FlagBackground({
  code,
}: {
  code: LanguageCode;
}) {
  const className =
    "absolute inset-0 block h-full w-full object-cover";

  if (code === "gb") {
    return (
      <GB
        title="English"
        className={className}
      />
    );
  }

  if (code === "fr") {
    return (
      <FR
        title="Français"
        className={className}
      />
    );
  }

  if (code === "br") {
    return (
      <BR
        title="Português"
        className={className}
      />
    );
  }

  return (
    <ES
      title="Español"
      className={className}
    />
  );
}

/* =========================================================
   FUNCIONES
========================================================= */

function ProductFeature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="flex gap-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-cyan-300">
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-black text-white">
          {title}
        </h3>

        <p className="mt-2 max-w-lg text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   MÉTODO
========================================================= */

function LearningStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="flex gap-5 border-b border-white/[0.06] pb-6 last:border-none">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-xs font-black text-emerald-300">
        {number}
      </div>

      <div>
        <h3 className="font-black text-white">
          {title}
        </h3>

        <p className="mt-2 leading-7 text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   MUNDO / CULTURA
========================================================= */

function WorldBenefit({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07] text-cyan-300">
        {icon}
      </div>

      <div>
        <h3 className="font-black text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-200">
        {title}
      </p>

      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
        {children}
      </div>
    </div>
  );
}