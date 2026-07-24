/// features/voice_selection/models/voice_ui_model.dart
///
/// Wraps [ElevenLabsVoice] (core, API-shaped) with UI-only state
/// (`isSelected`, `isPreviewing`). Keeping this separate from the core
/// model means the core ElevenLabs layer stays completely UI-agnostic and
/// reusable outside of this screen (e.g. directly by GuidedRouteSpeechService).
library;

import '../../../core/elevenlabs/elevenlabs_voice.dart';

class VoiceUiModel {
  final ElevenLabsVoice voice;
  final bool isSelected;
  final bool isPreviewing;

  const VoiceUiModel({
    required this.voice,
    this.isSelected = false,
    this.isPreviewing = false,
  });

  VoiceUiModel copyWith({bool? isSelected, bool? isPreviewing}) {
    return VoiceUiModel(
      voice: voice,
      isSelected: isSelected ?? this.isSelected,
      isPreviewing: isPreviewing ?? this.isPreviewing,
    );
  }
}
