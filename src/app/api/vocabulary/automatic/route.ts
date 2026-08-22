import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const supportedLanguages = [
  "en",
  "es",
  "fr",
  "pt",
] as const;

type SupportedLanguage =
  (typeof supportedLanguages)[number];

const tatoebaLanguageCodes: Record<
  SupportedLanguage,
  string
> = {
  en: "eng",
  es: "spa",
  fr: "fra",
  pt: "por",
};

type MyMemoryMatch = {
  translation?: string;
  match?: number | string;
  quality?: number | string;
};

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };

  matches?: MyMemoryMatch[];

  responseStatus?: number;
  responseDetails?: string;
};

type TatoebaSentence = {
  id?: number;
  text?: string;
  lang?: string | null;
};

type TatoebaSearchResponse = {
  data?: TatoebaSentence[];
};

function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    supportedLanguages.includes(
      value as SupportedLanguage,
    )
  );
}

/*
 * Normaliza textos para poder comparar
 * traducciones y evitar duplicados.
 */
function normalizeText(
  text: string,
) {
  return text
    .trim()
    .toLocaleLowerCase()
    .replace(/[.,!?;:()[\]{}"'“”‘’]/g, "")
    .replace(/\s+/g, " ");
}

/*
 * Obtiene una traducción alternativa
 * distinta de la traducción principal.
 */
function findAlternativeTranslation(
  result: MyMemoryResponse,
  word: string,
  mainTranslation: string,
): string | null {
  const normalizedMain =
    normalizeText(mainTranslation);

  const normalizedWord =
    normalizeText(word);

  const candidates =
    result.matches
      ?.map((match) => {
        const translation =
          match.translation?.trim();

        const rawScore =
          match.match ?? 0;

        const score =
          typeof rawScore === "number"
            ? rawScore
            : Number(rawScore) || 0;

        return {
          translation,
          score,
        };
      })
      .filter(
        (
          candidate,
        ): candidate is {
          translation: string;
          score: number;
        } =>
          typeof candidate.translation ===
            "string" &&
          candidate.translation.length > 0,
      )
      .sort(
        (first, second) =>
          second.score -
          first.score,
      ) ?? [];

  for (const candidate of candidates) {
    const normalizedCandidate =
      normalizeText(
        candidate.translation,
      );

    if (
      !normalizedCandidate ||
      normalizedCandidate ===
        normalizedMain ||
      normalizedCandidate ===
        normalizedWord
    ) {
      continue;
    }

    /*
     * Evita almacenar respuestas
     * demasiado largas como alternativa.
     */
    if (
      candidate.translation.length >
      100
    ) {
      continue;
    }

    return candidate.translation;
  }

  return null;
}

/*
 * Busca una oración breve en Tatoeba.
 * Si no encuentra una, simplemente
 * devuelve null.
 */
async function findExampleSentence(
  word: string,
  language: SupportedLanguage,
): Promise<string | null> {
  try {
    const safeQuery = word
      .replace(
        /[^\p{L}\p{M}\p{N}'’-]/gu,
        " ",
      )
      .replace(/\s+/g, " ")
      .trim();

    if (!safeQuery) {
      return null;
    }

    const params =
      new URLSearchParams({
        lang: tatoebaLanguageCodes[
          language
        ],
        q: safeQuery,
        word_count: "3-14",
        is_unapproved: "no",
        is_orphan: "no",
        sort: "relevance",
        limit: "10",
        showtrans: "none",
      });

    const response = await fetch(
      `https://api.tatoeba.org/v1/sentences?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        signal:
          AbortSignal.timeout(
            5000,
          ),
      },
    );

    if (!response.ok) {
      console.warn(
        `Tatoeba respondió con ${response.status}`,
      );

      return null;
    }

    const result =
      (await response.json()) as TatoebaSearchResponse;

    const candidates =
      (result.data ?? [])
        .map((sentence) =>
          sentence.text?.trim(),
        )
        .filter(
          (
            text,
          ): text is string =>
            typeof text ===
              "string" &&
            text.length >= 8 &&
            text.length <= 180,
        );

    return candidates[0] ?? null;
  } catch (error) {
    console.warn(
      "No se encontró una oración de ejemplo:",
      error,
    );

    return null;
  }
}

export async function POST(
  request: Request,
) {
  const session =
    await auth.api.getSession({
      headers: request.headers,
    });

  if (!session) {
    return NextResponse.json(
      {
        error: "No autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body: unknown =
      await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("word" in body) ||
      !("sourceLanguage" in body) ||
      !("targetLanguage" in body)
    ) {
      return NextResponse.json(
        {
          error:
            "Los datos enviados no son válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const word =
      typeof body.word === "string"
        ? body.word.trim()
        : "";

    const sourceLanguage =
      body.sourceLanguage;

    const targetLanguage =
      body.targetLanguage;

    if (
      !word ||
      word.length > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Debes escribir una palabra de máximo 100 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isSupportedLanguage(
        sourceLanguage,
      ) ||
      !isSupportedLanguage(
        targetLanguage,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El idioma seleccionado no es válido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      sourceLanguage ===
      targetLanguage
    ) {
      return NextResponse.json(
        {
          error:
            "El idioma original y el idioma de traducción deben ser diferentes.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Evita guardar duplicados.
     */
    const existingEntry =
      await prisma.vocabularyEntry.findFirst(
        {
          where: {
            userId:
              session.user.id,

            sourceLanguage,
            targetLanguage,

            word: {
              equals: word,
              mode: "insensitive",
            },
          },
        },
      );

    if (existingEntry) {
      return NextResponse.json(
        {
          error:
            "Esta palabra ya está guardada en tu vocabulario.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * =================================
     * TRADUCCIÓN CON MYMEMORY
     * =================================
     */

    const translationParams =
      new URLSearchParams({
        q: word,

        langpair:
          `${sourceLanguage}|${targetLanguage}`,
      });

    const translationResponse =
      await fetch(
        `https://api.mymemory.translated.net/get?${translationParams.toString()}`,
        {
          method: "GET",
          cache: "no-store",

          signal:
            AbortSignal.timeout(
              8000,
            ),
        },
      );

    if (
      !translationResponse.ok
    ) {
      throw new Error(
        `MyMemory respondió con ${translationResponse.status}`,
      );
    }

    const translationResult =
      (await translationResponse.json()) as MyMemoryResponse;

    const translation =
      translationResult.responseData
        ?.translatedText
        ?.trim();

    if (
      !translation ||
      translationResult.responseStatus ===
        403 ||
      translationResult.responseStatus ===
        429
    ) {
      return NextResponse.json(
        {
          error:
            translationResult.responseDetails ||
            "No fue posible traducir la palabra.",
        },
        {
          status: 502,
        },
      );
    }

    /*
     * Busca automáticamente una
     * segunda traducción.
     */
    const alternativeTranslation =
      findAlternativeTranslation(
        translationResult,
        word,
        translation,
      );

    /*
     * =================================
     * ORACIÓN DE EJEMPLO
     * =================================
     */

    const example =
      await findExampleSentence(
        word,
        sourceLanguage,
      );

    /*
     * =================================
     * GUARDAR EN POSTGRESQL
     * =================================
     */

    const entry =
      await prisma.vocabularyEntry.create(
        {
          data: {
            word,

            translation,

            alternativeTranslation,

            sourceLanguage,

            targetLanguage,

            pronunciation: null,

            example,

            notes: null,

            userId:
              session.user.id,
          },
        },
      );

    return NextResponse.json(
      entry,
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error en POST /api/vocabulary/automatic:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible traducir y guardar la palabra.",
      },
      {
        status: 500,
      },
    );
  }
}