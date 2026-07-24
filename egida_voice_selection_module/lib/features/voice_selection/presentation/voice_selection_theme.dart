/// features/voice_selection/presentation/voice_selection_theme.dart
///
/// Local design tokens for this screen only. If Egida already has a shared
/// `AppTheme`/`AppColors` (very likely, for a night-mode safety app), THIS
/// FILE SHOULD BE DELETED and the widgets below should be re-pointed at
/// Egida's existing theme constants instead - it's kept isolated here only
/// so this module works out of the box, standalone, before merge.
library;

import 'package:flutter/material.dart';

class VoiceTheme {
  VoiceTheme._();

  static const background = Color(0xFF0B0F14);
  static const surface = Color(0xFF11161D);
  static const surfaceRaised = Color(0xFF161C25);
  static const border = Color(0xFF232B36);

  static const accent = Color(0xFF00E5A0); // signal-green, "safe" cue
  static const accentDim = Color(0xFF0B4433);
  static const danger = Color(0xFFFF5470);
  static const warning = Color(0xFFFFB020);

  static const textPrimary = Color(0xFFEAF1F5);
  static const textSecondary = Color(0xFF8A97A6);
  static const textMuted = Color(0xFF56636F);

  static const radius = 16.0;
  static const radiusSm = 10.0;

  static const cardDecoration = BoxDecoration(
    color: surface,
    borderRadius: BorderRadius.all(Radius.circular(radius)),
    border: Border.fromBorderSide(BorderSide(color: border, width: 1)),
  );

  static BoxDecoration selectedCardDecoration = BoxDecoration(
    color: accentDim.withValues(alpha: 0.35),
    borderRadius: const BorderRadius.all(Radius.circular(radius)),
    border: const Border.fromBorderSide(BorderSide(color: accent, width: 1.4)),
    boxShadow: [
      BoxShadow(
        color: accent.withValues(alpha: 0.18),
        blurRadius: 20,
        spreadRadius: 1,
      ),
    ],
  );

  static const titleStyle = TextStyle(
    color: textPrimary,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.2,
  );

  static const nameStyle = TextStyle(
    color: textPrimary,
    fontSize: 16,
    fontWeight: FontWeight.w600,
  );

  static const metaStyle = TextStyle(
    color: textSecondary,
    fontSize: 13,
    fontWeight: FontWeight.w400,
  );

  static const mutedStyle = TextStyle(
    color: textMuted,
    fontSize: 12,
  );
}
