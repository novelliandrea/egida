/**
 * src/lib/voice/useGuidedRouteNarration.ts
 *
 * ESEMPIO PRONTO ALL'USO — messaggio -> audio parlato.
 * ---------------------------------------------------------------------------
 * Questo file mostra la conversione completa da testo a voce, con i
 * messaggi esatti descritti nella richiesta originale del Percorso
 * Guidato ("Your route is safe.", "Continue straight.", ecc., tradotti in
 * italiano). Se il Percorso Guidato non ha ancora NESSUN codice che genera
 * audio, potete usare questo hook così com'è, oppure copiarne la logica
 * dentro il componente/hook che già gestisce il flusso del percorso.
 *
 * COME SI USA
 * ---------------------------------------------------------------------------
 * Dentro il componente/schermata del Percorso Guidato:
 *
 *   import { useGuidedRouteNarration } from '../lib/voice/useGuidedRouteNarration';
 *
 *   function GuidedRouteScreen() {
 *     const narration = useGuidedRouteNarration();
 *
 *     // quando il percorso inizia:
 *     useEffect(() => { narration.announceRouteSafe(); }, []);
 *
 *     // quando arriva un'istruzione di navigazione dal vostro motore di
 *     // routing (Google Directions, Mapbox, ecc.):
 *     narration.announceContinueStraight();
 *
 *     // quando l'utente entra in un'area segnalata come a rischio:
 *     narration.announceHighRiskArea();
 *
 *     // quando manca poco all'arrivo:
 *     narration.announceApproachingDestination();
 *
 *     // messaggio di rassicurazione periodico (es. ogni N minuti):
 *     narration.announceEverythingGoingWell();
 *
 *     // messaggio libero, per qualunque altro caso non previsto sopra:
 *     narration.speak('Testo qualsiasi da pronunciare.');
 *   }
 *
 * Ognuna di queste chiamate esegue davvero la conversione testo -> audio
 * (via ElevenLabs) e la riproduce con la voce scelta dall'utente in
 * Impostazioni > Voce Guida. Non c'è altro da scrivere per "generare"
 * l'audio: è già tutto dentro guidedRouteSpeechService.speak().
 */

import { useCallback } from 'react';

import { useVoiceModule } from './VoiceModuleProvider';

export function useGuidedRouteNarration() {
  const { guidedRouteSpeechService } = useVoiceModule();

  const speak = useCallback(
    (message: string) => guidedRouteSpeechService.speak(message),
    [guidedRouteSpeechService],
  );

  return {
    /** Messaggio libero, per qualunque testo generato dinamicamente. */
    speak,

    /** "Your route is safe." — pronunciato all'avvio del percorso. */
    announceRouteSafe: useCallback(
      () => speak('Il tuo percorso è sicuro.'),
      [speak],
    ),

    /** "Continue straight." — istruzione di navigazione. */
    announceContinueStraight: useCallback(
      () => speak('Prosegui dritto.'),
      [speak],
    ),

    /** "You are approaching your destination." */
    announceApproachingDestination: useCallback(
      () => speak('Stai per arrivare a destinazione.'),
      [speak],
    ),

    /** "You entered a higher-risk area." — avviso di sicurezza. */
    announceHighRiskArea: useCallback(
      () => speak('Sei entrato in un\u2019area a rischio più elevato.'),
      [speak],
    ),

    /** "Everything is going well." — rassicurazione periodica. */
    announceEverythingGoingWell: useCallback(
      () => speak('Va tutto bene, prosegui pure.'),
      [speak],
    ),

    /** Interrompe la narrazione in corso (es. per dare priorità a un
     * avviso più urgente). */
    stopSpeaking: useCallback(
      () => guidedRouteSpeechService.stopSpeaking(),
      [guidedRouteSpeechService],
    ),

    isSpeaking: useCallback(
      () => guidedRouteSpeechService.isSpeaking(),
      [guidedRouteSpeechService],
    ),
  };
}
