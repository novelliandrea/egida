/**
 * src/lib/storage/asyncStorageKeyValueStorage.ts
 *
 * Implementazione locale di default di `KeyValueStorage`, basata su
 * `@react-native-async-storage/async-storage`. Soddisfa il requisito "la
 * voce selezionata resta salvata dopo che l'app viene chiusa e riaperta",
 * ed è il bersaglio di sostituzione per una futura implementazione basata
 * su Supabase.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { KeyValueStorage } from './keyValueStorage';

export class AsyncStorageKeyValueStorage implements KeyValueStorage {
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
