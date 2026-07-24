/// features/voice_selection/services/voice_catalog_service.dart
///
/// Feature-level orchestration service. This is what the controller talks
/// to - it composes the core [ElevenLabsService] (raw API), the
/// [VoicePreferenceRepository] (persistence) and [AudioPlayerService]
/// (preview playback) into the operations the Voice Selection screen
/// actually needs. The UI never touches ElevenLabsService directly.
library;

import 'dart:typed_data';

import '../../../core/audio/audio_player_service.dart';
import '../../../core/config/env_config.dart';
import '../../../core/elevenlabs/elevenlabs_service.dart';
import '../../../core/elevenlabs/elevenlabs_voice.dart';
import '../repositories/voice_preference_repository.dart';

class VoiceCatalogService {
  final ElevenLabsService _elevenLabs;
  final VoicePreferenceRepository _preferences;
  final AudioPlayerService _audioPlayer;

  /// Simple in-memory cache so re-opening the settings screen doesn't
  /// re-fetch the voice list every time within the same app session.
  List<ElevenLabsVoice>? _cachedVoices;

  VoiceCatalogService({
    required ElevenLabsService elevenLabs,
    required VoicePreferenceRepository preferences,
    required AudioPlayerService audioPlayer,
  })  : _elevenLabs = elevenLabs,
        _preferences = preferences,
        _audioPlayer = audioPlayer;

  Future<List<ElevenLabsVoice>> loadVoices({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedVoices != null) return _cachedVoices!;
    final voices = await _elevenLabs.fetchVoices();
    _cachedVoices = voices;
    return voices;
  }

  Future<String?> getSelectedVoiceId() async {
    final saved = await _preferences.getSelectedVoiceId();
    return saved ?? EgidaVoiceConfig.defaultVoiceId;
  }

  Future<void> selectVoice(String voiceId) {
    return _preferences.setSelectedVoiceId(voiceId);
  }

  /// Plays a short preview for [voice]. Prefers ElevenLabs' hosted preview
  /// clip (no TTS quota used); falls back to generating a short TTS sample
  /// if no preview_url is available for that voice.
  Future<void> playPreview(ElevenLabsVoice voice) async {
    final Uint8List bytes;
    if (voice.previewUrl != null && voice.previewUrl!.isNotEmpty) {
      bytes = await _elevenLabs.fetchPreviewAudio(voice.previewUrl!);
    } else {
      bytes = await _elevenLabs.synthesizeSpeech(
        text: 'Hi, this is a preview of my voice for your Egida journeys.',
        voiceId: voice.voiceId,
      );
    }
    await _audioPlayer.playBytes(bytes);
  }

  Future<void> stopPreview() => _audioPlayer.stop();
}
