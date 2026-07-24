/// features/voice_selection/widgets/voice_tile.dart
///
/// One row in the voice list: name, description, language/gender meta,
/// a preview (play) button, and a clear selected-state indicator.
library;

import 'package:flutter/material.dart';

import '../models/voice_ui_model.dart';
import '../presentation/voice_selection_theme.dart';

class VoiceTile extends StatelessWidget {
  final VoiceUiModel model;
  final bool isPreviewing;
  final VoidCallback onSelect;
  final VoidCallback onPreview;

  const VoiceTile({
    super.key,
    required this.model,
    required this.isPreviewing,
    required this.onSelect,
    required this.onPreview,
  });

  @override
  Widget build(BuildContext context) {
    final voice = model.voice;
    final meta = [
      if (voice.language != null) voice.language!,
      if (voice.gender != null) voice.gender!,
    ].join(' Β· ');

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOut,
      decoration:
          model.isSelected ? VoiceTheme.selectedCardDecoration : VoiceTheme.cardDecoration,
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(VoiceTheme.radius),
        child: InkWell(
          borderRadius: BorderRadius.circular(VoiceTheme.radius),
          onTap: onSelect,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                _PreviewButton(isPlaying: isPreviewing, onTap: onPreview),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(voice.name, style: VoiceTheme.nameStyle),
                      const SizedBox(height: 3),
                      if (voice.description != null && voice.description!.isNotEmpty)
                        Text(
                          voice.description!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: VoiceTheme.metaStyle,
                        ),
                      if (meta.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(meta, style: VoiceTheme.mutedStyle),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  child: model.isSelected
                      ? Container(
                          key: const ValueKey('selected'),
                          width: 26,
                          height: 26,
                          decoration: const BoxDecoration(
                            color: VoiceTheme.accent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check_rounded,
                              size: 16, color: Colors.black),
                        )
                      : const SizedBox(
                          key: ValueKey('unselected'),
                          width: 26,
                          height: 26,
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PreviewButton extends StatelessWidget {
  final bool isPlaying;
  final VoidCallback onTap;

  const _PreviewButton({required this.isPlaying, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: VoiceTheme.surfaceRaised,
          shape: BoxShape.circle,
          border: Border.all(color: VoiceTheme.border),
        ),
        child: isPlaying
            ? const Padding(
                padding: EdgeInsets.all(11),
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: VoiceTheme.accent,
                ),
              )
            : const Icon(Icons.play_arrow_rounded,
                color: VoiceTheme.textPrimary, size: 20),
      ),
    );
  }
}
