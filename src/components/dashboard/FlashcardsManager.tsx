"use client";
import { Volume2 } from "lucide-react";
import { speakText } from "@/lib/speech";
import { useEffect, useMemo, useState } from "react";

type VocabularyEntry = {
  id: string;
  word: string;
  translation: string;
  alternativeTranslation: string | null;
  pronunciation: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  example: string | null;
  notes: string | null;
  isLearned: boolean;
  isFavorite: boolean;
  createdAt: string;
};

const languages: Record<string, string> = {
  en: "Inglés",
  es: "Español",
  fr: "Francés",
  pt: "Portugués",
};

type StudyFilter = "all" | "pending" | "learned" | "favorites";

export default function FlashcardsManager() {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRevealed, setIsRevealed] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [studyFilter, setStudyFilter] = useState<StudyFilter>("all");

  const [languageFilter, setLanguageFilter] = useState("all");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    async function loadVocabulary() {
      try {
        const response = await fetch("/api/vocabulary", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          setMessage("No fue posible cargar tu vocabulario.");

          setMessageType("error");
          return;
        }

        const data = (await response.json()) as VocabularyEntry[];

        setEntries(data);
      } catch {
        setMessage("No fue posible conectar con el servidor.");

        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    }

    loadVocabulary();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesLanguage =
        languageFilter === "all" || entry.sourceLanguage === languageFilter;

      let matchesStudyFilter = true;

      if (studyFilter === "pending") {
        matchesStudyFilter = !entry.isLearned;
      }

      if (studyFilter === "learned") {
        matchesStudyFilter = entry.isLearned;
      }

      if (studyFilter === "favorites") {
        matchesStudyFilter = entry.isFavorite;
      }

      return matchesLanguage && matchesStudyFilter;
    });
  }, [entries, studyFilter, languageFilter]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
  }, [studyFilter, languageFilter]);

  useEffect(() => {
    if (filteredEntries.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= filteredEntries.length) {
      setCurrentIndex(0);
    }
  }, [filteredEntries.length, currentIndex]);

  const currentEntry = filteredEntries[currentIndex] ?? null;

  function nextCard() {
    if (filteredEntries.length <= 1) {
      setIsRevealed(false);
      return;
    }

    setCurrentIndex((current) => (current + 1) % filteredEntries.length);

    setIsRevealed(false);
  }

  function previousCard() {
    if (filteredEntries.length <= 1) {
      setIsRevealed(false);
      return;
    }

    setCurrentIndex((current) =>
      current === 0 ? filteredEntries.length - 1 : current - 1,
    );

    setIsRevealed(false);
  }

  function randomCard() {
    if (filteredEntries.length <= 1) {
      return;
    }

    let newIndex = currentIndex;

    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * filteredEntries.length);
    }

    setCurrentIndex(newIndex);
    setIsRevealed(false);
  }

  async function speakWord(entry: VocabularyEntry) {
    try {
      await speakText(entry.word, entry.sourceLanguage);
    } catch {
      setMessage("Tu navegador no permite reproducir pronunciaciones.");

      setMessageType("error");
    }
  }

  async function markCard(learned: boolean) {
    if (!currentEntry) {
      return;
    }

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`/api/vocabulary/${currentEntry.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          isLearned: learned,
        }),
      });

      if (!response.ok) {
        setMessage("No fue posible actualizar la palabra.");

        setMessageType("error");
        return;
      }

      const updatedEntry = (await response.json()) as VocabularyEntry;

      setEntries((currentEntries) =>
        currentEntries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry,
        ),
      );

      if (learned) {
        setMessage(`"${updatedEntry.word}" marcada como aprendida.`);

        setMessageType("success");
      }

      nextCard();
    } catch {
      setMessage("No fue posible actualizar la palabra.");

      setMessageType("error");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Cargando flashcards...
      </div>
    );
  }

  return (
    <div>
      {/* CONTROLES */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Qué estudiar
            </p>

            <select
              value={studyFilter}
              onChange={(event) =>
                setStudyFilter(event.target.value as StudyFilter)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="all">Todas las palabras</option>

              <option value="pending">Solo pendientes</option>

              <option value="learned">Solo aprendidas</option>

              <option value="favorites">Solo favoritas</option>
            </select>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Idioma
            </p>

            <select
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="all">Todos los idiomas</option>

              <option value="en">Inglés</option>

              <option value="fr">Francés</option>

              <option value="pt">Portugués</option>

              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1
              ? "flashcard disponible"
              : "flashcards disponibles"}
          </p>

          <button
            type="button"
            onClick={randomCard}
            disabled={filteredEntries.length <= 1}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↻ Aleatoria
          </button>
        </div>
      </section>

      {message && (
        <p
          className={`mt-5 rounded-2xl border p-3 text-center text-sm ${
            messageType === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          {message}
        </p>
      )}

      {/* SIN PALABRAS */}
      {!currentEntry ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
            Aa
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            No hay flashcards
          </h2>

          <p className="mt-2 text-slate-500">
            No tienes palabras que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <>
          {/* PROGRESO */}
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
              <span>
                Tarjeta {currentIndex + 1} de {filteredEntries.length}
              </span>

              <span>
                {Math.round(
                  ((currentIndex + 1) / filteredEntries.length) * 100,
                )}
                %
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                style={{
                  width: `${
                    ((currentIndex + 1) / filteredEntries.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* FLASHCARD */}
          <section className="mx-auto mt-6 max-w-3xl">
  <button
    type="button"
    onClick={() => setIsRevealed((current) => !current)}
    className="group relative flex min-h-[390px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 text-center shadow-2xl shadow-cyan-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_20px_60px_-20px_rgba(34,211,238,0.35)]"
  >
              <div className=" absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

              {!isRevealed ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    {languages[currentEntry.sourceLanguage]}
                  </p>

                  <h2 className="mt-6 break-words text-5xl font-black text-white sm:text-6xl">
                    {currentEntry.word}
                  </h2>

                  <p className="mt-8 text-sm font-semibold text-slate-500">
                    Toca la tarjeta para ver la respuesta
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Traducción
                  </p>

                  <h2 className="mt-5 text-4xl font-black text-teal-300 sm:text-5xl">
                    {currentEntry.translation}
                  </h2>

                  {currentEntry.alternativeTranslation && (
                    <div className="mt-4 rounded-2xl bg-cyan-400/10 px-5 py-3">
                      <p className="text-sm text-slate-400">También:</p>

                      <p className="mt-1 font-bold text-cyan-300">
                        {currentEntry.alternativeTranslation}
                      </p>
                    </div>
                  )}

                  {currentEntry.example && (
                    <div className="mt-7 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Ejemplo
                      </p>

                      <p className="mt-2 text-sm italic leading-6 text-slate-300">
                        “{currentEntry.example}”
                      </p>
                    </div>
                  )}

                  <p className="mt-6 text-xs text-slate-600">
                    Toca nuevamente para ocultar
                  </p>
                </>
              )}
            </button>

            {/* PRONUNCIACIÓN */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => speakWord(currentEntry)}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/20"
                aria-label="Escuchar pronunciación"
                title="Escuchar pronunciación"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>

            {/* RESULTADOS */}
            {isRevealed && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => markCard(false)}
                  className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 font-bold text-amber-300 transition hover:bg-amber-400/20"
                >
                  Todavía no la sé
                </button>

                <button
                  type="button"
                  onClick={() => markCard(true)}
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 font-bold text-emerald-300 transition hover:bg-emerald-400/20"
                >
                  ✓ Ya la sé
                </button>
              </div>
            )}

            {/* NAVEGACIÓN */}
            <div className="mt-6 flex  items-center justify-between gap-4">
              <button
                type="button"
                onClick={previousCard}
                disabled={filteredEntries.length <= 1}
                className="cursor-pointer rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                ← Anterior
              </button>

              <button
                type="button"
                onClick={nextCard}
                disabled={filteredEntries.length <= 1}
                className="cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
