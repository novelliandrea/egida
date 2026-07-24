# Egida — Guide Voice Selection Module: Integration Guide

This module lets a user pick their Guided Route ("Walk Me Home") narration
voice from ElevenLabs, and makes the Guided Route feature speak every
message in that voice. It was built standalone, assuming no access to the
rest of the Egida codebase, and is designed to merge in with minimal
changes to existing files.

## 1. New files added by this module

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

All of these are **new and self-contained**. None of them import anything
from the existing Egida app, so dropping the whole `lib/core` and
`lib/features/voice_selection` subtrees into the project will not collide
with existing code (check for a pre-existing `lib/core` first — if Egida
already has one, merge folder-by-folder rather than overwriting it).

## 2. Existing Guided Route files that need small modifications

You (or whoever owns the Guided Route feature) need to touch **one thing**:
wherever Guided Route currently converts a message string into spoken
audio.

Likely today it looks something like:

```dart
await _tts.speak("You entered a higher-risk area.");
```

or

```dart
await flutterTts.speak(message);
```

Replace that single call site with:

```dart
await _guidedRouteSpeechService.speak(message);
```

Where `_guidedRouteSpeechService` is a `GuidedRouteSpeechService` instance
(see wiring below) injected into whatever class currently owns the old TTS
call (likely a `GuidedRouteController`, `WalkMeHomeService`, or similar).

No other part of Guided Route's logic — route monitoring, ETA
calculation, risk-area detection, message *triggering* — needs to change.
This module only replaces "message string → spoken audio".

## 3. Methods to call from Guided Route

`GuidedRouteSpeechService` exposes exactly three methods:

| Method | When to call it |
|---|---|
| `speak(String message)` | Every time Guided Route currently speaks a message (route safe, turn instructions, ETA, risk warnings, reassurance messages). |
| `stopSpeaking()` | If Guided Route needs to interrupt narration for a more urgent message. |
| `isSpeaking` | If the UI shows a "speaking..." indicator. |

## 4. How to initialize the ElevenLabs service

At app startup (`main()`), before any Guided Route session or the Voice
Selection screen can run:

```dart
void main() {
  EgidaVoiceConfig.init(
    elevenLabsApiKey: const String.fromEnvironment('ELEVENLABS_API_KEY'),
    // Optional: a sensible default voice before the user ever picks one.
    defaultVoiceId: const String.fromEnvironment('ELEVENLABS_DEFAULT_VOICE_ID'),
  );

  runApp(const EgidaApp());
}
```

Then create **one** `VoiceModule` for the app's lifetime (composition
root) and hand its pieces to whatever DI approach Egida uses:

```dart
final voiceModule = VoiceModule.create();

// e.g. with get_it:
getIt.registerSingleton<GuidedRouteSpeechService>(voiceModule.guidedRouteSpeechService);

// Guided Route's existing controller then takes it via constructor:
class GuidedRouteController {
  GuidedRouteController(this._speech, /* ...existing deps... */);
  final GuidedRouteSpeechService _speech;

  void _announce(String message) => _speech.speak(message);
}
```

To open the settings screen from Egida's existing Settings menu:

```dart
Navigator.of(context).push(MaterialPageRoute(
  builder: (_) => VoiceSelectionScreen(
    controller: voiceModule.newSelectionController(),
  ),
));
```

**Never pass the API key via `--dart-define` in a shipped production app
without additional protection** (it's readable in the compiled binary).
For production, consider proxying ElevenLabs calls through Egida's own
backend so the key never ships on-device — the `ElevenLabsService` class
is the only place that would need to change (point its base URL at your
backend instead of `api.elevenlabs.io`).

## 5. How the user's selected voice is persisted

- Today: `LocalVoicePreferenceRepository` stores the voice id locally via
  `SharedPreferencesKeyValueStorage`, under the key
  `egida.guided_route.selected_voice_id`. It survives app restarts.
- Later, for Supabase sync: implement
  `SupabaseVoicePreferenceRepository implements VoicePreferenceRepository`
  (reading/writing a `preferred_voice_id` column keyed by `auth.uid()`),
  and swap the one line in `VoiceModule.create()` that currently
  instantiates `LocalVoicePreferenceRepository`. Nothing else in the
  module — not the screen, not the controller, not Guided Route — needs
  to change, since they all depend on the abstract
  `VoicePreferenceRepository` interface.

## 6. Required dependencies

Add to `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.2.0
  shared_preferences: ^2.2.0
  just_audio: ^0.9.40   # or Egida's existing audio package — see note below
```

**Audio playback note:** `core/audio/audio_player_service.dart` ships with
an interface (`AudioPlayerService`) plus a `just_audio`-shaped
implementation (`JustAudioPlayerService`) that has the real playback calls
left as clearly marked `TODO(integration)` comments — this is so the
module compiles even before you add `just_audio` to the pubspec. If Egida
already has an audio-playback service for other in-app sounds, it's
usually better to implement `AudioPlayerService` as a thin adapter around
Egida's existing one rather than adding a second audio engine.

## 7. Design notes

- `voice_selection_theme.dart` defines a self-contained dark/"night mode"
  palette (near-black background, signal-green accent, subtle
  glow on the selected voice card) so the screen works out of the box.
  If Egida already has a shared `AppTheme`, delete this file and re-point
  the widgets in `widgets/` and `presentation/voice_selection_screen.dart`
  at Egida's existing theme constants instead.
- Loading, error, and empty states are all handled in
  `voice_selection_controller.dart` + the corresponding widgets
  (`VoiceListSkeleton`, `ErrorStateView`), with a retry button wired to
  `controller.load(forceRefresh: true)`.

## 8. Quick sanity checklist before merging

- [ ] `EgidaVoiceConfig.init(...)` is called once, early, in `main()`.
- [ ] The existing Guided Route "speak" call site is swapped for
      `guidedRouteSpeechService.speak(message)`.
- [ ] `just_audio` (or Egida's existing audio package, adapted) is wired
      into `AudioPlayerService.playBytes`.
- [ ] The Voice Selection screen is reachable from Settings.
- [ ] No file in this module was found to import anything from Egida's
      existing code — if that's still true after merge, integration risk
      is minimal.
