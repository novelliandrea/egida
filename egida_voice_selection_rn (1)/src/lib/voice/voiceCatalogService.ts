/**
 * src/lib/voice/voiceCatalogService.ts
 *
 * Servizio di orchestrazione a livello di feature. È questo che l'hook
 * `useVoiceSelection` chiama - compone `ElevenLabsService` (API grezza),
 * `VoicePreferenceRepository` (persistenza) e `AudioPlayerService`
 * (riproduzione anteprima) nelle operazioni di cui la schermata di
 * selezione voce ha realmente bisogno. La UI non tocca mai
 * `ElevenLabsService` direttamente.
 */

import { AudioPlayerService } from '../audio/audioPlayerService';
import { EgidaVoiceConfig } from '../config/envConfig';
import { ElevenLabsService } from '../elevenlabs/elevenLabsService';
import { ElevenLabsVoice } from '../elevenlabs/types';
import { VoicePreferenceRepository } from './voicePreferenceRepository';

export class VoiceCatalogService {
  private cachedVoices: ElevenLabsVoice[] | null = null;

  constructor(
    private readonly elevenLabs: ElevenLabsService,
    private readonly preferences: VoicePreferenceRepository,
    private readonly audioPlayer: AudioPlayerService,
  ) {}

  async loadVoices(forceRefresh = false): Promise<ElevenLabsVoice[]> {
    if (!forceRefresh && this.cachedVoices) return this.cachedVoices;
    const voices = await this.elevenLabs.fetchVoices();
    this.cachedVoices = voices;
    return voices;
  }

  async getSelectedVoiceId(): Promise<string | null> {
    const saved = await this.preferences.getSelectedVoiceId();
    return saved ?? EgidaVoiceConfig.defaultVoiceId ?? null;
  }

  selectVoice(voiceId: string): Promise<void> {
    return this.preferences.setSelectedVoiceId(voiceId);
  }

  /** Riproduce una breve anteprima per `voice`. Preferisce la clip ospitata
   * da ElevenLabs (non consuma quota TTS); se non disponibile, genera un
   * breve campione TTS come fallback. */
  async playPreview(voice: ElevenLabsVoice): Promise<void> {
    const base64 = voice.previewUrl
      ? await this.elevenLabs.fetchPreviewAudioBase64(voice.previewUrl)
      : await this.elevenLabs.synthesizeSpeechBase64({
          text: 'Ciao, questa è un\u2019anteprima della mia voce per i tuoi percorsi Egida.',
          voiceId: voice.voiceId,
        });
    await this.audioPlayer.playBase64(base64);
  }

  stopPreview(): Promise<void> {
    return this.audioPlayer.stop();
  }
}
