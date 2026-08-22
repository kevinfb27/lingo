import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type MyMemoryMatch = {
  translation?: string;
  match?: number;
};

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };

  matches?: MyMemoryMatch[];
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      {
        error: "No autorizado.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await context.params;

  try {
    const entry =
      await prisma.vocabularyEntry.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      });

    if (!entry) {
      return NextResponse.json(
        {
          error: "Palabra no encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    const params = new URLSearchParams({
      q: entry.word,
      langpair:
        `${entry.sourceLanguage}|${entry.targetLanguage}`,
    });

    const response = await fetch(
      `https://api.mymemory.translated.net/get?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "No fue posible consultar traducciones.",
        },
        {
          status: 502,
        }
      );
    }

    const result =
      (await response.json()) as MyMemoryResponse;

    const mainTranslation =
      entry.translation
        .trim()
        .toLocaleLowerCase();

    const originalWord =
      entry.word
        .trim()
        .toLocaleLowerCase();

    const alternativeTranslation =
      result.matches
        ?.map((match) => ({
          translation:
            match.translation?.trim(),

          score:
            typeof match.match === "number"
              ? match.match
              : 0,
        }))
        .filter(
          (
            candidate
          ): candidate is {
            translation: string;
            score: number;
          } =>
            typeof candidate.translation ===
              "string" &&
            candidate.translation.length > 0
        )
        .sort(
          (first, second) =>
            second.score -
            first.score
        )
        .find((candidate) => {
          const normalized =
            candidate.translation.toLocaleLowerCase();

          return (
            normalized !==
              mainTranslation &&
            normalized !==
              originalWord &&
            candidate.translation.length <=
              100
          );
        })
        ?.translation ?? null;

    if (!alternativeTranslation) {
      return NextResponse.json(
        {
          error:
            "No encontramos una traducción alternativa útil para esta palabra.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedEntry =
      await prisma.vocabularyEntry.update({
        where: {
          id: entry.id,
        },

        data: {
          alternativeTranslation,
        },
      });

    return NextResponse.json(
      updatedEntry
    );
  } catch (error) {
    console.error(
      "Error completando vocabulario:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No fue posible completar automáticamente la palabra.",
      },
      {
        status: 500,
      }
    );
  }
}