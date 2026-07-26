/**
 * src/lib/voice/voicePreferenceRepository.ts
 *
 * Contratto del repository che possiede UN solo dato: "quale voice id ha
 * scelto l'utente per la narrazione del Percorso Guidato". Volutamente
 * ristretto - non è un repository di impostazioni generiche - così può
 * essere sostituito con uno basato su Supabase senza trascinarsi dietro
 * altre preferenze non correlate.
 */
export interface VoicePreferenceRepository {
  /** Ritorna il voice id salvato in precedenza, o null se l'utente non ne
   * ha ancora scelto uno (in tal caso chi chiama dovrebbe usare
   * `EgidaVoiceConfig.defaultVoiceId` come fallback). */
  getSelectedVoiceId(): Promise<string | null>;
  setSelectedVoiceId(voiceId: string): Promise<void>;
  clear(): Promise<void>;
}
