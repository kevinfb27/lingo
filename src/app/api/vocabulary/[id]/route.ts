import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const existingEntry =
    await prisma.vocabularyEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

  if (!existingEntry) {
    return NextResponse.json(
      { error: "Palabra no encontrada." },
      { status: 404 }
    );
  }

  const body: unknown = await request.json();

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json(
      { error: "Datos no válidos." },
      { status: 400 }
    );
  }

  const data: {
    isLearned?: boolean;
    isFavorite?: boolean;
    alternativeTranslation?: string | null;
  } = {};

  if (
    "isLearned" in body &&
    typeof body.isLearned === "boolean"
  ) {
    data.isLearned = body.isLearned;
  }

  if (
    "isFavorite" in body &&
    typeof body.isFavorite === "boolean"
  ) {
    data.isFavorite = body.isFavorite;
  }

  if ("alternativeTranslation" in body) {
    if (
      body.alternativeTranslation === null
    ) {
      data.alternativeTranslation = null;
    } else if (
      typeof body.alternativeTranslation ===
      "string"
    ) {
      const cleanTranslation =
        body.alternativeTranslation.trim();

      if (cleanTranslation.length > 150) {
        return NextResponse.json(
          {
            error:
              "La traducción alternativa es demasiado larga.",
          },
          { status: 400 }
        );
      }

      data.alternativeTranslation =
        cleanTranslation || null;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No hay cambios válidos." },
      { status: 400 }
    );
  }

  const updatedEntry =
    await prisma.vocabularyEntry.update({
      where: {
        id,
      },
      data,
    });

  return NextResponse.json(updatedEntry);
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const existingEntry =
    await prisma.vocabularyEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

  if (!existingEntry) {
    return NextResponse.json(
      { error: "Palabra no encontrada." },
      { status: 404 }
    );
  }

  await prisma.vocabularyEntry.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Palabra eliminada.",
  });
}