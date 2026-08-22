"use client";
import { speakText } from "@/lib/speech";
import { useEffect, useMemo, useState, type FormEvent } from "react";

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

type VocabularyForm = {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
};

type VocabularyApiResponse = VocabularyEntry & {
  error?: string;
};

const languages = [
  {
    value: "en",
    label: "Inglés",
  },
  {
    value: "fr",
    label: "Francés",
  },
  {
    value: "pt",
    label: "Portugués",
  },
  {
    value: "es",
    label: "Español",
  },
];

const initialForm: VocabularyForm = {
  word: "",
  sourceLanguage: "en",
  targetLanguage: "es",
};

export default function VocabularyManager() {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [form, setForm] = useState<VocabularyForm>(initialForm);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [editingAlternativeId, setEditingAlternativeId] = useState<
    string | null
  >(null);

  const [alternativeTranslationDraft, setAlternativeTranslationDraft] =
    useState("");

  useEffect(() => {
    async function loadEntries() {
      try {
        const response = await fetch("/api/vocabulary", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          setMessage("No fue posible cargar el vocabulario.");
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

    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        !cleanSearch ||
        entry.word.toLowerCase().includes(cleanSearch) ||
        entry.translation.toLowerCase().includes(cleanSearch) ||
        entry.alternativeTranslation?.toLowerCase().includes(cleanSearch) ||
        entry.example?.toLowerCase().includes(cleanSearch);

      const matchesLanguage =
        languageFilter === "all" || entry.sourceLanguage === languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [entries, search, languageFilter]);

  function updateForm(field: keyof VocabularyForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const cleanWord = form.word.trim();

    if (!cleanWord) {
      setMessage("Debes escribir una palabra.");
      setMessageType("error");
      return;
    }

    if (form.sourceLanguage === form.targetLanguage) {
      setMessage(
        "El idioma original y el idioma de traducción deben ser diferentes.",
      );
      setMessageType("error");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/vocabulary/automatic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: cleanWord,
          sourceLanguage: form.sourceLanguage,
          targetLanguage: form.targetLanguage,
        }),
      });

      const result = (await response.json()) as VocabularyApiResponse;

      if (!response.ok) {
        setMessage(
          result.error ?? "No fue posible traducir y guardar la palabra.",
        );
        setMessageType("error");
        return;
      }

      setEntries((currentEntries) => [result, ...currentEntries]);

      setForm((currentForm) => ({
        ...currentForm,
        word: "",
      }));

      setMessage(
        `"${result.word}" fue traducida como "${result.translation}" y guardada.`,
      );

      setMessageType("success");
    } catch {
      setMessage("Ocurrió un error al traducir y guardar la palabra.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateEntry(
    entry: VocabularyEntry,
    changes: {
      isLearned?: boolean;
      isFavorite?: boolean;
      alternativeTranslation?: string | null;
    },
  ) {
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`/api/vocabulary/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        setMessage("No fue posible actualizar la palabra.");
        setMessageType("error");
        return;
      }

      const updatedEntry = (await response.json()) as VocabularyEntry;

      setEntries((currentEntries) =>
        currentEntries.map((currentEntry) =>
          currentEntry.id === updatedEntry.id ? updatedEntry : currentEntry,
        ),
      );
    } catch {
      setMessage("No fue posible actualizar la palabra.");
      setMessageType("error");
    }
  }

  function startEditingAlternative(entry: VocabularyEntry) {
    setEditingAlternativeId(entry.id);
    setAlternativeTranslationDraft(entry.alternativeTranslation ?? "");
  }

  function cancelEditingAlternative() {
    setEditingAlternativeId(null);
    setAlternativeTranslationDraft("");
  }

  async function saveAlternativeTranslation(entry: VocabularyEntry) {
    const cleanTranslation = alternativeTranslationDraft.trim();

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`/api/vocabulary/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alternativeTranslation: cleanTranslation || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error ?? "No fue posible guardar la traducción alternativa.",
        );
        setMessageType("error");
        return;
      }

      const updatedEntry = result as VocabularyEntry;

      setEntries((currentEntries) =>
        currentEntries.map((currentEntry) =>
          currentEntry.id === updatedEntry.id ? updatedEntry : currentEntry,
        ),
      );

      setEditingAlternativeId(null);
      setAlternativeTranslationDraft("");

      setMessage("Traducción alternativa guardada correctamente.");
      setMessageType("success");
    } catch {
      setMessage("No fue posible guardar la traducción alternativa.");
      setMessageType("error");
    }
  }

  async function completeAutomatically(entry: VocabularyEntry) {
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`/api/vocabulary/${entry.id}/complete`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "No fue posible completar la palabra.");
        setMessageType("error");
        return;
      }

      const updatedEntry = result as VocabularyEntry;

      setEntries((currentEntries) =>
        currentEntries.map((currentEntry) =>
          currentEntry.id === updatedEntry.id ? updatedEntry : currentEntry,
        ),
      );

      setMessage(
        `Se añadió automáticamente "${updatedEntry.alternativeTranslation}" como traducción alternativa.`,
      );

      setMessageType("success");
    } catch {
      setMessage("No fue posible completar automáticamente la palabra.");
      setMessageType("error");
    }
  }

  async function deleteEntry(id: string) {
    const accepted = window.confirm("¿Deseas eliminar esta palabra?");

    if (!accepted) {
      return;
    }

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setMessage("No fue posible eliminar la palabra.");
        setMessageType("error");
        return;
      }

      setEntries((currentEntries) =>
        currentEntries.filter((entry) => entry.id !== id),
      );

      setMessage("Palabra eliminada.");
      setMessageType("success");
    } catch {
      setMessage("No fue posible eliminar la palabra.");
      setMessageType("error");
    }
  }

  function getLanguageLabel(code: string) {
    return languages.find((language) => language.value === code)?.label ?? code;
  }

  async function downloadVocabularyPdf() {
    if (entries.length === 0) {
      setMessage(
        "Debes guardar al menos una palabra antes de descargar el PDF.",
      );
      setMessageType("error");
      return;
    }

    setIsExportingPdf(true);
    setMessage("");
    setMessageType("");

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const document = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = document.internal.pageSize.getHeight();

      const groupedEntries = entries.reduce(
        (groups, entry) => {
          const groupKey = `${entry.sourceLanguage}-${entry.targetLanguage}`;

          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }

          groups[groupKey].push(entry);

          return groups;
        },
        {} as Record<string, VocabularyEntry[]>,
      );

      const orderedGroups = Object.entries(groupedEntries).sort(
        ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey),
      );

      document.setFillColor(2, 6, 23);
      document.roundedRect(15, 12, pageWidth - 30, 24, 4, 4, "F");

      document.setFillColor(16, 185, 129);
      document.roundedRect(15, 12, 8, 24, 4, 4, "F");

      document.setFillColor(6, 182, 212);
      document.circle(pageWidth - 24, 18, 2.5, "F");

      document.setFont("helvetica", "bold");
      document.setFontSize(20);
      document.setTextColor(255, 255, 255);

      document.text("Mi vocabulario", 30, 23);

      document.setFont("helvetica", "normal");
      document.setFontSize(10);
      document.setTextColor(103, 232, 249);

      document.text("LinguaGo · Aprende una palabra a la vez", 30, 29);

      let currentY = 48;

      for (const [groupKey, groupEntries] of orderedGroups) {
        if (currentY > pageHeight - 45) {
          document.addPage();
          currentY = 20;
        }

        const [sourceLanguage, targetLanguage] = groupKey.split("-");

        const sourceLabel = getLanguageLabel(sourceLanguage);
        const targetLabel = getLanguageLabel(targetLanguage);

        const groupTitle = `${sourceLabel} a ${targetLabel}`.toUpperCase();

        document.setFillColor(16, 185, 129);
        document.roundedRect(15, currentY - 4, 3, 6, 1, 1, "F");

        document.setFont("helvetica", "bold");
        document.setFontSize(11);
        document.setTextColor(15, 23, 42);

        document.text(groupTitle, 22, currentY);

        const orderedEntries = [...groupEntries].sort(
          (firstEntry, secondEntry) =>
            firstEntry.word.localeCompare(secondEntry.word, "es", {
              sensitivity: "base",
            }),
        );

        const pdfRows = orderedEntries.map((entry) => {
          const wordContent = entry.example
            ? `${entry.word}\n\nEjemplo: ${entry.example}`
            : entry.word;

          const translationContent = entry.alternativeTranslation
            ? `${entry.translation}\n\nTambién: ${entry.alternativeTranslation}`
            : entry.translation;

          return [wordContent, translationContent];
        });

        autoTable(document, {
          startY: currentY + 4,

          head: [["Palabra", "Traducción"]],

          body: pdfRows,

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 9.5,
            cellPadding: 4,
            valign: "top",
            lineColor: [203, 213, 225],
            lineWidth: 0.2,
            textColor: [30, 41, 59],
            overflow: "linebreak",
          },

          headStyles: {
            fillColor: [8, 145, 178],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "left",
            valign: "middle",
            lineColor: [8, 145, 178],
          },

          alternateRowStyles: {
            fillColor: [240, 253, 250],
          },

          columnStyles: {
            0: {
              cellWidth: 105,
              textColor: [15, 23, 42],
            },

            1: {
              cellWidth: 69,
              textColor: [30, 41, 59],
            },
          },

          didParseCell: (data) => {
            if (data.section !== "body") {
              return;
            }

            if (data.column.index === 0) {
              data.cell.styles.textColor = [13, 148, 136];
            }

            if (data.column.index === 1) {
              data.cell.styles.textColor = [30, 41, 59];
            }
          },

          margin: {
            left: 15,
            right: 15,
            bottom: 18,
          },

          rowPageBreak: "avoid",
        });

        const documentWithTable = document as typeof document & {
          lastAutoTable?: {
            finalY: number;
          };
        };

        currentY = (documentWithTable.lastAutoTable?.finalY ?? currentY) + 12;
      }

      const totalPages = document.getNumberOfPages();

      if (totalPages > 1) {
        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
          document.setPage(pageNumber);

          document.setDrawColor(165, 243, 252);

          document.line(15, pageHeight - 14, pageWidth - 15, pageHeight - 14);

          document.setFont("helvetica", "normal");
          document.setFontSize(8);
          document.setTextColor(71, 85, 105);

          document.text(
            `${pageNumber} / ${totalPages}`,
            pageWidth / 2,
            pageHeight - 8,
            {
              align: "center",
            },
          );
        }
      }

      document.save("mi-vocabulario-linguago.pdf");

      setMessage("El vocabulario se descargó correctamente.");
      setMessageType("success");
    } catch (error) {
      console.error("Error generando el PDF:", error);

      setMessage("No fue posible generar el archivo PDF.");
      setMessageType("error");
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function speakWord(
  entry: VocabularyEntry,
) {
  try {
    await speakText(
      entry.word,
      entry.sourceLanguage,
    );
  } catch {
    setMessage(
      "Tu navegador no permite reproducir pronunciaciones.",
    );

    setMessageType("error");
  }
}

  return (
    <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
      <section className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-6 xl:sticky xl:top-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl font-black">
          Aa
        </div>

        <h2 className="mt-5 text-2xl font-black">Agregar automáticamente</h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Escribe una palabra y LinguaGo buscará su traducción y una oración de
          ejemplo antes de guardarla.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="word"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Palabra
            </label>

            <input
              id="word"
              name="word"
              value={form.word}
              onChange={(event) => updateForm("word", event.target.value)}
              required
              maxLength={100}
              placeholder="Ejemplo: journey"
              autoComplete="off"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="sourceLanguage"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Idioma de la palabra
            </label>

            <select
              id="sourceLanguage"
              value={form.sourceLanguage}
              onChange={(event) =>
                updateForm("sourceLanguage", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-teal-400"
            >
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="targetLanguage"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Traducir al
            </label>

            <select
              id="targetLanguage"
              value={form.targetLanguage}
              onChange={(event) =>
                updateForm("targetLanguage", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-teal-400"
            >
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Traduciendo y guardando..." : "Traducir y guardar"}
          </button>

          {message && (
            <p
              className={`rounded-2xl border p-3 text-center text-sm ${
                messageType === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/20 bg-red-400/10 text-red-300"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </section>

      <section>
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar palabra, traducción o ejemplo..."
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-teal-400"
          />

          <select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          >
            <option value="all">Todos los idiomas</option>

            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={downloadVocabularyPdf}
            disabled={isExportingPdf || isLoading || entries.length === 0}
            className="whitespace-nowrap rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg shadow-teal-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingPdf ? "Generando PDF..." : "Descargar PDF"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1
              ? "palabra encontrada"
              : "palabras encontradas"}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            Cargando vocabulario...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 p-12 text-center">
            <p className="text-xl font-bold">No hay palabras para mostrar</p>

            <p className="mt-2 text-slate-500">
              Agrega una palabra o modifica los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                className={`rounded-[2rem] border p-6 transition hover:-translate-y-1 ${
                  entry.isLearned
                    ? "border-emerald-400/25 bg-emerald-400/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black">{entry.word}</p>

                    <p className="mt-1 text-lg font-semibold text-teal-300">
                      {entry.translation}
                    </p>

                    {entry.alternativeTranslation && (
                      <p className="mt-1 text-sm text-slate-400">
                        También:{" "}
                        <span className="font-semibold text-cyan-300">
                          {entry.alternativeTranslation}
                        </span>
                      </p>
                    )}

                    {editingAlternativeId === entry.id ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Traducción alternativa
                        </p>

                        <input
                          value={alternativeTranslationDraft}
                          onChange={(event) =>
                            setAlternativeTranslationDraft(event.target.value)
                          }
                          maxLength={150}
                          autoFocus
                          placeholder="Ejemplo: ejecutar"
                          className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                        />

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveAlternativeTranslation(entry)}
                            className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                          >
                            Guardar
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditingAlternative}
                            className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/10"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-4">
                        {!entry.alternativeTranslation && (
                          <button
                            type="button"
                            onClick={() => completeAutomatically(entry)}
                            className="text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                          >
                            ✦ Buscar alternativa automáticamente
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => startEditingAlternative(entry)}
                          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                        >
                          {entry.alternativeTranslation
                            ? "Editar traducción alternativa"
                            : "+ Añadir manualmente"}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateEntry(entry, {
                        isFavorite: !entry.isFavorite,
                      })
                    }
                    className={`text-2xl transition hover:scale-110 ${
                      entry.isFavorite ? "text-amber-300" : "text-slate-600"
                    }`}
                    aria-label={
                      entry.isFavorite
                        ? "Quitar de favoritas"
                        : "Marcar como favorita"
                    }
                  >
                    ★
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/5 px-3 py-1.5 text-slate-400">
                    {getLanguageLabel(entry.sourceLanguage)}
                  </span>

                  <span className="text-slate-600">→</span>

                  <span className="rounded-full bg-white/5 px-3 py-1.5 text-slate-400">
                    {getLanguageLabel(entry.targetLanguage)}
                  </span>

                  <span
                    className={`ml-auto rounded-full px-3 py-1.5 ${
                      entry.isLearned
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-cyan-400/10 text-cyan-300"
                    }`}
                  >
                    {entry.isLearned ? "Aprendida" : "Pendiente"}
                  </span>
                </div>

                {entry.example && (
                  <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-slate-950/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-400">
                      Oración de ejemplo
                    </p>

                    <p className="mt-2 text-sm italic leading-6 text-slate-300">
                      “{entry.example}”
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => speakWord(entry)}
                    className="rounded-xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Escuchar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateEntry(entry, {
                        isLearned: !entry.isLearned,
                      })
                    }
                    className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                  >
                    {entry.isLearned ? "Marcar pendiente" : "Marcar aprendida"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="rounded-xl bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/20"
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
