/// core/config/env_config.dart
///
/// WHERE THIS FITS IN EGIDA
/// -------------------------------------------------------------------------
/// This is the single source of truth for every configurable value this
/// module needs (API keys, base URLs, default voice id, timeouts).
/// Nothing in this module ever hardcodes a secret or an endpoint - it all
/// flows through this class.
///
/// INTEGRATION NOTE FOR THE EGIDA TEAM
/// -------------------------------------------------------------------------
/// Egida almost certainly already has its own env/config approach (e.g.
/// `--dart-define`, a `.env` file read via `flutter_dotenv`, a Supabase
/// remote-config table, etc). This class is intentionally a thin wrapper so
/// you can either:
///   1. Keep it as-is and feed values in via `EgidaVoiceConfig.init(...)`
///      once, at app startup, from wherever Egida already stores secrets.
///   2. Replace the body of each getter with calls into Egida's existing
///      config/env system, without touching any other file in this module -
///      every other file only ever talks to `EgidaVoiceConfig`, never to
///      `Platform.environment` or `dotenv` directly.
class EgidaVoiceConfig {
  EgidaVoiceConfig._();

  static String? _elevenLabsApiKey;
  static String _elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
  static String? _defaultVoiceId;
  static Duration _requestTimeout = const Duration(seconds: 15);
  static int _maxRetries = 2;

  /// Call this once during app bootstrap (e.g. in `main()`), before any
  /// screen that uses this module is shown.
  ///
  /// Example:
  /// ```dart
  /// EgidaVoiceConfig.init(
  ///   elevenLabsApiKey: const String.fromEnvironment('ELEVENLABS_API_KEY'),
  ///   defaultVoiceId: const String.fromEnvironment('ELEVENLABS_DEFAULT_VOICE_ID'),
  /// );
  /// ```
  static void init({
    required String elevenLabsApiKey,
    String? elevenLabsBaseUrl,
    String? defaultVoiceId,
    Duration? requestTimeout,
    int? maxRetries,
  }) {
    _elevenLabsApiKey = elevenLabsApiKey;
    if (elevenLabsBaseUrl != null) _elevenLabsBaseUrl = elevenLabsBaseUrl;
    _defaultVoiceId = defaultVoiceId;
    if (requestTimeout != null) _requestTimeout = requestTimeout;
    if (maxRetries != null) _maxRetries = maxRetries;
  }

  static String get elevenLabsApiKey {
    final key = _elevenLabsApiKey;
    if (key == null || key.isEmpty) {
      throw StateError(
        'EgidaVoiceConfig.init() was not called, or was called without an '
        'ElevenLabs API key. Call EgidaVoiceConfig.init(...) at app startup.',
      );
    }
    return key;
  }

  static String get elevenLabsBaseUrl => _elevenLabsBaseUrl;

  /// Fallback voice used before the user has ever picked one.
  static String? get defaultVoiceId => _defaultVoiceId;

  static Duration get requestTimeout => _requestTimeout;

  static int get maxRetries => _maxRetries;
}
