# Egida — Modulo Selezione Voce Guida (React Native / Expo / TypeScript)

Versione corretta del modulo, riscritta per il tuo stack reale: **Expo +
React Native + TypeScript**, con struttura coerente con la tua cartella
`src/` esistente (`lib`, `screens`, `theme`, `navigation`).

## 1. Nuovi file aggiunti da questo modulo

```
src/lib/config/envConfig.ts
src/lib/elevenlabs/types.ts
src/lib/elevenlabs/elevenLabsService.ts
src/lib/audio/audioPlayerService.ts
src/lib/storage/keyValueStorage.ts
src/lib/storage/asyncStorageKeyValueStorage.ts
src/lib/voice/voicePreferenceRepository.ts
src/lib/voice/localVoicePreferenceRepository.ts
src/lib/voice/voiceCatalogService.ts
src/lib/voice/guidedRouteSpeechService.ts
src/lib/voice/voiceModule.ts
src/lib/voice/VoiceModuleProvider.tsx
src/lib/voice/useVoiceSelection.ts

src/theme/voiceSelectionTheme.ts

src/components/voice/VoiceTile.tsx
src/components/voice/VoiceListSkeleton.tsx
src/components/voice/ErrorStateView.tsx

src/screens/VoiceSelectionScreen.tsx
```

Tutti nuovi e indipendenti: nessuno di questi file importa nulla dal resto
del codice Egida esistente. Vanno copiati dentro `src/` mantenendo la
stessa struttura (se `src/lib` esiste già con altri file, uniscili senza
sovrascrivere quelli esistenti).

## 2. Dove si inserisce nel Percorso Guidato esistente

Devi modificare **un solo punto**: dove oggi il Percorso Guidato converte
un messaggio in audio parlato. Probabilmente oggi è qualcosa come:

```ts
import * as Speech from 'expo-speech';
Speech.speak("Sei entrato in un'area a rischio più elevato.");
```

Sostituisci quella chiamata con:

```ts
await guidedRouteSpeechService.speak("Sei entrato in un'area a rischio più elevato.");
```

Per ottenere `guidedRouteSpeechService` nel componente/hook del Percorso
Guidato, usa l'hook fornito dal provider (vedi punto 4):

```ts
import { useVoiceModule } from '../lib/voice/VoiceModuleProvider';

const { guidedRouteSpeechService } = useVoiceModule();
```

Nessun'altra parte della logica del Percorso Guidato (monitoraggio,
calcolo ETA, innesco dei messaggi) deve cambiare.

## 3. Metodi da chiamare dal Percorso Guidato

| Metodo | Quando chiamarlo |
|---|---|
| `speak(message: string)` | Ogni volta che oggi viene pronunciato un messaggio (percorso sicuro, istruzioni, ETA, avvisi rischio, rassicurazioni). |
| `stopSpeaking()` | Per interrompere la narrazione con un messaggio più urgente. |
| `isSpeaking()` | Se la UI mostra un indicatore "sta parlando...". |

## 4. Come inizializzare il modulo

**Passo 1 — variabili d'ambiente.** Aggiungi al tuo `.env` esistente:

```
EXPO_PUBLIC_ELEVENLABS_API_KEY=xxxxxxxxxxxx
EXPO_PUBLIC_ELEVENLABS_DEFAULT_VOICE_ID=xxxxxxxxxxxx
```

**Passo 2 — avvolgi l'app nel provider.** In `App.tsx` (ho visto che ne hai
due, `App.tsx` e `Apps.tsx` — usa quello che è effettivamente il root
renderizzato):

```tsx
import { VoiceModuleProvider } from './src/lib/voice/VoiceModuleProvider';

export default function App() {
  return (
    <VoiceModuleProvider>
      {/* ...il resto della tua app, navigazione ecc... */}
    </VoiceModuleProvider>
  );
}
```

**Passo 3 — aggiungi la schermata alla navigazione.** In
`src/navigation/`, registra `VoiceSelectionScreen` come una rotta
raggiungibile dal menu Impostazioni:

