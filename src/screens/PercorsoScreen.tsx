// Schermata "Percorso sicuro" — si apre quando premi "Torno a casa" dalla Home.
// Per ora la mappa è solo un rettangolo segnaposto: integrare una mappa vera
// (react-native-maps + Google/Apple Maps) è un passo successivo che richiede
// una API key e una build "development client" — vedi README.md.

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PercorsoScreen() {
  const navigation = useNavigation<Nav>();
  const [companionOn, setCompanionOn] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Torna alla home"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Percorso sicuro</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Segnaposto mappa: qui andrà una vera MapView con il percorso disegnato. */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️ Mappa in arrivo</Text>
          <Text style={styles.mapPlaceholderSub}>
            Percorso sicuro attivo · evita 2 zone segnalate
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>🛡️ Percorso più sicuro</Text>
            <View style={styles.badgeSafe}>
              <Text style={styles.badgeSafeText}>Consigliato</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              <Text style={styles.metaBold}>14 min</Text> a piedi
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaBold}>1,1 km</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>Condividi tragitto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>⏱️</Text>
            <Text style={styles.actionLabel}>Check-in alle 23:30</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Accompagnamento virtuale</Text>
            <Text style={styles.toggleSub}>
              Controlliamo che vada tutto bene
            </Text>
          </View>
          <Switch
            value={companionOn}
            onValueChange={setCompanionOn}
            trackColor={{ false: '#cdd9df', true: colors.teal500 }}
            thumbColor={colors.white}
          />
        </View>

        {companionOn && (
          <View style={styles.companionPanel}>
            <Text style={styles.companionTitle}>🎧 Modalità attiva</Text>
            <Text style={styles.companionText}>
              Ti contatteremo ogni 5 minuti per sapere che va tutto bene.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Arrived')}
        >
          <Text style={styles.primaryBtnText}>Sono arrivato a casa ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 16, color: colors.ink },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  mapPlaceholder: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: '#dcebe9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  mapPlaceholderText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  mapPlaceholderSub: {
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontWeight: '700', fontSize: 14, color: colors.ink },
  badgeSafe: {
    backgroundColor: colors.teal050,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSafeText: { color: '#0d7a6c', fontWeight: '700', fontSize: 11 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaText: { color: colors.inkSoft, fontSize: 12 },
  metaBold: { color: colors.ink, fontWeight: '700', fontSize: 13.5 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: { fontSize: 18, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: colors.ink },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
  },
  toggleTitle: { fontWeight: '700', fontSize: 13.5, color: colors.ink },
  toggleSub: { color: colors.inkSoft, fontSize: 11.5, marginTop: 2 },
  companionPanel: {
    backgroundColor: colors.teal050,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 10,
  },
  companionTitle: { fontWeight: '700', color: '#0d7a6c', fontSize: 12.5 },
  companionText: {
    color: colors.inkSoft,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  footer: { padding: 20, paddingTop: 0 },
  primaryBtn: {
    backgroundColor: colors.teal500,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
