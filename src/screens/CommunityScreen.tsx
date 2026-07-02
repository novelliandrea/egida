// Schermata Community. Per ora "Richieste di aiuto" e "Classifica volontari"
// sono dati di esempio (non ancora salvati su Supabase) — è il prossimo pezzo
// da collegare quando aggiungeremo il login, perché richiedono di sapere
// "chi" sta chiedendo aiuto e "chi" sono i suoi amici.

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme/colors';

const MOCK_LEADERBOARD = [
  { rank: 1, name: '🥇 Marta R.', points: '1 280 pt' },
  { rank: 2, name: '🥈 Davide P.', points: '980 pt' },
  { rank: 3, name: '🥉 Giulia (tu)', points: '845 pt' },
];

export function CommunityScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>
          Aiuta e fatti aiutare da chi è vicino a te
        </Text>

        <Text style={styles.sectionLabel}>RICHIESTE DI AIUTO</Text>
        <View style={styles.helpCard}>
          <Text style={styles.helpName}>Alex · 280 m da te</Text>
          <Text style={styles.helpMsg}>
            "Alex sta tornando a casa e desidera compagnia."
          </Text>
        </View>

        <Text style={styles.sectionLabel}>CLASSIFICA VOLONTARI</Text>
        {MOCK_LEADERBOARD.map((entry) => (
          <View key={entry.rank} style={styles.lbRow}>
            <Text style={styles.lbName}>{entry.name}</Text>
            <Text style={styles.lbPoints}>{entry.points}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  subtitle: {
    fontSize: 13.5,
    color: colors.inkSoft,
    marginTop: 2,
    marginBottom: 18,
  },
  sectionLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  helpCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 20,
  },
  helpName: { fontWeight: '700', fontSize: 13, color: colors.ink },
  helpMsg: {
    backgroundColor: colors.teal050,
    color: '#0d6a5e',
    fontSize: 12,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  lbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  lbName: { fontWeight: '700', fontSize: 12.5, color: colors.ink },
  lbPoints: { fontWeight: '700', fontSize: 11.5, color: '#0d7a6c' },
});
