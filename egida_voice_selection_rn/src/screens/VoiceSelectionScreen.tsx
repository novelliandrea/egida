/**
 * src/screens/VoiceSelectionScreen.tsx
 *
 * DOVE SI INSERISCE IN EGIDA
 * ---------------------------------------------------------------------------
 * Questa è la schermata di impostazioni richiesta dal task. Aggiungila
 * alla navigazione esistente (dentro `src/navigation/`), collegata da un
 * pulsante nel menu Impostazioni già presente in Egida, es.:
 *
 *   navigation.navigate('VoiceSelection');
 *
 * La schermata prende `VoiceCatalogService` da `useVoiceModule()` (vedi
 * VoiceModuleProvider.tsx), quindi non serve passare nulla manualmente
 * finché l'app è avvolta nel provider.
 */

import React, { useEffect } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ErrorStateView } from '../components/voice/ErrorStateView';
import { VoiceListSkeleton } from '../components/voice/VoiceListSkeleton';
import { VoiceTile } from '../components/voice/VoiceTile';
import { useVoiceModule } from '../lib/voice/VoiceModuleProvider';
import { useVoiceSelection } from '../lib/voice/useVoiceSelection';
import { voiceTheme } from '../theme/voiceSelectionTheme';

export function VoiceSelectionScreen() {
  const { voiceCatalogService } = useVoiceModule();
  const {
    status,
    errorMessage,
    voices,
    previewingVoiceId,
    load,
    selectVoice,
    previewVoice,
  } = useVoiceSelection(voiceCatalogService);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Voce Guida</Text>
      </View>

      {(status === 'initial' || status === 'loading') && <VoiceListSkeleton />}

      {status === 'error' && (
        <ErrorStateView
          message={errorMessage ?? 'Si è verificato un problema.'}
          onRetry={() => load(true)}
        />
      )}

      {status === 'loaded' && (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => load(true)}
              tintColor={voiceTheme.color.accent}
            />
          }
        >
          {voices.map((voice) => (
            <View key={voice.voiceId} style={styles.tileWrapper}>
              <VoiceTile
                voice={voice}
                isPreviewing={previewingVoiceId === voice.voiceId}
                onSelect={() => selectVoice(voice.voiceId)}
                onPreview={() => previewVoice(voice.voiceId)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: voiceTheme.color.background },
  header: {
    paddingHorizontal: voiceTheme.spacing.lg,
    paddingVertical: voiceTheme.spacing.md,
  },
  title: { ...voiceTheme.font.title, color: voiceTheme.color.textPrimary },
  list: { padding: voiceTheme.spacing.lg },
  tileWrapper: { marginBottom: 12 },
});
