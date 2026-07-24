/// core/elevenlabs/elevenlabs_exceptions.dart
///
/// Typed exceptions thrown by [ElevenLabsService]. Keeping these distinct
/// from generic `Exception`/`http` errors lets the UI layer show precise,
/// user-friendly states (e.g. "no internet" vs "invalid API key") without
/// parsing strings.
library;

sealed class ElevenLabsException implements Exception {
  final String message;
  const ElevenLabsException(this.message);

  @override
  String toString() => message;
}

/// No network connection, DNS failure, timeout, etc.
class ElevenLabsNetworkException extends ElevenLabsException {
  const ElevenLabsNetworkException([
    super.message = 'Could not reach ElevenLabs. Check your connection.',
  ]);
}

/// 401/403 - bad or missing API key.
class ElevenLabsAuthException extends ElevenLabsException {
  const ElevenLabsAuthException([
    super.message = 'ElevenLabs rejected the API key.',
  ]);
}

/// 429 - rate limited.
class ElevenLabsRateLimitException extends ElevenLabsException {
  const ElevenLabsRateLimitException([
    super.message = 'Too many requests to ElevenLabs. Please wait a moment.',
  ]);
}

/// Any other non-2xx response.
class ElevenLabsServerException extends ElevenLabsException {
  final int statusCode;
  const ElevenLabsServerException(this.statusCode, [String? message])
      : super(message ?? 'ElevenLabs returned an error ($statusCode).');
}

/// Response body could not be parsed into the expected shape.
class ElevenLabsParsingException extends ElevenLabsException {
  const ElevenLabsParsingException([
    super.message = 'Received an unexpected response from ElevenLabs.',
  ]);
}
