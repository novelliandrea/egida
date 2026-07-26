/**
 * src/lib/voice/localVoicePreferenceRepository.ts
 *
 * Implementazione locale di `VoicePreferenceRepository`, basata su
 * `KeyValueStorage` (AsyncStorage di default).
 *
 * MIGRAZIONE FUTURA A SUPABASE
 * ---------------------------------------------------------------------------
 * Crea `SupabaseVoicePreferenceRepository implements VoicePreferenceRepository`
 * che legge/scrive una colonna `preferred_voice_id` sul profilo utente,
 * poi sostituiscila nell'unico punto di wiring descritto nella guida di
 * integrazione. Nessuno hook, schermata o il Percorso Guidato deve
 * cambiare: dipendono tutti dall'interfaccia astratta, mai da questa
 * classe direttamente.
 */

import { KeyValueStorage } from '../storage/keyValueStorage';
import { VoicePreferenceRepository } from './voicePreferenceRepository';

const STORAGE_KEY = 'egida.guided_route.selected_voice_id';

export class LocalVoicePreferenceRepository implements VoicePreferenceRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  getSelectedVoiceId(): Promise<string | null> {
    return this.storage.getString(STORAGE_KEY);
  }

  setSelectedVoiceId(voiceId: string): Promise<void> {
    return this.storage.setString(STORAGE_KEY, voiceId);
  }

  clear(): Promise<void> {
    return this.storage.remove(STORAGE_KEY);
  }
}
