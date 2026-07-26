/**
 * src/lib/config/envConfig.ts
 *
 * DOVE SI INSERISCE IN EGIDA
 * ---------------------------------------------------------------------------
 * Punto unico di configurazione per tutto ciò che questo modulo richiede
 * (API key ElevenLabs, base URL, voice id di default). Nessun file di
 * questo modulo contiene mai una chiave o un URL hardcoded: passano tutti
 * da qui.
 *
 * Con Expo, le variabili d'ambiente che iniziano con `EXPO_PUBLIC_` vengono
 * automaticamente incluse nel bundle e leggibili da `process.env` senza
 * configurazione aggiuntiva. Aggiungi al tuo `.env` esistente:
 *
 *   EXPO_PUBLIC_ELEVENLABS_API_KEY=xxxxx
 *   EXPO_PUBLIC_ELEVENLABS_DEFAULT_VOICE_ID=xxxxx   (opzionale)
 *
 * ATTENZIONE SICUREZZA: qualsiasi variabile EXPO_PUBLIC_* finisce nel
 * bundle JS ed è quindi estraibile dall'app installata. Per la produzione,
 * valuta di far passare le chiamate a ElevenLabs attraverso un backend
 * (es. una Edge Function Supabase, dato che vedo che il progetto ha già
 * una cartella `supabase/`) invece di spedire la chiave API sul dispositivo.
 */

export interface EgidaVoiceEnv {
  elevenLabsApiKey: string;
  elevenLabsBaseUrl: string;
  defaultVoiceId?: string;
  requestTimeoutMs: number;
  maxRetries: number;
}

function readEnv(): EgidaVoiceEnv {
  const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    // Non lanciamo subito un errore: alcuni contesti (test, storybook)
    // potrebbero non avere l'env caricato. L'errore vero viene lanciato al
    // primo utilizzo reale, nel getter elevenLabsApiKey più sotto.
    // eslint-disable-next-line no-console
    console.warn(
      '[EgidaVoiceConfig] EXPO_PUBLIC_ELEVENLABS_API_KEY non impostata.',
    );
  }

  return {
    elevenLabsApiKey: apiKey ?? '',
    elevenLabsBaseUrl:
      process.env.EXPO_PUBLIC_ELEVENLABS_BASE_URL ?? 'https://api.elevenlabs.io/v1',
    defaultVoiceId: process.env.EXPO_PUBLIC_ELEVENLABS_DEFAULT_VOICE_ID,
    requestTimeoutMs: 15000,
    maxRetries: 2,
  };
}

let cached: EgidaVoiceEnv | null = null;

export const EgidaVoiceConfig = {
  get elevenLabsApiKey(): string {
    const env = (cached ??= readEnv());
    if (!env.elevenLabsApiKey) {
      throw new Error(
        'EgidaVoiceConfig: manca EXPO_PUBLIC_ELEVENLABS_API_KEY nel file .env',
      );
    }
    return env.elevenLabsApiKey;
  },
  get elevenLabsBaseUrl(): string {
    return (cached ??= readEnv()).elevenLabsBaseUrl;
  },
  get defaultVoiceId(): string | undefined {
    return (cached ??= readEnv()).defaultVoiceId;
  },
  get requestTimeoutMs(): number {
    return (cached ??= readEnv()).requestTimeoutMs;
  },
  get maxRetries(): number {
    return (cached ??= readEnv()).maxRetries;
  },
};
