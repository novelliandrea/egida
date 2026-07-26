/**
 * src/lib/voice/guidedRouteSpeechService.ts
 *
 * *** QUESTO È IL PUNTO PRINCIPALE DI INTEGRAZIONE CON IL PERCORSO
 * GUIDATO ESISTENTE ("Walk Me Home") ***
 *
 * DOVE SI INSERISCE IN EGIDA
 * ---------------------------------------------------------------------------
 * Ovunque oggi il Percorso Guidato trasformi un messaggio in audio parlato
 * (probabilmente con `expo-speech` o una voce TTS fissa), quella chiamata
 * va sostituita con `guidedRouteSpeechService.speak(message)`. Tutto il
 * resto del Percorso Guidato - monitoraggio del percorso, calcolo ETA,
 * innesco dei messaggi di sicurezza - resta invariato. Questa classe
 * sostituisce solo "come un messaggio diventa audio".
 *
 * Espone volutamente solo il metodo richiesto nel task, `speak(message)`,
 * così la modifica nel file esistente del Percorso Guidato è minima:
 *
 *   PRIMA:
 *     await Speech.speak("Sei entrato in un'area a rischio più elevato.");
 *
 *   DOPO:
 *     await guidedRouteSpeechService.speak("Sei entrato in un'area a rischio più elevato.");
 *
 * Risolve internamente la voce salvata dall'utente ad ogni chiamata: se
 * l'utente cambia voce preferita a metà di un percorso, il messaggio
 * successivo userà automaticamente la nuova voce - il Percorso Guidato non
 * deve mai sapere che esiste un voice id.
 */

import { AudioPlayerService } from '../audio/audioPlayerService';
import { EgidaVoiceConfig } from '../config/envConfig';
import { ElevenLabsError } from '../elevenlabs/types';
import { ElevenLabsService } from '../elevenlabs/elevenLabsService';
import { VoicePreferenceRepository } from './voicePreferenceRepository';

export type GuidedRouteSpeechErrorHandler = (message: string) => void;

export class GuidedRouteSpeechService {
  constructor(
    private readonly elevenLabs: ElevenLabsService,
    private readonly voicePreferences: VoicePreferenceRepository,
    private readonly audioPlayer: AudioPlayerService,
    private readonly onError?: GuidedRouteSpeechErrorHandler,
  ) {}

  /**
   * Pronuncia `message` usando la voce attualmente selezionata
   * dall'utente. Ricade su `EgidaVoiceConfig.defaultVoiceId` se l'utente
   * non ne ha mai scelta una. Sicura da chiamare ripetutamente: gli errori
   * vengono intercettati e segnalati via `onError` invece di essere
   * lanciati, così un errore transitorio di ElevenLabs non interrompe mai
   * il loop di monitoraggio del Percorso Guidato.
   */
  async speak(message: string): Promise<void> {
    const trimmed = message.trim();
    if (!trimmed) return;

    const voiceId =
      (await this.voicePreferences.getSelectedVoiceId()) ?? EgidaVoiceConfig.defaultVoiceId;

    if (!voiceId) {
      this.onError?.(
        'Nessuna voce guida configurata. Imposta EgidaVoiceConfig.defaultVoiceId ' +
          'oppure chiedi all\u2019utente di sceglierne una in Impostazioni > Voce Guida.',
      );
      return;
    }

    try {
      const base64 = await this.elevenLabs.synthesizeSpeechBase64({
        text: trimmed,
        voiceId,
      });
      await this.audioPlayer.playBase64(base64);
    } catch (err) {
      const msg =
        err instanceof ElevenLabsError ? err.message : 'Errore sconosciuto durante la sintesi vocale.';
      this.onError?.(msg);
      // Errore intenzionalmente non propagato oltre la callback: un'app di
      // sicurezza non deve mai bloccarsi o interrompere il monitoraggio del
      // percorso perché la narrazione ha fallito. Valuta un fallback non
      // bloccante (toast interno, vibrazione) qui.
    }
  }

  /** Interrompe qualsiasi messaggio in corso di riproduzione. Utile quando
   * il Percorso Guidato deve dire qualcosa di più urgente (es. un avviso
   * di area a rischio) prima di un aggiornamento ETA di routine. */
  stopSpeaking(): Promise<void> {
    return this.audioPlayer.stop();
  }

  isSpeaking(): boolean {
    return this.audioPlayer.isPlaying();
  }
}
