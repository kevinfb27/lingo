import Link from "next/link";

const languages = [
  {
    name: "Inglés",
    flag: "🇺🇸",
    description: "Habla con confianza en cualquier lugar.",
  },
  {
    name: "Francés",
    flag: "🇫🇷",
    description: "Descubre un idioma lleno de cultura.",
  },
  {
    name: "Portugués",
    flag: "🇧🇷",
    description: "Conecta con millones de personas.",
  },
  {
    name: "Español",
    flag: "🇨🇴",
    description: "Aprende uno de los idiomas más hablados.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative">
        <div className="absolute left-[-100px] top-[-100px] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-black shadow-lg shadow-teal-500/30">
              L
            </span>

            <span className="text-2xl font-black tracking-tight">
              Lingua<span className="text-teal-400">Go</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-white/10 sm:block"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-white px-5 py-2.5 font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              Crear cuenta
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[720px] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-300">
              Aprende a tu ritmo, desde cualquier lugar
            </span>

            <h1 className="mt-8 max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Tu próximo idioma comienza en{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                LinguaGo
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Aprende inglés, francés, portugués y español con cursos modernos,
              prácticos y diseñados para ayudarte a comunicarte con seguridad.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-4 text-center font-bold text-white shadow-xl shadow-teal-500/20 transition hover:-translate-y-1"
              >
                Comenzar ahora
              </Link>

              <Link
                href="/register"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Crear una cuenta
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
              <span>✓ Cursos prácticos</span>
              <span>✓ Aprende a tu ritmo</span>
              <span>✓ Acceso desde cualquier dispositivo</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2rem] bg-white p-6 text-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-600">
                      Tu progreso
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      Inglés para principiantes
                    </h2>
                  </div>

                  <span className="text-4xl">🇺🇸</span>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex justify-between text-sm font-semibold">
                    <span>Progreso del curso</span>
                    <span className="text-teal-600">68%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  </div>
                </div>

                <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="text-sm text-teal-300">Próxima lección</p>
                  <h3 className="mt-2 text-xl font-bold">
                    Conversaciones cotidianas
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Aprende expresiones para presentarte y hablar sobre tu día.
                  </p>

                  <button className="mt-5 w-full rounded-2xl bg-white py-3 font-bold text-slate-900">
                    Continuar aprendiendo
                  </button>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/60 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-teal-400">Explora nuevos idiomas</p>
            <h2 className="mt-3 text-4xl font-black">
              Cuatro idiomas, nuevas oportunidades
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {languages.map((language) => (
              <article
                key={language.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-2 hover:border-teal-400/40 hover:bg-white/10"
              >
                <span className="text-5xl">{language.flag}</span>
                <h3 className="mt-6 text-2xl font-bold">{language.name}</h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {language.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}