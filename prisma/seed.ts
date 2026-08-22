import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  ExerciseType,
  PrismaClient,
} from "../src/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está configurada.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  /*
   * Durante el desarrollo eliminamos
   * el curso anterior para poder ejecutar
   * este seed varias veces sin duplicarlo.
   */
  const existingCourse =
    await prisma.course.findUnique({
      where: {
        slug: "english-foundations-a1",
      },
    });

  if (existingCourse) {
    await prisma.course.delete({
      where: {
        id: existingCourse.id,
      },
    });
  }

  await prisma.course.create({
    data: {
      slug: "english-foundations-a1",

      title: "English Foundations",

      description:
        "Curso de inglés para principiantes diseñado para desarrollar vocabulario, comprensión, escucha y construcción de expresiones básicas.",

      /*
       * Idioma base del estudiante.
       */
      sourceLanguage: "es",

      /*
       * Idioma que está aprendiendo.
       */
      targetLanguage: "en",

      level: "A1",

      order: 1,

      isPublished: true,

      units: {
        create: [
          {
            title: "Primer contacto",

            description:
              "Aprende a saludar, despedirte y presentarte en situaciones cotidianas.",

            order: 1,

            lessons: {
              create: [
                {
                  title: "Saludos básicos",

                  description:
                    "Aprende las expresiones esenciales para iniciar una conversación en inglés.",

                  order: 1,

                  estimatedMinutes: 10,

                  exercises: {
                    create: [
                      /*
                       * 1. SELECCIÓN MÚLTIPLE
                       */
                      {
                        type:
                          ExerciseType.MULTIPLE_CHOICE,

                        instruction:
                          "Selecciona la respuesta correcta.",

                        prompt:
                          '¿Qué significa "Good morning"?',

                        order: 1,

                        correctAnswer:
                          "Buenos días",

                        explanation:
                          '"Good morning" se utiliza para saludar durante la mañana.',

                        options: {
                          create: [
                            {
                              text:
                                "Buenas noches",
                              isCorrect:
                                false,
                              order: 1,
                            },

                            {
                              text:
                                "Buenos días",
                              isCorrect:
                                true,
                              order: 2,
                            },

                            {
                              text:
                                "Hasta luego",
                              isCorrect:
                                false,
                              order: 3,
                            },

                            {
                              text:
                                "Gracias",
                              isCorrect:
                                false,
                              order: 4,
                            },
                          ],
                        },
                      },

                      /*
                       * 2. COMPLETAR
                       */
                      {
                        type:
                          ExerciseType.FILL_BLANK,

                        instruction:
                          "Completa la oración.",

                        prompt:
                          "Hello! My name ___ David.",

                        order: 2,

                        correctAnswer: "is",

                        explanation:
                          'Para decir "Mi nombre es...", usamos "My name is...".',
                      },

                      /*
                       * 3. ORDENAR PALABRAS
                       */
                      {
                        type:
                          ExerciseType.ORDER_WORDS,

                        instruction:
                          "Ordena las palabras para formar una oración correcta.",

                        prompt:
                          "Construye la oración.",

                        order: 3,

                        correctAnswer:
                          "My name is Wilmer",

                        items: [
                          "name",
                          "Wilmer",
                          "My",
                          "is",
                        ],

                        explanation:
                          'La estructura correcta es "My name is Wilmer".',
                      },

                      /*
                       * 4. LISTENING
                       */
                      {
                        type:
                          ExerciseType.LISTENING_CHOICE,

                        instruction:
                          "Escucha el audio y selecciona lo que escuchaste.",

                        prompt:
                          "¿Qué expresión escuchaste?",

                        audioText:
                          "Good morning",

                        order: 4,

                        correctAnswer:
                          "Good morning",

                        explanation:
                          '"Good morning" significa "Buenos días".',

                        options: {
                          create: [
                            {
                              text:
                                "Good night",
                              isCorrect:
                                false,
                              order: 1,
                            },

                            {
                              text:
                                "Goodbye",
                              isCorrect:
                                false,
                              order: 2,
                            },

                            {
                              text:
                                "Good morning",
                              isCorrect:
                                true,
                              order: 3,
                            },

                            {
                              text:
                                "Thank you",
                              isCorrect:
                                false,
                              order: 4,
                            },
                          ],
                        },
                      },

                      /*
                       * 5. TRADUCCIÓN
                       */
                      {
                        type:
                          ExerciseType.TRANSLATION,

                        instruction:
                          "Escribe la traducción en inglés.",

                        prompt:
                          "Hola, mi nombre es Ana.",

                        order: 5,

                        correctAnswer:
                          "Hello, my name is Ana.",

                        explanation:
                          'Una forma natural de expresarlo es "Hello, my name is Ana."',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(
    "✅ English Foundations A1 creado correctamente.",
  );
}

main()
  .catch((error) => {
    console.error(
      "❌ Error creando el curso:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });