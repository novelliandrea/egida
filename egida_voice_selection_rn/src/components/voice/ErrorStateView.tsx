/**
 * src/components/voice/ErrorStateView.tsx
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { voiceTheme } from '../../theme/voiceSelectionTheme';

export function ErrorStateView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconGlyph}>!</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.buttonLabel}>Riprova</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: voiceTheme.spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 84, 112, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconGlyph: { color: voiceTheme.color.danger, fontSize: 24, fontWeight: '700' },
  message: {
    color: voiceTheme.color.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: voiceTheme.color.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: voiceTheme.radius.md,
  },
  buttonLabel: { color: '#04140F', fontWeight: '700', fontSize: 14 },
});
