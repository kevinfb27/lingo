import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  const entries = await prisma.vocabularyEntry.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const word = getText(body.word);
    const translation = getText(body.translation);
    const pronunciation = getText(body.pronunciation);
    const sourceLanguage = getText(body.sourceLanguage);
    const targetLanguage = getText(body.targetLanguage);
    const example = getText(body.example);
    const notes = getText(body.notes);

    if (
      !word ||
      !translation ||
      !sourceLanguage ||
      !targetLanguage
    ) {
      return NextResponse.json(
        {
          error:
            "La palabra, traducción e idiomas son obligatorios.",
        },
        { status: 400 }
      );
    }

    const entry = await prisma.vocabularyEntry.create({
      data: {
        word,
        translation,
        pronunciation: pronunciation || null,
        sourceLanguage,
        targetLanguage,
        example: example || null,
        notes: notes || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creando vocabulario:", error);

    return NextResponse.json(
      { error: "No fue posible guardar la palabra." },
      { status: 500 }
    );
  }
}