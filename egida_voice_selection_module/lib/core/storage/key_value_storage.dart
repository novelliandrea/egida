/// core/storage/key_value_storage.dart
///
/// WHERE THIS FITS IN EGIDA
/// -------------------------------------------------------------------------
/// Generic abstract storage contract. Nothing in the feature layer depends
/// on SharedPreferences directly - it depends on this interface. This is
/// the seam the task asked for: "abstract enough to later be replaced with
/// Supabase / user profile / cloud sync".
///
/// TO MIGRATE TO SUPABASE LATER:
/// Create a `SupabaseKeyValueStorage implements KeyValueStorage` that reads
////writes to a `user_preferences` table keyed by `auth.uid()`, then swap
/// the single line in the dependency wiring (see Integration Guide, step 4)
/// that currently instantiates `SharedPreferencesKeyValueStorage`. No other
/// file in this module needs to change.
abstract class KeyValueStorage {
  Future<String?> getString(String key);
  Future<void> setString(String key, String value);
  Future<void> remove(String key);
}
