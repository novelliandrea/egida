/// core/storage/shared_preferences_key_value_storage.dart
///
/// Default local implementation of [KeyValueStorage] using
/// `shared_preferences`. This satisfies requirement #2 ("selected voice
/// persists across app restarts") today, and is a drop-in replacement
/// target for a future Supabase-backed implementation.
library;

import 'package:shared_preferences/shared_preferences.dart';

import 'key_value_storage.dart';

class SharedPreferencesKeyValueStorage implements KeyValueStorage {
  @override
  Future<String?> getString(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  @override
  Future<void> setString(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  @override
  Future<void> remove(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }
}
