// Questo file crea UN SOLO client Supabase condiviso da tutta l'app.
// Ogni schermata che deve leggere o scrivere dati (segnalazioni, contatti
// fidati, SOS...) importa `supabase` da qui invece di crearne uno nuovo.
//
// Le due variabili EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
// vengono lette dal file .env nella root del progetto (vedi .env.example).
// In Expo, qualsiasi variabile che inizia con "EXPO_PUBLIC_" viene inclusa
// automaticamente nell'app — non serve nessuna configurazione aggiuntiva.

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Non blocchiamo l'avvio dell'app: la mostriamo comunque con dati vuoti,
  // ma stampiamo un avviso chiaro in console così capisci subito cosa manca.
  console.warn(
    '[Egida] Supabase non configurato: crea un file .env con ' +
      'EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Vedi README.md.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
