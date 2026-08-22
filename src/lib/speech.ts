const localeByLanguage: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
};

async function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return [];
  }

  const synthesis = window.speechSynthesis;

  const existingVoices = synthesis.getVoices();

  if (existingVoices.length > 0) {
    return existingVoices;
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      resolve(synthesis.getVoices());
    }, 1000);

    synthesis.addEventListener(
      "voiceschanged",
      () => {
        window.clearTimeout(timeout);

        resolve(synthesis.getVoices());
      },
      {
        once: true,
      },
    );
  });
}

function scoreVoice(
  voice: SpeechSynthesisVoice,
  locale: string,
) {
  let score = 0;

  const voiceName =
    voice.name.toLowerCase();

  const desiredLanguage =
    locale.split("-")[0].toLowerCase();

  const voiceLanguage =
    voice.lang.toLowerCase();

  /*
   * Idioma exacto.
   */
  if (
    voiceLanguage ===
    locale.toLowerCase()
  ) {
    score += 100;
  }

  /*
   * Mismo idioma aunque
   * cambie la región.
   */
  if (
    voiceLanguage.startsWith(
      `${desiredLanguage}-`,
    )
  ) {
    score += 60;
  }

  /*
   * Algunas plataformas incluyen
   * estas palabras en sus voces
   * de mayor calidad.
   */
  if (voiceName.includes("natural")) {
    score += 80;
  }

  if (voiceName.includes("neural")) {
    score += 80;
  }

  if (voiceName.includes("premium")) {
    score += 60;
  }

  if (voiceName.includes("enhanced")) {
    score += 50;
  }

  if (voiceName.includes("google")) {
    score += 35;
  }

  if (voiceName.includes("microsoft")) {
    score += 35;
  }

  /*
   * Preferimos una voz marcada
   * como predeterminada si las
   * demás características empatan.
   */
  if (voice.default) {
    score += 5;
  }

  return score;
}

function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  locale: string,
) {
  const language =
    locale.split("-")[0];

  const compatibleVoices =
    voices.filter((voice) =>
      voice.lang
        .toLowerCase()
        .startsWith(
          language.toLowerCase(),
        ),
    );

  if (
    compatibleVoices.length === 0
  ) {
    return null;
  }

  return [...compatibleVoices].sort(
    (firstVoice, secondVoice) =>
      scoreVoice(
        secondVoice,
        locale,
      ) -
      scoreVoice(
        firstVoice,
        locale,
      ),
  )[0];
}

export async function speakText(
  text: string,
  language: string,
) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    throw new Error(
      "Speech synthesis no disponible.",
    );
  }

  const synthesis =
    window.speechSynthesis;

  const locale =
    localeByLanguage[language] ??
    language;

  const voices =
    await getVoices();

  const bestVoice =
    selectBestVoice(
      voices,
      locale,
    );

  synthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(
      text,
    );

  speech.lang = locale;

  /*
   * Una velocidad ligeramente menor
   * suele sonar mejor para aprendizaje
   * de idiomas y facilita distinguir
   * la pronunciación.
   */
  speech.rate = 0.88;

  speech.pitch = 1;
  speech.volume = 1;

  if (bestVoice) {
    speech.voice = bestVoice;
  }

  synthesis.speak(speech);
}