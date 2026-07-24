# Egida — Modulo Selezione Voce Guida: Guida all'Integrazione

Questo modulo permette all'utente di scegliere la voce ElevenLabs per la narrazione del Percorso Guidato ("Walk Me Home"), e fa in modo che il Percorso Guidato pronunci ogni messaggio con quella voce. È stato sviluppato in modo standalone, senza accesso al resto del codice di Egida, ed è progettato per essere integrato con modifiche minime ai file esistenti.

## 1. Nuovi file aggiunti da questo modulo

```
lib/core/config/env_config.dart
lib/core/elevenlabs/elevenlabs_exceptions.dart
lib/core/elevenlabs/elevenlabs_voice.dart
lib/core/elevenlabs/elevenlabs_service.dart
lib/core/audio/audio_player_service.dart
lib/core/storage/key_value_storage.dart
lib/core/storage/shared_preferences_key_value_storage.dart
lib/core/tts/guided_route_speech_service.dart

lib/features/voice_selection/models/voice_ui_model.dart
lib/features/voice_selection/repositories/voice_preference_repository.dart
lib/features/voice_selection/repositories/local_voice_preference_repository.dart
lib/features/voice_selection/services/voice_catalog_service.dart
lib/features/voice_selection/controllers/voice_selection_controller.dart
lib/features/voice_selection/presentation/voice_selection_theme.dart
lib/features/voice_selection/presentation/voice_selection_screen.dart
lib/features/voice_selection/widgets/voice_tile.dart
lib/features/voice_selection/widgets/voice_list_skeleton.dart
lib/features/voice_selection/widgets/error_state_view.dart
lib/features/voice_selection/voice_module.dart
```

Tutti questi file sono **nuovi e indipendenti**. Nessuno di essi importa qualcosa dall'app Egida esistente, quindi inserire gli interi sottoalberi `lib/core` e `lib/features/voice_selection` nel progetto non entrerà in conflitto con il codice esistente (verifica prima se esiste già un `lib/core` — se Egida ne ha già uno, unisci cartella per cartella invece di sovrascriverlo).

## 2. File esistenti del Percorso Guidato che richiedono piccole modifiche

Bisogna modificare **una sola cosa**: il punto in cui il Percorso Guidato converte oggi un messaggio testuale in audio parlato.

Probabilmente oggi assomiglia a:

```dart
await _tts.speak("Sei entrato in un'area a rischio più elevato.");
```

oppure

```dart
await flutterTts.speak(message);
```

Sostituisci quella singola chiamata con:

```dart
await _guidedRouteSpeechService.speak(message);
```

Dove `_guidedRouteSpeechService` è un'istanza di `GuidedRouteSpeechService` (vedi cablaggio più sotto) iniettata nella classe che oggi possiede la vecchia chiamata TTS (probabilmente un `GuidedRouteController`, `WalkMeHomeService` o simile).

Nessun'altra parte della logica del Percorso Guidato — monitoraggio del percorso, calcolo ETA, rilevamento aree a rischio, *innesco* dei messaggi — deve cambiare. Questo modulo sostituisce solo il passaggio "messaggio testuale → audio parlato".

## 3. Metodi da chiamare dal Percorso Guidato

`GuidedRouteSpeechService` espone esattamente tre metodi:

| Metodo | Quando chiamarlo |
|---|---|
| `speak(String message)` | Ogni volta che il Percorso Guidato pronuncia oggi un messaggio (percorso sicuro, istruzioni di svolta, ETA, avvisi di rischio, messaggi di rassicurazione). |
| `stopSpeaking()` | Se il Percorso Guidato deve interrompere la narrazione per un messaggio più urgente. |
| `isSpeaking` | Se l'interfaccia mostra un indicatore "sta parlando...". |

## 4. Come inizializzare il servizio ElevenLabs

All'avvio dell'app (`main()`), prima che qualsiasi sessione del Percorso Guidato o la schermata di Selezione Voce possano essere eseguite:

```dart
void main() {
  EgidaVoiceConfig.init(
    elevenLabsApiKey: const String.fromEnvironment('ELEVENLABS_API_KEY'),
    // Opzionale: una voce predefinita sensata prima che l'utente ne scelga una.
    defaultVoiceId: const String.fromEnvironment('ELEVENLABS_DEFAULT_VOICE_ID'),
  );

  runApp(const EgidaApp());
}
```

