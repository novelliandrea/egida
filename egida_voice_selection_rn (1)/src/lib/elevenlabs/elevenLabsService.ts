/**
 * src/lib/elevenlabs/elevenLabsService.ts
 *
 * DOVE SI INSERISCE IN EGIDA
 * ---------------------------------------------------------------------------
 * Questa è l'UNICA classe di tutto il modulo autorizzata a fare chiamate
 * HTTP verso ElevenLabs. Ogni altro livello (hook, schermate, Percorso
 * Guidato) parla con questa classe, mai direttamente con `fetch`. Questo
 * mantiene il layer API sostituibile (mockabile nei test, o rimpiazzabile
 * se in futuro le chiamate passano da un backend proprio per proteggere
 * la chiave).
 *
 * File indipendente: nessun import dal resto del codice di Egida.
 */

import { EgidaVoiceConfig } from '../config/envConfig';
import { ElevenLabsError, ElevenLabsVoice, parseElevenLabsVoice } from './types';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new ElevenLabsError('network', 'Richiesta scaduta (timeout).')),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function headers(): Record<string, string> {
  return {
    'xi-api-key': EgidaVoiceConfig.elevenLabsApiKey,
    'Content-Type': 'application/json',
  };
}

function throwIfError(status: number): void {
  if (status >= 200 && status < 300) return;
  if (status === 401 || status === 403) {
    throw new ElevenLabsError('auth', 'ElevenLabs ha rifiutato la API key.', status);
  }
  if (status === 429) {
    throw new ElevenLabsError(
      'rate_limit',
      'Troppe richieste a ElevenLabs. Riprova tra poco.',
      status,
    );
  }
  throw new ElevenLabsError('server', `ElevenLabs ha risposto con un errore (${status}).`, status);
}

/** Retry con backoff esponenziale. Non ritenta gli errori di autenticazione
 * (401/403): ritentare con la stessa chiave sbagliata non aiuterebbe. */
async function withRetry<T>(action: () => Promise<T>): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await withTimeout(action(), EgidaVoiceConfig.requestTimeoutMs);
    } catch (err) {
      const isAuthError = err instanceof ElevenLabsError && err.kind === 'auth';
      if (isAuthError || attempt >= EgidaVoiceConfig.maxRetries) {
        if (err instanceof ElevenLabsError) throw err;
        throw new ElevenLabsError('network', 'Impossibile raggiungere ElevenLabs.');
      }
      attempt += 1;
      await new Promise((r) => setTimeout(r, 400 * attempt * attempt));
    }
  }
}

export class ElevenLabsService {
  /** Recupera l'elenco delle voci disponibili per l'account ElevenLabs. */
  async fetchVoices(): Promise<ElevenLabsVoice[]> {
    return withRetry(async () => {
      const res = await fetch(`${EgidaVoiceConfig.elevenLabsBaseUrl}/voices`, {
        method: 'GET',
        headers: headers(),
      });
      throwIfError(res.status);
      try {
        const body = await res.json();
        const voices = Array.isArray(body?.voices) ? body.voices : [];
        return voices.map(parseElevenLabsVoice);
      } catch {
        throw new ElevenLabsError('parsing', 'Risposta inattesa da ElevenLabs.');
      }
    });
  }

  /** Scarica i byte audio della clip di anteprima integrata di una voce
   * (non consuma la quota di sintesi TTS, è un asset statico). Ritorna un
   * base64 pronto per `expo-av`. */
  async fetchPreviewAudioBase64(previewUrl: string): Promise<string> {
    return withRetry(async () => {
      const res = await fetch(previewUrl);
      throwIfError(res.status);
      const buffer = await res.arrayBuffer();
      return arrayBufferToBase64(buffer);
    });
  }

  /** Genera l'audio parlato per `text` con la voce `voiceId`. È questo che
   * chiama (indirettamente) il Percorso Guidato per ogni messaggio vocale.
   * Ritorna un base64 pronto per `expo-av`. */
  async synthesizeSpeechBase64(params: {
    text: string;
    voiceId: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
  }): Promise<string> {
    const {
      text,
      voiceId,
      modelId = 'eleven_multilingual_v2',
      stability = 0.5,
      similarityBoost = 0.75,
    } = params;

    return withRetry(async () => {
      const res = await fetch(
        `${EgidaVoiceConfig.elevenLabsBaseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: { stability, similarity_boost: similarityBoost },
          }),
        },
      );
      throwIfError(res.status);
      const buffer = await res.arrayBuffer();
      return arrayBufferToBase64(buffer);
    });
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  // `global.btoa` è disponibile in Expo/React Native tramite polyfill; se
  // manca nel tuo setup, installa `base-64` e sostituisci con
  // `import { encode } from 'base-64'`.
  return btoa(binary);
}
