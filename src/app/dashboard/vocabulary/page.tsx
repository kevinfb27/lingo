import VocabularyManager from "@/components/dashboard/VocabularyManager";

export default function VocabularyPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <header>
        <p className="font-semibold text-teal-400">
          Mi aprendizaje
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          Vocabulario personal
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          Guarda palabras desconocidas, añade su
          traducción y pronunciación, y controla
          cuáles ya aprendiste.
        </p>
      </header>

      <div className="mt-10">
        <VocabularyManager />
      </div>
    </main>
  );
}