import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  ExerciseType,
  LessonContentType,
  Prisma,
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

type ContentBlockSeed = {
  type: LessonContentType;
  title: string;
  body?: string;
  order: number;
  items?: Prisma.InputJsonValue;
};

type ExerciseOptionSeed = {
  text: string;
  isCorrect: boolean;
  order: number;
};

type ExerciseSeed = {
  type: ExerciseType;
  instruction: string;
  prompt: string;
  order: number;
  correctAnswer?: string;
  acceptedAnswers?: Prisma.InputJsonValue;
  audioText?: string;
  explanation?: string;
  items?: Prisma.InputJsonValue;
  options?: ExerciseOptionSeed[];
};

type LessonSeed = {
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  contentBlocks: ContentBlockSeed[];
  exercises: ExerciseSeed[];
};

async function upsertLesson(
  unitId: string,
  data: LessonSeed,
) {
  const lesson =
    await prisma.lesson.upsert({
      where: {
        unitId_order: {
          unitId,
          order: data.order,
        },
      },

      update: {
        title: data.title,
        description:
          data.description,
        estimatedMinutes:
          data.estimatedMinutes,
      },

      create: {
        unitId,
        title: data.title,
        description:
          data.description,
        order: data.order,
        estimatedMinutes:
          data.estimatedMinutes,
      },
    });

  /*
   * =====================================
   * CONTENIDO DE ENSEÑANZA
   * =====================================
   */
  for (
    const block of
    data.contentBlocks
  ) {
    await prisma.lessonContentBlock.upsert({
      where: {
        lessonId_order: {
          lessonId: lesson.id,
          order: block.order,
        },
      },

      update: {
        type: block.type,
        title: block.title,
        body: block.body ?? null,

        ...(block.items !==
        undefined
          ? {
              items:
                block.items,
            }
          : {}),
      },

      create: {
        lessonId: lesson.id,
        type: block.type,
        title: block.title,
        body: block.body,
        order: block.order,

        ...(block.items !==
        undefined
          ? {
              items:
                block.items,
            }
          : {}),
      },
    });
  }

  /*
   * =====================================
   * EJERCICIOS
   * =====================================
   */
  for (
    const exerciseData of
    data.exercises
  ) {
    const exercise =
      await prisma.exercise.upsert({
        where: {
          lessonId_order: {
            lessonId:
              lesson.id,

            order:
              exerciseData.order,
          },
        },

        update: {
          type:
            exerciseData.type,

          instruction:
            exerciseData.instruction,

          prompt:
            exerciseData.prompt,

          correctAnswer:
            exerciseData.correctAnswer ??
            null,

          audioText:
            exerciseData.audioText ??
            null,

          explanation:
            exerciseData.explanation ??
            null,

          ...(exerciseData.acceptedAnswers !==
          undefined
            ? {
                acceptedAnswers:
                  exerciseData.acceptedAnswers,
              }
            : {}),

          ...(exerciseData.items !==
          undefined
            ? {
                items:
                  exerciseData.items,
              }
            : {}),
        },

        create: {
          lessonId:
            lesson.id,

          type:
            exerciseData.type,

          instruction:
            exerciseData.instruction,

          prompt:
            exerciseData.prompt,

          order:
            exerciseData.order,

          correctAnswer:
            exerciseData.correctAnswer,

          audioText:
            exerciseData.audioText,

          explanation:
            exerciseData.explanation,

          ...(exerciseData.acceptedAnswers !==
          undefined
            ? {
                acceptedAnswers:
                  exerciseData.acceptedAnswers,
              }
            : {}),

          ...(exerciseData.items !==
          undefined
            ? {
                items:
                  exerciseData.items,
              }
            : {}),
        },
      });

    /*
     * Opciones de selección.
     * También usamos upsert para
     * conservar sus IDs.
     */
    if (
      exerciseData.options
    ) {
      for (
        const option of
        exerciseData.options
      ) {
        await prisma.exerciseOption.upsert({
          where: {
            exerciseId_order: {
              exerciseId:
                exercise.id,

              order:
                option.order,
            },
          },

          update: {
            text: option.text,

            isCorrect:
              option.isCorrect,
          },

          create: {
            exerciseId:
              exercise.id,

            text: option.text,

            isCorrect:
              option.isCorrect,

            order:
              option.order,
          },
        });
      }
    }
  }

  return lesson;
}

