/// features/voice_selection/repositories/voice_preference_repository.dart
///
/// Repository contract owning ONE piece of state: "which voice id did the
/// user pick for Guided Route narration". This is intentionally narrow -
/// it is not a general settings repository - so it can be swapped for a
/// Supabase-backed one later without dragging unrelated preferences along.
abstract class VoicePreferenceRepository {
  /// Returns the previously saved voice id, or null if the user has never
  /// chosen one yet (in which case callers should fall back to
  /// `EgidaVoiceConfig.defaultVoiceId`).
  Future<String?> getSelectedVoiceId();

  /// Persists the user's chosen voice id.
  Future<void> setSelectedVoiceId(String voiceId);

  /// Clears the saved preference (e.g. on logout, or "reset to default").
  Future<void> clear();
}
