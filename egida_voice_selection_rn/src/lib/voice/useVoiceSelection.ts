/**
 * src/lib/voice/useVoiceSelection.ts
 *
 * Hook che gestisce stato/logica della schermata di selezione voce:
 * caricamento, errore, selezione, anteprima. Equivalente del "controller"
 * nell'architettura originariamente descritta, riscritto come hook React
 * dato che il progetto non usa Redux/Zustand.
 */

import { useCallback, useState } from 'react';

import { ElevenLabsError } from '../elevenlabs/types';
import { VoiceCatalogService } from './voiceCatalogService';

export type VoiceSelectionStatus = 'initial' | 'loading' | 'loaded' | 'error';

export interface VoiceUiModel {
  voiceId: string;
  name: string;
  description?: string;
  language?: string;
  gender?: string;
  previewUrl?: string;
  isSelected: boolean;
}

export function useVoiceSelection(service: VoiceCatalogService) {
  const [status, setStatus] = useState<VoiceSelectionStatus>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceUiModel[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const load = useCallback(
    async (forceRefresh = false) => {
      setStatus('loading');
      setErrorMessage(null);
      try {
        const [fetched, savedId] = await Promise.all([
          service.loadVoices(forceRefresh),
          service.getSelectedVoiceId(),
        ]);
        setSelectedVoiceId(savedId);
        setVoices(
          fetched.map((v) => ({
            voiceId: v.voiceId,
            name: v.name,
            description: v.description,
            language: v.language,
            gender: v.gender,
            previewUrl: v.previewUrl,
            isSelected: v.voiceId === savedId,
          })),
        );
        setStatus('loaded');
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof ElevenLabsError
            ? err.message
            : 'Si è verificato un problema durante il caricamento delle voci.',
        );
      }
    },
    [service],
  );

  const selectVoice = useCallback(
    async (voiceId: string) => {
      const previous = selectedVoiceId;
      setSelectedVoiceId(voiceId);
      setVoices((prev) => prev.map((v) => ({ ...v, isSelected: v.voiceId === voiceId })));

      try {
        await service.selectVoice(voiceId);
      } catch {
        // Rollback dell'aggiornamento ottimistico se il salvataggio fallisce.
        setSelectedVoiceId(previous);
        setVoices((prev) =>
          prev.map((v) => ({ ...v, isSelected: v.voiceId === previous })),
        );
        setErrorMessage('Non è stato possibile salvare la voce selezionata. Riprova.');
      }
    },
    [service, selectedVoiceId],
  );

  const previewVoice = useCallback(
    async (voiceId: string) => {
      if (previewingVoiceId === voiceId) {
        await service.stopPreview();
        setPreviewingVoiceId(null);
        return;
      }

      setPreviewingVoiceId(voiceId);
      const voiceModel = voices.find((v) => v.voiceId === voiceId);
      if (!voiceModel) {
        setPreviewingVoiceId(null);
        return;
      }

      try {
        await service.playPreview({
          voiceId: voiceModel.voiceId,
          name: voiceModel.name,
          description: voiceModel.description,
          previewUrl: voiceModel.previewUrl,
          language: voiceModel.language,
          gender: voiceModel.gender,
          tags: [],
        });
      } catch (err) {
        setErrorMessage(
          err instanceof ElevenLabsError
            ? err.message
            : 'Non è stato possibile riprodurre l\u2019anteprima di questa voce.',
        );
      } finally {
        setPreviewingVoiceId(null);
      }
    },
    [service, voices, previewingVoiceId],
  );

  return {
    status,
    errorMessage,
    voices,
    selectedVoiceId,
    previewingVoiceId,
    load,
    selectVoice,
    previewVoice,
  };
}