async function main() {
  /*
   * =====================================
   * CURSO
   * =====================================
   *
   * IMPORTANTE:
   * Ya NO eliminamos el curso.
   *
   * Así conservamos:
   * - IDs
   * - progreso
   * - intentos
   * - lecciones completadas
   */

  const course =
    await prisma.course.upsert({
      where: {
        slug:
          "english-foundations-a1",
      },

      update: {
        title:
          "English Foundations",

        description:
          "Curso progresivo de inglés A1 enfocado en comprensión, escucha, vocabulario, construcción de frases y comunicación básica en situaciones reales.",

        sourceLanguage: "es",
        targetLanguage: "en",
        level: "A1",
        order: 1,
        isPublished: true,
      },

      create: {
        slug:
          "english-foundations-a1",

        title:
          "English Foundations",

        description:
          "Curso progresivo de inglés A1 enfocado en comprensión, escucha, vocabulario, construcción de frases y comunicación básica en situaciones reales.",

        sourceLanguage: "es",
        targetLanguage: "en",
        level: "A1",
        order: 1,
        isPublished: true,
      },
    });

  /*
   * =====================================
   * UNIDAD 1
   * =====================================
   */

  const unit =
    await prisma.courseUnit.upsert({
      where: {
        courseId_order: {
          courseId:
            course.id,

          order: 1,
        },
      },

      update: {
        title:
          "Primer contacto",

        description:
          "Aprende a iniciar y cerrar conversaciones sencillas, saludar apropiadamente y presentarte con naturalidad.",
      },

      create: {
        courseId:
          course.id,

        title:
          "Primer contacto",

        description:
          "Aprende a iniciar y cerrar conversaciones sencillas, saludar apropiadamente y presentarte con naturalidad.",

        order: 1,
      },
    });

  /*
   * =====================================
   * LECCIÓN 1
   * SALUDOS Y CORTESÍA
   * =====================================
   */

  await upsertLesson(
    unit.id,
    {
      title:
        "Saludos y cortesía",

      description:
        "Aprende a escoger saludos adecuados según la hora y el contexto y a responder de forma natural.",

      order: 1,

      estimatedMinutes: 12,

      contentBlocks: [
        {
          type:
            LessonContentType.INTRO,

          title:
            "Saludos y cortesía",

          body:
            "En inglés no usamos el mismo saludo durante todo el día. El momento y la situación determinan cuál expresión resulta más natural.\n\nEn esta lección aprenderás a saludar, preguntar cómo está alguien y responder de manera apropiada.",

          order: 1,
        },

        {
          type:
            LessonContentType.VOCABULARY,

          title:
            "Saludos según el momento",

          body:
            "Observa las diferencias entre estas expresiones.",

          order: 2,

          items: [
            {
              term:
                "Good morning",

              translation:
                "Buenos días",

              note:
                "Se utiliza principalmente durante la mañana.",

              example:
                "Good morning, Mr. Smith.",
            },

            {
              term:
                "Good afternoon",

              translation:
                "Buenas tardes",

              note:
                "Se utiliza después del mediodía y durante la tarde.",

              example:
                "Good afternoon, everyone.",
            },

            {
              term:
                "Good evening",

              translation:
                "Buenas tardes / noches",

              note:
                "Se usa como saludo cuando ya es tarde.",

              example:
                "Good evening. How are you?",
            },

            {
              term:
                "Good night",

              translation:
                "Buenas noches",

              note:
                "Normalmente se utiliza para despedirse o antes de dormir, no para iniciar una conversación.",

              example:
                "Good night. See you tomorrow.",
            },
          ],
        },

        {
          type:
            LessonContentType.EXAMPLE,

          title:
            "¿Cómo estás?",

          body:
            'Una de las preguntas más frecuentes después de saludar es "How are you?". No necesitas responder siempre exactamente de la misma manera.',

          order: 3,

          items: [
            {
              term:
                "How are you?",

              translation:
                "¿Cómo estás?",

              example:
                "Good morning! How are you?",
            },

            {
              term:
                "I'm fine, thanks.",

              translation:
                "Estoy bien, gracias.",
            },

            {
              term:
                "I'm good, thank you.",

              translation:
                "Estoy bien, gracias.",
            },

            {
              term:
                "Pretty good.",

              translation:
                "Bastante bien.",
            },
          ],
        },
      ],

      exercises: [
        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Selecciona el saludo más apropiado.",

          prompt:
            "Son las 8:15 a. m. y llegas a tu trabajo. ¿Qué dices?",

          order: 1,

          correctAnswer:
            "Good morning",

          explanation:
            '"Good morning" se usa normalmente durante la mañana.',

          options: [
            {
              text:
                "Good evening",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "Good morning",

              isCorrect:
                true,

              order: 2,
            },

            {
              text:
                "Good night",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "Goodbye",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Escoge la respuesta más natural.",

          prompt:
            'Someone says: "Nice to meet you." ¿Cómo respondes?',

          order: 2,

          correctAnswer:
            "Nice to meet you too.",

          explanation:
            '"Nice to meet you too" corresponde naturalmente a "Nice to meet you".',

          options: [
            {
              text:
                "Good night.",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "Nice to meet you too.",

              isCorrect:
                true,

              order: 2,
            },

            {
              text:
                "I'm twenty.",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "Goodbye morning.",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.FILL_BLANK,

          instruction:
            "Completa la expresión según el contexto.",

          prompt:
            "Good ___, Mr. Brown. It's 7:30 p.m.",

          order: 3,

          correctAnswer:
            "evening",

          explanation:
            '"Good evening" se utiliza como saludo durante la tarde-noche.',
        },

        {
          type:
            ExerciseType.LISTENING_CHOICE,

          instruction:
            "Escucha y elige la respuesta apropiada.",

          prompt:
            "¿Cómo responderías a lo que escuchaste?",

          audioText:
            "How are you?",

          order: 4,

          correctAnswer:
            "I'm fine, thanks.",

          explanation:
            '"How are you?" pregunta cómo estás.',

          options: [
            {
              text:
                "My name is John.",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "I'm fine, thanks.",

              isCorrect:
                true,

              order: 2,
            },

            {
              text:
                "Good night.",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "I'm from Colombia.",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.ORDER_WORDS,

          instruction:
            "Ordena las palabras.",

          prompt:
            "Construye una expresión natural.",

          order: 5,

          correctAnswer:
            "Nice to meet you",

          items: [
            "meet",
            "you",
            "Nice",
            "to",
          ],

          explanation:
            'El orden correcto es "Nice to meet you".',
        },

        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Lee la conversación y responde.",

          prompt:
            "David: Good morning, Laura.\nLaura: Morning! How are you?\nDavid: I'm good, thanks.\n\n¿Qué está haciendo David?",

          order: 6,

          correctAnswer:
            "Saludando y respondiendo cómo está",

          explanation:
            "David saluda a Laura y luego responde a la pregunta sobre cómo se encuentra.",

          options: [
            {
              text:
                "Despidiéndose",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "Saludando y respondiendo cómo está",

              isCorrect:
                true,

              order: 2,
            },

            {
              text:
                "Diciendo su edad",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "Preguntando una dirección",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.LISTENING_CHOICE,

          instruction:
            "Escucha y escoge una respuesta natural.",

          prompt:
            "¿Qué responderías?",

          audioText:
            "Good evening. How are you?",

          order: 7,

          correctAnswer:
            "Good evening. I'm good, thanks.",

          explanation:
            "La respuesta mantiene el saludo y contesta cómo estás.",

          options: [
            {
              text:
                "Good evening. I'm good, thanks.",

              isCorrect:
                true,

              order: 1,
            },

            {
              text:
                "Good morning. Twenty.",

              isCorrect:
                false,

              order: 2,
            },

            {
              text:
                "My country is Colombia.",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "Goodbye morning.",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.TRANSLATION,

          instruction:
            "Responde naturalmente en inglés.",

          prompt:
            'Una persona te dice: "Good morning! How are you?" Responde que estás bien y agradece.',

          order: 8,

          correctAnswer:
            "I'm fine, thanks.",

          acceptedAnswers: [
            "I'm fine, thanks.",
            "I am fine, thanks.",
            "I'm fine, thank you.",
            "I am fine, thank you.",
            "I'm good, thanks.",
            "I am good, thanks.",
            "I'm good, thank you.",
            "I am good, thank you.",
            "Good morning, I'm fine, thanks.",
            "Good morning, I'm good, thanks.",
          ],

          explanation:
            'Puedes responder con expresiones como "I\'m fine, thanks" o "I\'m good, thank you".',
        },
      ],
    },
  );

  /*
   * =====================================
   * LECCIÓN 2
   * PRESENTARSE
   * =====================================
   */

  await upsertLesson(
    unit.id,
    {
      title: "Presentarse",

      description:
        "Aprende a decir tu nombre, preguntar el nombre de otra persona y reaccionar apropiadamente.",

      order: 2,

      estimatedMinutes: 14,

      contentBlocks: [
        {
          type:
            LessonContentType.INTRO,

          title:
            "Presentarte en inglés",

          body:
            "Cuando conoces a alguien, normalmente necesitas decir tu nombre y preguntar el suyo.\n\nEn inglés existen varias formas naturales de hacerlo. No tienes que memorizar una única frase.",

          order: 1,
        },

        {
          type:
            LessonContentType.GRAMMAR,

          title:
            "Tres estructuras importantes",

          body:
            "Observa cómo podemos decir nuestro nombre y preguntar el de otra persona.",

          order: 2,

          items: [
            {
              term:
                "My name is Laura.",

              translation:
                "Mi nombre es Laura.",

              note:
                "Forma completa y muy clara.",
            },

            {
              term:
                "I'm Laura.",

              translation:
                "Soy Laura.",

              note:
                "Forma más corta y muy común en una conversación.",
            },

            {
              term:
                "What's your name?",

              translation:
                "¿Cómo te llamas?",

              note:
                'Es la contracción natural de "What is your name?".',
            },
          ],
        },

        {
          type:
            LessonContentType.EXAMPLE,

          title:
            "Una conversación natural",

          body:
            "No estudies únicamente frases aisladas. Observa cómo aparecen dentro de una conversación.",

          order: 3,

          items: [
            {
              term:
                "Hi! I'm David. What's your name?",

              translation:
                "¡Hola! Soy David. ¿Cómo te llamas?",
            },

            {
              term:
                "I'm Sarah. Nice to meet you.",

              translation:
                "Soy Sarah. Mucho gusto.",
            },

            {
              term:
                "Nice to meet you too.",

              translation:
                "Mucho gusto también.",
            },
          ],
        },
      ],

      exercises: [
        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Selecciona la opción correcta.",

          prompt:
            '¿Qué pregunta significa "¿Cómo te llamas?"?',

          order: 1,

          correctAnswer:
            "What's your name?",

          explanation:
            '"What\'s your name?" es la forma común de preguntar el nombre de alguien.',

          options: [
            {
              text:
                "How old are you?",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "What's your name?",

              isCorrect:
                true,

              order: 2,
            },

            {
              text:
                "Where are you?",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "How are you?",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.FILL_BLANK,

          instruction:
            "Completa la presentación.",

          prompt:
            "Hi! My name ___ Sofia.",

          order: 2,

          correctAnswer:
            "is",

          explanation:
            'La estructura es "My name is...".',
        },

        {
          type:
            ExerciseType.FILL_BLANK,

          instruction:
            "Completa con la forma correcta.",

          prompt:
            "Hello. I ___ Daniel.",

          order: 3,

          correctAnswer:
            "am",

          acceptedAnswers: [
            "am",
            "'m",
          ],

          explanation:
            'Podemos decir "I am Daniel" o usar la contracción "I\'m Daniel".',
        },

        {
          type:
            ExerciseType.ORDER_WORDS,

          instruction:
            "Ordena las palabras.",

          prompt:
            "Forma una pregunta correcta.",

          order: 4,

          correctAnswer:
            "What is your name",

          acceptedAnswers: [
            "What is your name",
            "What's your name",
          ],

          items: [
            "your",
            "What",
            "name",
            "is",
          ],

          explanation:
            'La pregunta es "What is your name?" y normalmente se contrae como "What\'s your name?".',
        },

        {
          type:
            ExerciseType.LISTENING_CHOICE,

          instruction:
            "Escucha la presentación.",

          prompt:
            "¿Cómo se llama la persona?",

          audioText:
            "Hi, my name is Emily. Nice to meet you.",

          order: 5,

          correctAnswer:
            "Emily",

          explanation:
            'La persona dice "My name is Emily".',

          options: [
            {
              text:
                "Emma",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "Emily",

              isCorrect:
                true,

              order: 2,
            },

            {
              text:
                "Sofia",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "Laura",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Escoge la respuesta más natural.",

          prompt:
            'A: "Hi! I\'m Peter. What\'s your name?"\nB: ...',

          order: 6,

          correctAnswer:
            "I'm Laura. Nice to meet you.",

          explanation:
            "La respuesta contesta el nombre y mantiene naturalmente la conversación.",

          options: [
            {
              text:
                "I'm Laura. Nice to meet you.",

              isCorrect:
                true,

              order: 1,
            },

            {
              text:
                "Good night morning.",

              isCorrect:
                false,

              order: 2,
            },

            {
              text:
                "I'm fine twenty.",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "See you yesterday.",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.TRANSLATION,

          instruction:
            "Responde naturalmente.",

          prompt:
            "Te llamas Carlos. Una persona te pregunta: What's your name?",

          order: 7,

          correctAnswer:
            "My name is Carlos.",

          acceptedAnswers: [
            "My name is Carlos.",
            "My name's Carlos.",
            "I'm Carlos.",
            "I am Carlos.",
            "Carlos.",
          ],

          explanation:
            'Puedes responder "My name is Carlos" o simplemente "I\'m Carlos".',
        },

        {
          type:
            ExerciseType.TRANSLATION,

          instruction:
            "Responde a la situación en inglés.",

          prompt:
            'Una persona dice: "Hi! I\'m Robert." Te llamas Ana. Salúdalo y preséntate.',

          order: 8,

          correctAnswer:
            "Hi Robert, I'm Ana.",

          acceptedAnswers: [
            "Hi Robert, I'm Ana.",
            "Hello Robert, I'm Ana.",
            "Hi Robert, my name is Ana.",
            "Hello Robert, my name is Ana.",
            "Hi, I'm Ana.",
            "Hello, I'm Ana.",
            "Nice to meet you Robert, I'm Ana.",
            "Nice to meet you, Robert. I'm Ana.",
          ],

          explanation:
            "No necesitas traducir literalmente. Basta con saludar y comunicar tu nombre de forma natural.",
        },
      ],
    },
  );

  /*
   * =====================================
   * LECCIÓN 3
   * DESPEDIDAS
   * =====================================
   */

  await upsertLesson(
    unit.id,
    {
      title:
        "Despedidas y respuestas sociales",

      description:
        "Aprende expresiones comunes para finalizar conversaciones y responder apropiadamente en situaciones cotidianas.",

      order: 3,

      estimatedMinutes: 14,

      contentBlocks: [
        {
          type:
            LessonContentType.INTRO,

          title:
            "Cerrar una conversación",

          body:
            "Saber comenzar una conversación es importante, pero también necesitas saber terminarla naturalmente.\n\nLas despedidas cambian dependiendo de cuándo esperas volver a ver a la otra persona.",

          order: 1,
        },

        {
          type:
            LessonContentType.VOCABULARY,

          title:
            "Despedidas frecuentes",

          order: 2,

          items: [
            {
              term: "Goodbye",
              translation: "Adiós",
            },

            {
              term: "Bye",
              translation:
                "Chao / Adiós",

              note:
                "Más informal que Goodbye.",
            },

            {
              term:
                "See you",

              translation:
                "Nos vemos",
            },

            {
              term:
                "See you later",

              translation:
                "Nos vemos luego",
            },

            {
              term:
                "See you tomorrow",

              translation:
                "Nos vemos mañana",
            },

            {
              term:
                "Good night",

              translation:
                "Buenas noches",

              note:
                "También funciona como despedida por la noche.",
            },
          ],
        },

        {
          type:
            LessonContentType.EXAMPLE,

          title:
            "Respuestas sociales",

          body:
            "Hay expresiones que suelen aparecer juntas. Aprenderlas como parte de una situación resulta más útil que memorizar traducciones aisladas.",

          order: 3,

          items: [
            {
              term:
                "Have a nice day!",

              translation:
                "¡Que tengas un buen día!",
            },

            {
              term:
                "You too!",

              translation:
                "¡Igualmente!",
            },

            {
              term:
                "See you tomorrow!",

              translation:
                "¡Nos vemos mañana!",
            },

            {
              term:
                "See you!",

              translation:
                "¡Nos vemos!",
            },
          ],
        },
      ],

      exercises: [
        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Selecciona la mejor respuesta.",

          prompt:
            'Someone says: "See you tomorrow!"',

          order: 1,

          correctAnswer:
            "See you!",

          explanation:
            '"See you!" es una respuesta natural a "See you tomorrow".',

          options: [
            {
              text:
                "See you!",

              isCorrect:
                true,

              order: 1,
            },

            {
              text:
                "Good morning.",

              isCorrect:
                false,

              order: 2,
            },

            {
              text:
                "I'm twenty.",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "My name is Laura.",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.MULTIPLE_CHOICE,

          instruction:
            "Analiza el contexto.",

          prompt:
            "Son las 11:00 p. m. y te despides de tu familia antes de dormir. ¿Qué expresión es apropiada?",

          order: 2,

          correctAnswer:
            "Good night",

          explanation:
            '"Good night" se usa normalmente para despedirse por la noche o antes de dormir.',

          options: [
            {
              text:
                "Good morning",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "Good afternoon",

              isCorrect:
                false,

              order: 2,
            },

            {
              text:
                "Good night",

              isCorrect:
                true,

              order: 3,
            },

            {
              text:
                "Nice morning",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.ORDER_WORDS,

          instruction:
            "Ordena las palabras.",

          prompt:
            "Construye la despedida.",

          order: 3,

          correctAnswer:
            "See you tomorrow",

          items: [
            "tomorrow",
            "you",
            "See",
          ],

          explanation:
            'La expresión correcta es "See you tomorrow".',
        },

        {
          type:
            ExerciseType.FILL_BLANK,

          instruction:
            "Completa la expresión.",

          prompt:
            "Have a nice ___!",

          order: 4,

          correctAnswer:
            "day",

          explanation:
            '"Have a nice day!" significa aproximadamente "¡Que tengas un buen día!".',
        },

        {
          type:
            ExerciseType.LISTENING_CHOICE,

          instruction:
            "Escucha la frase.",

          prompt:
            "¿Qué intención tiene la persona?",

          audioText:
            "It was nice meeting you. See you later!",

          order: 5,

          correctAnswer:
            "Se está despidiendo",

          explanation:
            '"See you later" indica una despedida.',

          options: [
            {
              text:
                "Se está presentando",

              isCorrect:
                false,

              order: 1,
            },

            {
              text:
                "Está preguntando la edad",

              isCorrect:
                false,

              order: 2,
            },

            {
              text:
                "Se está despidiendo",

              isCorrect:
                true,

              order: 3,
            },

            {
              text:
                "Está preguntando el nombre",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.LISTENING_CHOICE,

          instruction:
            "Escucha y responde.",

          prompt:
            "¿Cuál sería una respuesta apropiada?",

          audioText:
            "Have a nice day!",

          order: 6,

          correctAnswer:
            "You too!",

          explanation:
            '"You too!" significa que deseas lo mismo para la otra persona.',

          options: [
            {
              text:
                "You too!",

              isCorrect:
                true,

              order: 1,
            },

            {
              text:
                "My name is David.",

              isCorrect:
                false,

              order: 2,
            },

            {
              text:
                "Good morning night.",

              isCorrect:
                false,

              order: 3,
            },

            {
              text:
                "I'm from Colombia.",

              isCorrect:
                false,

              order: 4,
            },
          ],
        },

        {
          type:
            ExerciseType.TRANSLATION,

          instruction:
            "Responde naturalmente en inglés.",

          prompt:
            'Tu amigo dice: "See you tomorrow!" Despídete.',

          order: 7,

          correctAnswer:
            "See you tomorrow!",

          acceptedAnswers: [
            "See you tomorrow!",
            "See you!",
            "Bye!",
            "Goodbye!",
            "See you later!",
            "Bye, see you tomorrow!",
          ],

          explanation:
            "Hay varias respuestas naturales posibles para una despedida.",
        },

        {
          type:
            ExerciseType.TRANSLATION,

          instruction:
            "Responde a la situación.",

          prompt:
            'Al salir de una tienda, la persona te dice: "Have a nice day!" ¿Qué podrías responder?',

          order: 8,

          correctAnswer:
            "Thank you, you too!",

          acceptedAnswers: [
            "Thank you, you too!",
            "Thanks, you too!",
            "You too!",
            "Thank you!",
            "Thanks!",
            "Thanks, have a nice day too!",
          ],

          explanation:
            '"Thanks, you too!" es una respuesta muy natural en esta situación.',
        },
      ],
    },
  );

  console.log(
    "✅ English Foundations A1 actualizado.",
  );

  console.log(
    "✅ Unidad 1 conservando IDs y progreso.",
  );

  console.log(
    "✅ 3 lecciones y 24 ejercicios sincronizados.",
  );
}

main()
  .catch((error) => {
    console.error(
      "❌ Error actualizando el curso:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });