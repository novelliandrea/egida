/// core/elevenlabs/elevenlabs_service.dart
///
/// WHERE THIS FITS IN EGIDA
/// -------------------------------------------------------------------------
/// This is the ONLY class in the entire module allowed to make HTTP calls
/// to ElevenLabs. Every other layer (controllers, screens, guided route)
/// talks to this service, never to `http`/`dio` directly. This keeps the
/// API layer swappable (e.g. mockable in tests, or replaceable if Egida
/// later proxies ElevenLabs calls through its own backend for key safety).
///
/// This file is fully independent of Egida's existing codebase - it has no
/// imports from the rest of Egida and can be dropped in as-is.
library;

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

import '../config/env_config.dart';
import 'elevenlabs_exceptions.dart';
import 'elevenlabs_voice.dart';

class ElevenLabsService {
  final http.Client _client;

  ElevenLabsService({http.Client? client}) : _client = client ?? http.Client();

  Map<String, String> get _headers => {
        'xi-api-key': EgidaVoiceConfig.elevenLabsApiKey,
        'Content-Type': 'application/json',
      };

  /// Fetches the list of voices available to this ElevenLabs account.
  Future<List<ElevenLabsVoice>> fetchVoices() {
    return _withRetry(() async {
      final uri = Uri.parse('${EgidaVoiceConfig.elevenLabsBaseUrl}/voices');
      final response = await _client
          .get(uri, headers: _headers)
          .timeout(EgidaVoiceConfig.requestTimeout);

      _throwIfError(response.statusCode);

      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        final voices = (body['voices'] as List? ?? [])
            .cast<Map<String, dynamic>>()
            .map(ElevenLabsVoice.fromJson)
            .toList();
        return voices;
      } catch (_) {
        throw const ElevenLabsParsingException();
      }
    });
  }

  /// Downloads the raw audio bytes for a voice's built-in preview clip, if
  /// [previewUrl] is available. This does NOT count against TTS character
  /// quota since it's a static asset ElevenLabs already hosts.
  Future<Uint8List> fetchPreviewAudio(String previewUrl) {
    return _withRetry(() async {
      final response = await _client
          .get(Uri.parse(previewUrl))
          .timeout(EgidaVoiceConfig.requestTimeout);
      _throwIfError(response.statusCode);
      return response.bodyBytes;
    });
  }

  /// Generates speech audio for [text] using [voiceId]. This is what the
  /// Guided Route feature calls (indirectly, via GuidedRouteSpeechService)
  /// for every spoken message.
  Future<Uint8List> synthesizeSpeech({
    required String text,
    required String voiceId,
    String modelId = 'eleven_multilingual_v2',
    double stability = 0.5,
    double similarityBoost = 0.75,
  }) {
    return _withRetry(() async {
      final uri = Uri.parse(
        '${EgidaVoiceConfig.elevenLabsBaseUrl}/text-to-speech/$voiceId',
      );
      final response = await _client
          .post(
            uri,
            headers: _headers,
            body: jsonEncode({
              'text': text,
              'model_id': modelId,
              'voice_settings': {
                'stability': stability,
                'similarity_boost': similarityBoost,
              },
            }),
          )
          .timeout(EgidaVoiceConfig.requestTimeout);

      _throwIfError(response.statusCode);
      return response.bodyBytes;
    });
  }

  void _throwIfError(int statusCode) {
    if (statusCode >= 200 && statusCode < 300) return;
    if (statusCode == 401 || statusCode == 403) {
      throw const ElevenLabsAuthException();
    }
    if (statusCode == 429) {
      throw const ElevenLabsRateLimitException();
    }
    throw ElevenLabsServerException(statusCode);
  }

  /// Simple exponential-backoff retry wrapper. Retries network failures and
  /// 5xx/429s up to `EgidaVoiceConfig.maxRetries` times; does NOT retry auth
  /// errors (401/403), since retrying with the same bad key will never help.
  Future<T> _withRetry<T>(Future<T> Function() action) async {
    var attempt = 0;
    while (true) {
      try {
        return await action();
      } on ElevenLabsAuthException {
        rethrow;
      } on ElevenLabsException catch (_) {
        if (attempt >= EgidaVoiceConfig.maxRetries) rethrow;
      } on TimeoutException catch (_) {
        if (attempt >= EgidaVoiceConfig.maxRetries) {
          throw const ElevenLabsNetworkException();
        }
      } catch (_) {
        if (attempt >= EgidaVoiceConfig.maxRetries) {
          throw const ElevenLabsNetworkException();
        }
      }
      attempt++;
      await Future.delayed(Duration(milliseconds: 400 * attempt * attempt));
    }
  }

  void dispose() => _client.close();
}
