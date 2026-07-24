/// features/voice_selection/repositories/local_voice_preference_repository.dart
///
/// Local implementation of [VoicePreferenceRepository], backed by
/// [KeyValueStorage] (SharedPreferences by default - see
/// core/storage/shared_preferences_key_value_storage.dart).
///
/// FUTURE SUPABASE MIGRATION
/// -------------------------------------------------------------------------
/// Create `SupabaseVoicePreferenceRepository implements VoicePreferenceRepository`
/// that reads/writes a `preferred_voice_id` column on the user's profile
/// row, then swap it in at the single wiring point described in the
/// Integration Guide. No controller, screen, or the Guided Route feature
/// needs to change - they all depend on the abstract
/// `VoicePreferenceRepository` interface, never on this class directly.
library;

import '../../../core/storage/key_value_storage.dart';
import 'voice_preference_repository.dart';

class LocalVoicePreferenceRepository implements VoicePreferenceRepository {
  static const _storageKey = 'egida.guided_route.selected_voice_id';

  final KeyValueStorage _storage;

  LocalVoicePreferenceRepository(this._storage);

  @override
  Future<String?> getSelectedVoiceId() => _storage.getString(_storageKey);

  @override
  Future<void> setSelectedVoiceId(String voiceId) =>
      _storage.setString(_storageKey, voiceId);

  @override
  Future<void> clear() => _storage.remove(_storageKey);
}
