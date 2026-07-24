/// features/voice_selection/voice_module.dart
///
/// SINGLE WIRING POINT.
/// -------------------------------------------------------------------------
/// This file is the one place that instantiates concrete classes
/// (SharedPreferences storage, ElevenLabsService, etc.). Everything else in
/// the module depends on abstractions. If Egida uses a DI container
/// (get_it, Riverpod providers, etc.), replace the body of this file with
/// your container's registrations - the *shape* of what needs registering
/// is exactly what's below.
///
/// USAGE (see Integration Guide for full details):
///
///   final voiceModule = VoiceModule.create();
///   // then, e.g. with get_it:
///   getIt.registerSingleton(voiceModule.guidedRouteSpeechService);
///   getIt.registerSingleton(voiceModule.selectionController);
library;

import '../../core/audio/audio_player_service.dart';
import '../../core/elevenlabs/elevenlabs_service.dart';
import '../../core/storage/shared_preferences_key_value_storage.dart';
import '../../core/tts/guided_route_speech_service.dart';
import 'controllers/voice_selection_controller.dart';
import 'repositories/local_voice_preference_repository.dart';
import 'repositories/voice_preference_repository.dart';
import 'services/voice_catalog_service.dart';

class VoiceModule {
  final ElevenLabsService elevenLabsService;
  final VoicePreferenceRepository voicePreferenceRepository;
  final AudioPlayerService audioPlayerService;
  final VoiceCatalogService voiceCatalogService;
  final GuidedRouteSpeechService guidedRouteSpeechService;

  VoiceModule._({
    required this.elevenLabsService,
    required this.voicePreferenceRepository,
    required this.audioPlayerService,
    required this.voiceCatalogService,
    required this.guidedRouteSpeechService,
  });

  /// Call `EgidaVoiceConfig.init(...)` BEFORE calling this factory.
  factory VoiceModule.create() {
    final elevenLabsService = ElevenLabsService();
    final voicePreferenceRepository =
        LocalVoicePreferenceRepository(SharedPreferencesKeyValueStorage());
    final audioPlayerService = JustAudioPlayerService();

    final voiceCatalogService = VoiceCatalogService(
      elevenLabs: elevenLabsService,
      preferences: voicePreferenceRepository,
      audioPlayer: audioPlayerService,
    );

    final guidedRouteSpeechService = GuidedRouteSpeechService(
      elevenLabs: elevenLabsService,
      voicePreferences: voicePreferenceRepository,
      audioPlayer: audioPlayerService,
      onError: (msg) {
        // TODO(integration): route this into Egida's existing logging /
        // error-reporting pipeline instead of print().
        // ignore: avoid_print
        print('[GuidedRouteSpeechService] $msg');
      },
    );

    return VoiceModule._(
      elevenLabsService: elevenLabsService,
      voicePreferenceRepository: voicePreferenceRepository,
      audioPlayerService: audioPlayerService,
      voiceCatalogService: voiceCatalogService,
      guidedRouteSpeechService: guidedRouteSpeechService,
    );
  }

  /// Convenience factory for a fresh controller each time the settings
  /// screen is opened (avoids stale preview state if reopened later).
  VoiceSelectionController newSelectionController() =>
      VoiceSelectionController(voiceCatalogService);

  void dispose() {
    elevenLabsService.dispose();
    audioPlayerService.dispose();
  }
}
