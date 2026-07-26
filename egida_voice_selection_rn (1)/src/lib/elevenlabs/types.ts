/**
 * src/lib/elevenlabs/types.ts
 *
 * Se il tuo progetto centralizza già i tipi in `src/types.ts`, sentiti
 * libero di spostare `ElevenLabsVoice` lì e lasciare qui solo gli errori.
 * Tenuto separato per ora per rendere il modulo indipendente e facile da
 * revisionare in un unico posto.
 */

export interface ElevenLabsVoice {
  voiceId: string;
  name: string;
  description?: string;
  previewUrl?: string;
  language?: string;
  gender?: string;
  tags: string[];
}

export function parseElevenLabsVoice(json: any): ElevenLabsVoice {
  const labels = json?.labels ?? {};
  return {
    voiceId: json?.voice_id ?? '',
    name: json?.name ?? 'Voce sconosciuta',
    description: json?.description ?? undefined,
    previewUrl: json?.preview_url ?? undefined,
    language: labels.language ?? labels.accent ?? undefined,
    gender: labels.gender ?? undefined,
    tags: json?.category ? [String(json.category)] : [],
  };
}

/** Errori tipizzati lanciati da ElevenLabsService, per stati UI precisi
 * (es. "nessuna connessione" vs "chiave API non valida") senza dover fare
 * parsing di stringhe. */
export type ElevenLabsErrorKind =
  | 'network'
  | 'auth'
  | 'rate_limit'
  | 'server'
  | 'parsing';

export class ElevenLabsError extends Error {
  readonly kind: ElevenLabsErrorKind;
  readonly statusCode?: number;

  constructor(kind: ElevenLabsErrorKind, message: string, statusCode?: number) {
    super(message);
    this.name = 'ElevenLabsError';
    this.kind = kind;
    this.statusCode = statusCode;
  }
}
