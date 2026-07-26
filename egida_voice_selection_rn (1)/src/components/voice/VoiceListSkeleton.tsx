/**
 * src/components/voice/VoiceListSkeleton.tsx
 * Righe placeholder animate mostrate mentre l'elenco voci sta caricando.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet, View } from 'react-native';

import { voiceTheme } from '../../theme/voiceSelectionTheme';

export function VoiceListSkeleton({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <FlatList
      data={Array.from({ length: itemCount })}
      keyExtractor={(_, i) => `skeleton-${i}`}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={() => <SkeletonRow />}
    />
  );
}

function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={styles.avatar} />
      <View style={styles.textBlock}>
        <View style={styles.lineWide} />
        <View style={styles.lineNarrow} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { padding: voiceTheme.spacing.lg },
  row: {
    height: 76,
    borderRadius: voiceTheme.radius.lg,
    borderWidth: 1,
    borderColor: voiceTheme.color.border,
    backgroundColor: voiceTheme.color.surfaceRaised,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: voiceTheme.color.border,
  },
  textBlock: { marginLeft: 14, flex: 1 },
  lineWide: {
    height: 12,
    width: '45%',
    borderRadius: 4,
    backgroundColor: voiceTheme.color.border,
    marginBottom: 8,
  },
  lineNarrow: {
    height: 10,
    width: '65%',
    borderRadius: 4,
    backgroundColor: voiceTheme.color.border,
  },
});
