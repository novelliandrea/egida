/// core/audio/audio_player_service.dart
///
/// WHERE THIS FITS IN EGIDA
/// -------------------------------------------------------------------------
/// Thin wrapper around whatever audio-playback package Egida already uses
/// (or `just_audio`, recommended, if it doesn't have one yet). Kept as an
/// interface + implementation so tests can substitute a fake player, and so
/// swapping the underlying audio package never touches business logic.
///
/// If Egida already has an audio player service for other in-app sounds,
/// PREFER reusing that one and simply implementing `AudioPlayerService`
/// as a thin adapter around it, instead of adding a second audio engine
/// to the app.
library;

import 'dart:typed_data';

abstract class AudioPlayerService {
  /// Plays raw audio bytes (e.g. an MP3 buffer returned by ElevenLabs).
  /// Completes when playback finishes.
  Future<void> playBytes(Uint8List bytes);

  /// Stops any current playback immediately.
  Future<void> stop();

  /// Whether audio is currently playing.
  bool get isPlaying;

  void dispose();
}

/// Default implementation using `just_audio` (add it to pubspec.yaml - see
/// the Integration Guide for the exact dependency line). Swap this class
/// out freely if Egida standardizes on a different audio package.
class JustAudioPlayerService implements AudioPlayerService {
  // NOTE: kept generic/untyped here on purpose so this file compiles even
  // before `just_audio` is added to the host project's pubspec. Once you
  // add the dependency, replace the dynamic player below with:
  //
  //   import 'package:just_audio/just_audio.dart';
  //   final AudioPlayer _player = AudioPlayer();
  //
  // and implement playBytes using `_player.setAudioSource` with a
  // `BytesAudioSource` (or write bytes to a temp file and use
  // `setFilePath`, which is the simplest approach on all platforms).

  bool _isPlaying = false;

  @override
  bool get isPlaying => _isPlaying;

  @override
  Future<void> playBytes(Uint8List bytes) async {
    _isPlaying = true;
    // TODO(integration): replace with real just_audio playback, e.g.:
    //
    // final dir = await getTemporaryDirectory();
    // final file = File('${dir.path}/egida_tts_${DateTime.now().microsecondsSinceEpoch}.mp3');
    // await file.writeAsBytes(bytes, flush: true);
    // await _player.setFilePath(file.path);
    // await _player.play();
    // await _player.processingStateStream
    //     .firstWhere((s) => s == ProcessingState.completed);
    _isPlaying = false;
  }

  @override
  Future<void> stop() async {
    _isPlaying = false;
    // TODO(integration): await _player.stop();
  }

  @override
  void dispose() {
    // TODO(integration): _player.dispose();
  }
}
