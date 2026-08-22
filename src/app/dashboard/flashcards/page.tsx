import FlashcardsManager from "@/components/dashboard/FlashcardsManager";

export default function FlashcardsPage() {
  return (
    <main>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
          LinguaGo
        </p>

        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          Flashcards
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Practica las palabras que has guardado en tu vocabulario.
        </p>
      </div>

      <FlashcardsManager />
    </main>
  );
}
