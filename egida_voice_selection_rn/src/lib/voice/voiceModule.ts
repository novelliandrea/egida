/**
 * src/lib/voice/voiceModule.ts
 *
 * PUNTO UNICO DI WIRING.
 * ---------------------------------------------------------------------------
 * Questo è l'unico file che istanzia classi concrete (AsyncStorage,
 * ElevenLabsService, ecc.). Tutto il resto del modulo dipende da
 * astrazioni. Crea l'istanza UNA VOLTA all'avvio dell'app (es. nel
 * componente radice `App.tsx`) e passala giù via Context o props.
 */

import { ExpoAvAudioPlayerService } from '../audio/audioPlayerService';
import { ElevenLabsService } from '../elevenlabs/elevenLabsService';
import { AsyncStorageKeyValueStorage } from '../storage/asyncStorageKeyValueStorage';
import { GuidedRouteSpeechService } from './guidedRouteSpeechService';
import { LocalVoicePreferenceRepository } from './localVoicePreferenceRepository';
import { VoiceCatalogService } from './voiceCatalogService';
import { VoicePreferenceRepository } from './voicePreferenceRepository';

export interface VoiceModule {
  elevenLabsService: ElevenLabsService;
  voicePreferenceRepository: VoicePreferenceRepository;
  voiceCatalogService: VoiceCatalogService;
  guidedRouteSpeechService: GuidedRouteSpeechService;
  dispose: () => Promise<void>;
}

export function createVoiceModule(): VoiceModule {
  const elevenLabsService = new ElevenLabsService();
  const voicePreferenceRepository = new LocalVoicePreferenceRepository(
    new AsyncStorageKeyValueStorage(),
  );
  const audioPlayerService = new ExpoAvAudioPlayerService();

  const voiceCatalogService = new VoiceCatalogService(
    elevenLabsService,
    voicePreferenceRepository,
    audioPlayerService,
  );

  const guidedRouteSpeechService = new GuidedRouteSpeechService(
    elevenLabsService,
    voicePreferenceRepository,
    audioPlayerService,
    (msg) => {
      // TODO(integrazione): collega questo al sistema di logging/error
      // reporting già esistente in Egida, invece di console.warn.
      console.warn('[GuidedRouteSpeechService]', msg);
    },
  );

  return {
    elevenLabsService,
    voicePreferenceRepository,
    voiceCatalogService,
    guidedRouteSpeechService,
    dispose: () => audioPlayerService.dispose(),
  };
}