Poi crea **un solo** `VoiceModule` per l'intera durata dell'app (composition root) e passa i suoi componenti a qualsiasi approccio di DI usato da Egida:

```dart
final voiceModule = VoiceModule.create();

// es. con get_it:
getIt.registerSingleton<GuidedRouteSpeechService>(voiceModule.guidedRouteSpeechService);

// Il controller esistente del Percorso Guidato lo riceve poi via costruttore:
class GuidedRouteController {
  GuidedRouteController(this._speech, /* ...dipendenze esistenti... */);
  final GuidedRouteSpeechService _speech;

  void _announce(String message) => _speech.speak(message);
}
```

Per aprire la schermata di impostazioni dal menu Impostazioni esistente di Egida:

```dart
Navigator.of(context).push(MaterialPageRoute(
  builder: (_) => VoiceSelectionScreen(
    controller: voiceModule.newSelectionController(),
  ),
));
```

**Non passare mai la API key tramite `--dart-define` in un'app di produzione già pubblicata senza ulteriori protezioni** (è leggibile nel binario compilato). Per la produzione, valuta di instradare le chiamate a ElevenLabs attraverso il backend di Egida, in modo che la chiave non venga mai spedita sul dispositivo — la classe `ElevenLabsService` è l'unico punto che dovrebbe cambiare (basta puntare il suo base URL al tuo backend invece di `api.elevenlabs.io`).

## 5. Come viene salvata la voce selezionata dall'utente

- Oggi: `LocalVoicePreferenceRepository` salva l'id della voce localmente tramite `SharedPreferencesKeyValueStorage`, sotto la chiave `egida.guided_route.selected_voice_id`. Sopravvive ai riavvii dell'app.
- In futuro, per la sincronizzazione con Supabase: implementa `SupabaseVoicePreferenceRepository implements VoicePreferenceRepository` (leggendo/scrivendo una colonna `preferred_voice_id` associata a `auth.uid()`), e sostituisci la singola riga in `VoiceModule.create()` che oggi istanzia `LocalVoicePreferenceRepository`. Nient'altro nel modulo — né la schermata, né il controller, né il Percorso Guidato — deve cambiare, poiché tutti dipendono dall'interfaccia astratta `VoicePreferenceRepository`.

## 6. Dipendenze richieste

Aggiungi al `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.2.0
  shared_preferences: ^2.2.0
  just_audio: ^0.9.40   # oppure il pacchetto audio già esistente in Egida — vedi nota sotto
```

**Nota sulla riproduzione audio:** `core/audio/audio_player_service.dart` include un'interfaccia (`AudioPlayerService`) più un'implementazione pensata per `just_audio` (`JustAudioPlayerService`), con le chiamate di riproduzione reali lasciate come commenti `TODO(integration)` chiaramente indicati — questo per far sì che il modulo compili anche prima di aggiungere `just_audio` al pubspec. Se Egida ha già un servizio di riproduzione audio per altri suoni dell'app, in genere è preferibile implementare `AudioPlayerService` come un semplice adattatore attorno a quello esistente, invece di aggiungere un secondo motore audio.

## 7. Note di design

- `voice_selection_theme.dart` definisce una palette dark/"modalità notturna" autonoma (sfondo quasi nero, accento verde segnale, un lieve bagliore sulla card della voce selezionata) così la schermata funziona subito. Se Egida ha già un `AppTheme` condiviso, elimina questo file e ricollega i widget in `widgets/` e `presentation/voice_selection_screen.dart` alle costanti di tema già esistenti in Egida.
- Gli stati di caricamento, errore e vuoto sono tutti gestiti in `voice_selection_controller.dart` e nei widget corrispondenti (`VoiceListSkeleton`, `ErrorStateView`), con un pulsante di retry collegato a `controller.load(forceRefresh: true)`.

## 8. Checklist rapida prima del merge

- [ ] `EgidaVoiceConfig.init(...)` viene chiamato una sola volta, all'inizio, in `main()`.
- [ ] Il punto di chiamata "speak" esistente nel Percorso Guidato è stato sostituito con `guidedRouteSpeechService.speak(message)`.
- [ ] `just_audio` (o il pacchetto audio già esistente in Egida, adattato) è collegato in `AudioPlayerService.playBytes`.
- [ ] La schermata di Selezione Voce è raggiungibile dalle Impostazioni.
- [ ] Nessun file di questo modulo importa qualcosa dal codice esistente di Egida — se questo resta vero dopo il merge, il rischio di integrazione è minimo.