```tsx
import { VoiceSelectionScreen } from '../screens/VoiceSelectionScreen';

// dentro il tuo Stack.Navigator esistente:
<Stack.Screen name="VoiceSelection" component={VoiceSelectionScreen} />
```

e collega un pulsante nelle Impostazioni esistenti con
`navigation.navigate('VoiceSelection')`.

**IMPORTANTE su sicurezza:** qualunque variabile `EXPO_PUBLIC_*` finisce
nel bundle JS ed è estraibile dall'app installata. Per la produzione,
visto che il progetto ha già una cartella `supabase/`, valuta di
instradare le chiamate a ElevenLabs attraverso una Edge Function
Supabase invece di spedire la chiave API sul dispositivo — l'unico file
da modificare sarebbe `elevenLabsService.ts` (puntare il base URL alla
tua funzione invece che a `api.elevenlabs.io`).

## 5. Come viene salvata la voce selezionata

- Oggi: `LocalVoicePreferenceRepository` salva il voice id localmente
  tramite `AsyncStorage`, sotto la chiave
  `egida.guided_route.selected_voice_id`. Sopravvive ai riavvii dell'app.
- In futuro, per sincronizzazione con Supabase (che vedo già presente nel
  progetto): crea `SupabaseVoicePreferenceRepository implements
  VoicePreferenceRepository` che legge/scrive una colonna
  `preferred_voice_id` sul profilo utente, poi sostituisci la singola riga
  in `voiceModule.ts` che oggi istanzia `LocalVoicePreferenceRepository`
  con `AsyncStorageKeyValueStorage`. Nessun altro file (schermata, hook,
  Percorso Guidato) deve cambiare.

## 6. Dipendenze da installare

```bash
npx expo install expo-av @react-native-async-storage/async-storage
```

Nessun'altra dipendenza è richiesta: le chiamate a ElevenLabs usano
`fetch`, già disponibile in Expo/React Native.

**Nota su `expo-av`:** Expo sta gradualmente sostituendo `expo-av` con
`expo-audio`. Se il progetto usa già SDK recente e preferisci la nuova
API, è sufficiente riscrivere `ExpoAvAudioPlayerService` in
`src/lib/audio/audioPlayerService.ts` usando `expo-audio` — è l'unico
file che tocca la libreria audio, il resto del modulo non cambia.

## 7. Note di design

- `voiceSelectionTheme.ts` definisce una palette dark/"modalità notturna"
  autonoma (sfondo quasi nero, accento verde segnale, bordo acceso sulla
  card selezionata). Se `src/theme/` ha già dei token condivisi, elimina
  questo file e ricollega i componenti in `src/components/voice/` e
  `VoiceSelectionScreen.tsx` al tema esistente.
- Stati di caricamento, errore e retry sono gestiti nell'hook
  `useVoiceSelection` e nei componenti corrispondenti
  (`VoiceListSkeleton`, `ErrorStateView`).

## 8. Checklist rapida prima del merge

- [ ] `EXPO_PUBLIC_ELEVENLABS_API_KEY` (e opzionalmente
      `EXPO_PUBLIC_ELEVENLABS_DEFAULT_VOICE_ID`) sono nel `.env`.
- [ ] `npx expo install expo-av @react-native-async-storage/async-storage`
      eseguito.
- [ ] `<VoiceModuleProvider>` avvolge la root dell'app in `App.tsx`.
- [ ] `VoiceSelectionScreen` è registrata nella navigazione ed è
      raggiungibile dalle Impostazioni.
- [ ] Il punto di chiamata "speak" esistente nel Percorso Guidato è stato
      sostituito con `guidedRouteSpeechService.speak(message)`, ottenuto
      tramite `useVoiceModule()`.
- [ ] Nessun file di questo modulo importa qualcosa dal codice esistente
      di Egida — se resta vero dopo il merge, il rischio di integrazione
      è minimo.

## Nota sui file precedenti

I file `.dart` (Flutter) inviati in precedenza **non vanno usati**: erano
basati su uno stack sbagliato. Puoi eliminare la cartella
`egida_voice_selection_module` già caricata su GitHub e sostituirla con
questo pacchetto.
