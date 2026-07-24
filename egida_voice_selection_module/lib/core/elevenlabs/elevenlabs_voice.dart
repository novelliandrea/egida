/// core/elevenlabs/elevenlabs_voice.dart
///
/// Plain data model representing one ElevenLabs voice. This is the
/// "core" model (API-shaped). The feature layer has its own thin
/// presentation model (`VoiceUiModel`) that wraps this one - see
/// features/voice_selection/models/voice_ui_model.dart - so that UI-only
/// concerns (e.g. "is this the selected voice") never leak into core.
class ElevenLabsVoice {
  final String voiceId;
  final String name;
  final String? description;
  final String? previewUrl;
  final String? language;
  final String? gender;
  final List<String> tags;

  const ElevenLabsVoice({
    required this.voiceId,
    required this.name,
    this.description,
    this.previewUrl,
    this.language,
    this.gender,
    this.tags = const [],
  });

  factory ElevenLabsVoice.fromJson(Map<String, dynamic> json) {
    final labels = (json['labels'] as Map?)?.cast<String, dynamic>() ?? {};
    return ElevenLabsVoice(
      voiceId: json['voice_id'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown voice',
      description: json['description'] as String?,
      previewUrl: json['preview_url'] as String?,
      language: labels['language'] as String? ?? labels['accent'] as String?,
      gender: labels['gender'] as String?,
      tags: (json['category'] != null) ? [json['category'].toString()] : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'voice_id': voiceId,
        'name': name,
        'description': description,
        'preview_url': previewUrl,
        'labels': {
          if (language != null) 'language': language,
          if (gender != null) 'gender': gender,
        },
      };
}
