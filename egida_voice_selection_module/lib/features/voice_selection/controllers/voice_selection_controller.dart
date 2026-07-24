/// features/voice_selection/controllers/voice_selection_controller.dart
///
/// State/business logic for the Voice Selection screen. Uses
/// `ChangeNotifier` because it's dependency-free and works with `Provider`,
/// plain `AnimatedBuilder`, or can be trivially ported to Riverpod/Bloc if
/// that's what Egida already standardizes on - only this file would need
/// to change, the screen and service layer stay the same.
library;

import 'package:flutter/foundation.dart';

import '../../../core/elevenlabs/elevenlabs_exceptions.dart';
import '../../../core/elevenlabs/elevenlabs_voice.dart';
import '../models/voice_ui_model.dart';
import '../services/voice_catalog_service.dart';

enum VoiceSelectionStatus { initial, loading, loaded, error }

class VoiceSelectionController extends ChangeNotifier {
  final VoiceCatalogService _service;

  VoiceSelectionController(this._service);

  VoiceSelectionStatus status = VoiceSelectionStatus.initial;
  String? errorMessage;
  List<VoiceUiModel> voices = [];
  String? selectedVoiceId;

  /// voiceId currently playing a preview, if any (drives per-tile spinner).
  String? previewingVoiceId;

  Future<void> load({bool forceRefresh = false}) async {
    status = VoiceSelectionStatus.loading;
    errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _service.loadVoices(forceRefresh: forceRefresh),
        _service.getSelectedVoiceId(),
      ]);
      final fetchedVoices = results[0] as List<ElevenLabsVoice>;
      selectedVoiceId = results[1] as String?;

      voices = fetchedVoices
          .map((v) => VoiceUiModel(
                voice: v,
                isSelected: v.voiceId == selectedVoiceId,
              ))
          .toList();
      status = VoiceSelectionStatus.loaded;
    } on ElevenLabsException catch (e) {
      status = VoiceSelectionStatus.error;
      errorMessage = e.message;
    } catch (_) {
      status = VoiceSelectionStatus.error;
      errorMessage = 'Something went wrong while loading voices.';
    }
    notifyListeners();
  }

  Future<void> selectVoice(String voiceId) async {
    final previous = selectedVoiceId;
    selectedVoiceId = voiceId;
    voices = voices
        .map((v) => v.copyWith(isSelected: v.voice.voiceId == voiceId))
        .toList();
    notifyListeners();

    try {
      await _service.selectVoice(voiceId);
    } catch (_) {
      // Roll back optimistic UI update if persistence failed.
      selectedVoiceId = previous;
      voices = voices
          .map((v) => v.copyWith(isSelected: v.voice.voiceId == previous))
          .toList();
      errorMessage = 'Could not save your selected voice. Please try again.';
      notifyListeners();
    }
  }

  Future<void> previewVoice(String voiceId) async {
    if (previewingVoiceId == voiceId) {
      await _service.stopPreview();
      previewingVoiceId = null;
      notifyListeners();
      return;
    }

    previewingVoiceId = voiceId;
    notifyListeners();

    final voiceModel = voices.firstWhere((v) => v.voice.voiceId == voiceId);
    try {
      await _service.playPreview(voiceModel.voice);
    } on ElevenLabsException catch (e) {
      errorMessage = e.message;
    } catch (_) {
      errorMessage = 'Could not play preview for this voice.';
    } finally {
      previewingVoiceId = null;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _service.stopPreview();
    super.dispose();
  }
}
