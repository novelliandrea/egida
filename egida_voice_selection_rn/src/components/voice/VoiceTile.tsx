/**
 * src/components/voice/VoiceTile.tsx
 * Una riga dell'elenco voci: nome, descrizione, meta lingua/genere,
 * pulsante anteprima (play) e indicatore chiaro dello stato selezionato.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VoiceUiModel } from '../../lib/voice/useVoiceSelection';
import { voiceTheme } from '../../theme/voiceSelectionTheme';

export function VoiceTile({
  voice,
  isPreviewing,
  onSelect,
  onPreview,
}: {
  voice: VoiceUiModel;
  isPreviewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const meta = [voice.language, voice.gender].filter(Boolean).join(' \u00b7 ');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={[styles.card, voice.isSelected && styles.cardSelected]}
    >
      <TouchableOpacity style={styles.previewButton} onPress={onPreview} activeOpacity={0.7}>
        {isPreviewing ? (
          <ActivityIndicator size="small" color={voiceTheme.color.accent} />
        ) : (
          <Text style={styles.playGlyph}>▶</Text>
        )}
      </TouchableOpacity>

      <View style={styles.textBlock}>
        <Text style={styles.name}>{voice.name}</Text>
        {!!voice.description && (
          <Text style={styles.description} numberOfLines={1}>
            {voice.description}
          </Text>
        )}
        {!!meta && <Text style={styles.meta}>{meta}</Text>}
      </View>

      {voice.isSelected ? (
        <View style={styles.checkCircle}>
          <Text style={styles.checkGlyph}>✓</Text>
        </View>
      ) : (
        <View style={styles.checkPlaceholder} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: voiceTheme.radius.lg,
    backgroundColor: voiceTheme.color.surface,
    borderWidth: 1,
    borderColor: voiceTheme.color.border,
  },
  cardSelected: {
    backgroundColor: voiceTheme.color.accentDim,
    borderColor: voiceTheme.color.accent,
  },
  previewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: voiceTheme.color.surfaceRaised,
    borderWidth: 1,
    borderColor: voiceTheme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: { color: voiceTheme.color.textPrimary, fontSize: 14 },
  textBlock: { flex: 1, marginLeft: 14 },
  name: { color: voiceTheme.color.textPrimary, fontSize: 16, fontWeight: '600' },
  description: { color: voiceTheme.color.textSecondary, fontSize: 13, marginTop: 3 },
  meta: { color: voiceTheme.color.textMuted, fontSize: 12, marginTop: 4 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: voiceTheme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkGlyph: { color: '#04140F', fontWeight: '800', fontSize: 13 },
  checkPlaceholder: { width: 26, height: 26, marginLeft: 10 },
});
