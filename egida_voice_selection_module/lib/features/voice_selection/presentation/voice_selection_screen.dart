/// features/voice_selection/presentation/voice_selection_screen.dart
///
/// WHERE THIS FITS IN EGIDA
/// -------------------------------------------------------------------------
/// This is the settings screen the task asks for. Push it from wherever
/// Egida's existing Settings menu lives, e.g.:
///
///   Navigator.of(context).push(MaterialPageRoute(
///     builder: (_) => VoiceSelectionScreen(controller: controller),
///   ));
///
/// The screen takes a ready-made [VoiceSelectionController] via
/// constructor injection rather than building its own dependencies, so it
/// stays trivially testable and decoupled from how Egida wires up DI
/// (get_it, Provider, Riverpod, manual - all work the same way).
library;

import 'package:flutter/material.dart';

import '../controllers/voice_selection_controller.dart';
import '../widgets/error_state_view.dart';
import '../widgets/voice_list_skeleton.dart';
import '../widgets/voice_tile.dart';
import 'voice_selection_theme.dart';

class VoiceSelectionScreen extends StatefulWidget {
  final VoiceSelectionController controller;

  const VoiceSelectionScreen({super.key, required this.controller});

  @override
  State<VoiceSelectionScreen> createState() => _VoiceSelectionScreenState();
}

class _VoiceSelectionScreenState extends State<VoiceSelectionScreen> {
  @override
  void initState() {
    super.initState();
    widget.controller.load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: VoiceTheme.background,
      appBar: AppBar(
        backgroundColor: VoiceTheme.background,
        elevation: 0,
        title: const Text('Guide Voice', style: VoiceTheme.titleStyle),
        iconTheme: const IconThemeData(color: VoiceTheme.textPrimary),
      ),
      body: SafeArea(
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, _) {
            final c = widget.controller;

            switch (c.status) {
              case VoiceSelectionStatus.initial:
              case VoiceSelectionStatus.loading:
                return const VoiceListSkeleton();

              case VoiceSelectionStatus.error:
                return ErrorStateView(
                  message: c.errorMessage ?? 'Something went wrong.',
                  onRetry: () => c.load(forceRefresh: true),
                );

              case VoiceSelectionStatus.loaded:
                return RefreshIndicator(
                  color: VoiceTheme.accent,
                  backgroundColor: VoiceTheme.surface,
                  onRefresh: () => c.load(forceRefresh: true),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: c.voices.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final model = c.voices[index];
                      return VoiceTile(
                        model: model,
                        isPreviewing:
                            c.previewingVoiceId == model.voice.voiceId,
                        onSelect: () => c.selectVoice(model.voice.voiceId),
                        onPreview: () => c.previewVoice(model.voice.voiceId),
                      );
                    },
                  ),
                );
            }
          },
        ),
      ),
    );
  }
}
