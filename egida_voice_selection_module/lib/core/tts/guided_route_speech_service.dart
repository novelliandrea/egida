/// core/tts/guided_route_speech_service.dart
///
/// *** THIS IS THE MAIN INTEGRATION POINT WITH THE EXISTING GUIDED ROUTE
/// FEATURE ***
///
/// WHERE THIS FITS IN EGIDA
/// -------------------------------------------------------------------------
/// Wherever "Walk Me Home" currently turns a string into spoken audio
/// (today presumably via a fixed TTS voice, or the platform's built-in
/// `flutter_tts`), that call site should be replaced with a call to
/// `GuidedRouteSpeechService.speak(message)`. Everything else in Guided
/// Route - route monitoring, ETA logic, safety-message triggers - is
/// untouched. This class only replaces "how a message becomes audio".
///
/// This class deliberately exposes exactly one meaningful method,
/// `speak(String message)`, matching the interface requested in the task,
/// so the diff inside the existing Guided Route file is minimal:
///
///   BEFORE:
///     await _tts.speak("You entered a higher-risk area.");
///
///   AFTER:
///     await _guidedRouteSpeechService.speak("You entered a higher-risk area.");
///
/// It internally resolves the user's saved voice on every call, so if the
/// user changes their preferred voice mid-journey, the very next spoken
/// message uses the new voice automatically - Guided Route never needs to
/// know a voice id exists.
library;

import '../audio/audio_player_service.dart';
import '../config/env_config.dart';
import '../elevenlabs/elevenlabs_exceptions.dart';
import '../elevenlabs/elevenlabs_service.dart';
import '../../features/voice_selection/repositories/voice_preference_repository.dart';

/// Optional callback so Guided Route's existing UI (e.g. a "speaking..."
/// indicator) can react to speech failures without this service needing
/// to know anything about Guided Route's UI.
typedef GuidedRouteSpeechErrorHandler = void Function(String message);

class GuidedRouteSpeechService {
  final ElevenLabsService _elevenLabs;
  final VoicePreferenceRepository _voicePreferences;
  final AudioPlayerService _audioPlayer;
  final GuidedRouteSpeechErrorHandler? onError;

  GuidedRouteSpeechService({
    required ElevenLabsService elevenLabs,
    required VoicePreferenceRepository voicePreferences,
    required AudioPlayerService audioPlayer,
    this.onError,
  })  : _elevenLabs = elevenLabs,
        _voicePreferences = voicePreferences,
        _audioPlayer = audioPlayer;

  /// Speaks [message] aloud using the user's currently selected voice.
  /// Falls back to `EgidaVoiceConfig.defaultVoiceId` if the user has never
  /// picked one. Safe to call repeatedly/rapidly - failures are caught and
  /// reported via [onError] rather than thrown, so a transient ElevenLabs
  /// error never interrupts Guided Route's monitoring loop.
  Future<void> speak(String message) async {
    if (message.trim().isEmpty) return;

    final voiceId =
        await _voicePreferences.getSelectedVoiceId() ?? EgidaVoiceConfig.defaultVoiceId;

    if (voiceId == null) {
      onError?.call(
        'No guide voice is configured. Set EgidaVoiceConfig.defaultVoiceId '
        'or ask the user to pick one in Settings > Guide Voice.',
      );
      return;
    }

    try {
      final audioBytes = await _elevenLabs.synthesizeSpeech(
        text: message,
        voiceId: voiceId,
      );
      await _audioPlayer.playBytes(audioBytes);
    } on ElevenLabsException catch (e) {
      onError?.call(e.message);
      // Intentionally swallowed beyond the callback: a safety-guidance app
      // should never crash or block route monitoring because narration
      // failed. Consider a non-blocking in-app toast/haptic fallback here.
    }
  }

  /// Interrupts any message currently being spoken. Useful when Guided
  /// Route needs to say something more urgent (e.g. a risk-area warning)
  /// ahead of a routine ETA update.
  Future<void> stopSpeaking() => _audioPlayer.stop();

  bool get isSpeaking => _audioPlayer.isPlaying;
}
