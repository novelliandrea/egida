/**
 * src/lib/storage/keyValueStorage.ts
 *
 * Contratto di storage generico e astratto. Nessuna parte del modulo
 * dipende da AsyncStorage direttamente: dipende da questa interfaccia.
 * Questo è il punto di estensione richiesto: "abbastanza astratto da
 * poter essere sostituito in futuro con Supabase / profilo utente / sync
 * cloud".
 *
 * PER MIGRARE A SUPABASE IN FUTURO:
 * Crea una `SupabaseKeyValueStorage implements KeyValueStorage` che
 * legge/scrive su una tabella `user_preferences` (o una colonna diretta
 * sul profilo) associata a `auth.uid()`, poi sostituisci la singola riga
 * in `voiceModule.ts` che oggi istanzia `AsyncStorageKeyValueStorage`.
 * Nessun altro file del modulo deve cambiare.
 */
export interface KeyValueStorage {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
