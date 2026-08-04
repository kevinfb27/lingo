"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

type VocabularyEntry = {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  example: string | null;
  notes: string | null;
  isLearned: boolean;
  isFavorite: boolean;
  createdAt: string;
};

type VocabularyForm = {
  word: string;
  translation: string;
  pronunciation: string;
  sourceLanguage: string;
  targetLanguage: string;
  example: string;
  notes: string;
};

const languages = [
  { value: "en", label: "Inglés" },
  { value: "fr", label: "Francés" },
  { value: "pt", label: "Portugués" },
  { value: "es", label: "Español" },
];

const initialForm: VocabularyForm = {
  word: "",
  translation: "",
  pronunciation: "",
  sourceLanguage: "en",
  targetLanguage: "es",
  example: "",
  notes: "",
};

export default function VocabularyManager() {
  const [entries, setEntries] = useState<
    VocabularyEntry[]
  >([]);

  const [form, setForm] =
    useState<VocabularyForm>(initialForm);

  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEntries() {
      try {
        const response = await fetch(
          "/api/vocabulary"
        );

        if (!response.ok) {
          setMessage(
            "No fue posible cargar el vocabulario."
          );
          return;
        }

        const data =
          (await response.json()) as VocabularyEntry[];

        setEntries(data);
      } catch {
        setMessage(
          "No fue posible conectar con el servidor."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        !cleanSearch ||
        entry.word
          .toLowerCase()
          .includes(cleanSearch) ||
        entry.translation
          .toLowerCase()
          .includes(cleanSearch);

      const matchesLanguage =
        languageFilter === "all" ||
        entry.sourceLanguage ===
          languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [entries, search, languageFilter]);

  function updateForm(
    field: keyof VocabularyForm,
    value: string
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/vocabulary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error ??
            "No fue posible guardar la palabra."
        );
        return;
      }

      setEntries((currentEntries) => [
        result,
        ...currentEntries,
      ]);

      setForm(initialForm);
      setMessage("Palabra guardada correctamente.");
    } catch {
      setMessage(
        "Ocurrió un error al guardar la palabra."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateEntry(
    entry: VocabularyEntry,
    changes: {
      isLearned?: boolean;
      isFavorite?: boolean;
    }
  ) {
    const response = await fetch(
      `/api/vocabulary/${entry.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      }
    );

    if (!response.ok) {
      setMessage(
        "No fue posible actualizar la palabra."
      );
      return;
    }

    const updatedEntry =
      (await response.json()) as VocabularyEntry;

    setEntries((currentEntries) =>
      currentEntries.map((currentEntry) =>
        currentEntry.id === updatedEntry.id
          ? updatedEntry
          : currentEntry
      )
    );
  }

  async function deleteEntry(id: string) {
    const accepted = window.confirm(
      "¿Deseas eliminar esta palabra?"
    );

    if (!accepted) {
      return;
    }

    const response = await fetch(
      `/api/vocabulary/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      setMessage(
        "No fue posible eliminar la palabra."
      );
      return;
    }

    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) => entry.id !== id
      )
    );
  }

  function getLanguageLabel(code: string) {
    return (
      languages.find(
        (language) => language.value === code
      )?.label ?? code
    );
  }

  function speakWord(entry: VocabularyEntry) {
    if (!("speechSynthesis" in window)) {
      setMessage(
        "Tu navegador no permite reproducir pronunciaciones."
      );
      return;
    }

    const localeByLanguage: Record<
      string,
      string
    > = {
      en: "en-US",
      fr: "fr-FR",
      pt: "pt-BR",
      es: "es-ES",
    };

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(entry.word);

    speech.lang =
      localeByLanguage[
        entry.sourceLanguage
      ] ?? entry.sourceLanguage;

    window.speechSynthesis.speak(speech);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
      <section className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-6 xl:sticky xl:top-8">
        <h2 className="text-2xl font-black">
          Agregar palabra
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Guarda una palabra nueva junto con su
          traducción y pronunciación.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Palabra
            </label>

            <input
              value={form.word}
              onChange={(event) =>
                updateForm(
                  "word",
                  event.target.value
                )
              }
              required
              placeholder="Ejemplo: journey"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Traducción
            </label>

            <input
              value={form.translation}
              onChange={(event) =>
                updateForm(
                  "translation",
                  event.target.value
                )
              }
              required
              placeholder="Ejemplo: viaje"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Pronunciación
            </label>

            <input
              value={form.pronunciation}
              onChange={(event) =>
                updateForm(
                  "pronunciation",
                  event.target.value
                )
              }
              placeholder="Ejemplo: yér-ni"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Idioma
              </label>

              <select
                value={form.sourceLanguage}
                onChange={(event) =>
                  updateForm(
                    "sourceLanguage",
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-white outline-none"
              >
                {languages.map((language) => (
                  <option
                    key={language.value}
                    value={language.value}
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Traducir a
              </label>

              <select
                value={form.targetLanguage}
                onChange={(event) =>
                  updateForm(
                    "targetLanguage",
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-white outline-none"
              >
                {languages.map((language) => (
                  <option
                    key={language.value}
                    value={language.value}
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Ejemplo
            </label>

            <textarea
              value={form.example}
              onChange={(event) =>
                updateForm(
                  "example",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Escribe una frase usando la palabra"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Notas
            </label>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateForm(
                  "notes",
                  event.target.value
                )
              }
              rows={2}
              placeholder="Información adicional"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSaving
              ? "Guardando..."
              : "Guardar palabra"}
          </button>

          {message && (
            <p className="rounded-2xl bg-white/5 p-3 text-center text-sm text-slate-300">
              {message}
            </p>
          )}
        </form>
      </section>

      <section>
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:flex-row">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar palabra o traducción..."
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-teal-400"
          />

          <select
            value={languageFilter}
            onChange={(event) =>
              setLanguageFilter(
                event.target.value
              )
            }
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          >
            <option value="all">
              Todos los idiomas
            </option>

            {languages.map((language) => (
              <option
                key={language.value}
                value={language.value}
              >
                {language.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="mt-8 text-slate-400">
            Cargando vocabulario...
          </p>
        ) : filteredEntries.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 p-12 text-center">
            <p className="text-xl font-bold">
              No hay palabras para mostrar
            </p>

            <p className="mt-2 text-slate-500">
              Agrega una palabra o modifica los
              filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                className={`rounded-[2rem] border p-6 transition ${
                  entry.isLearned
                    ? "border-emerald-400/25 bg-emerald-400/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black">
                      {entry.word}
                    </p>

                    <p className="mt-1 text-lg text-teal-300">
                      {entry.translation}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateEntry(entry, {
                        isFavorite:
                          !entry.isFavorite,
                      })
                    }
                    className={`text-2xl ${
                      entry.isFavorite
                        ? "text-amber-300"
                        : "text-slate-600"
                    }`}
                    aria-label="Marcar como favorita"
                  >
                    ★
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                    {getLanguageLabel(
                      entry.sourceLanguage
                    )}
                  </span>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                    {getLanguageLabel(
                      entry.targetLanguage
                    )}
                  </span>
                </div>

                {entry.pronunciation && (
                  <p className="mt-4 text-sm text-slate-400">
                    Pronunciación:{" "}
                    <span className="font-semibold text-white">
                      {entry.pronunciation}
                    </span>
                  </p>
                )}

                {entry.example && (
                  <p className="mt-4 rounded-2xl bg-slate-950/70 p-4 text-sm italic leading-6 text-slate-300">
                    “{entry.example}”
                  </p>
                )}

                {entry.notes && (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {entry.notes}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      speakWord(entry)
                    }
                    className="rounded-xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
                  >
                    Escuchar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateEntry(entry, {
                        isLearned:
                          !entry.isLearned,
                      })
                    }
                    className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300"
                  >
                    {entry.isLearned
                      ? "Marcar pendiente"
                      : "Marcar aprendida"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteEntry(entry.id)
                    }
                    className="rounded-xl bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}