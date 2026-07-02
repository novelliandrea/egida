// Schermata Home — il punto di partenza dell'app.
// Mostra le azioni rapide principali e le ultime segnalazioni vicine.

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme/colors';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Report } from '../types';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentReports();
  }, []);

  async function loadRecentReports() {
    if (!isSupabaseConfigured) {
      // Nessun backend configurato ancora: mostriamo la schermata comunque,
      // solo senza segnalazioni reali. Vedi README.md per collegare Supabase.
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.warn('[Egida] Errore caricando le segnalazioni:', error.message);
    } else {
      setReports(data ?? []);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>🛡️ Egida</Text>
          <View style={styles.safetyPill}>
            <Text style={styles.safetyPillText}>🟢 Zona sicura</Text>
          </View>
        </View>

        <Text style={styles.greeting}>Ciao, Giulia</Text>
        <Text style={styles.title}>Come ti aiutiamo oggi?</Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickCard, styles.quickCardPrimary]}
            onPress={() => navigation.navigate('Percorso')}
          >
            <Text style={styles.quickIcon}>🏠</Text>
            <Text style={styles.quickTitlePrimary}>Torno a casa</Text>
            <Text style={styles.quickSubPrimary}>
              Percorso sicuro guidato passo passo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.quickIcon}>📍</Text>
            <Text style={styles.quickTitle}>Luogo sicuro</Text>
            <Text style={styles.quickSub}>Il più vicino a te</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <Text style={styles.quickIcon}>🚕</Text>
            <Text style={styles.quickTitle}>Taxi</Text>
            <Text style={styles.quickSub}>Uber · FreeNow · ItTaxi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('FakeCall')}
          >
            <Text style={styles.quickIcon}>📞</Text>
            <Text style={styles.quickTitle}>Finto squillo</Text>
            <Text style={styles.quickSub}>Esci da situazioni scomode</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>ULTIME SEGNALAZIONI VICINO A TE</Text>

        {!isSupabaseConfigured && (
          <Text style={styles.emptyState}>
            Collega Supabase (vedi README.md) per vedere qui le segnalazioni
            reali della community.
          </Text>
        )}

        {isSupabaseConfigured && !loading && reports.length === 0 && (
          <Text style={styles.emptyState}>
            Nessuna segnalazione ancora — sii la prima a contribuire dalla
            Mappa.
          </Text>
        )}

        {reports.map((report) => (
          <View key={report.id} style={styles.reportItem}>
            <Text style={styles.reportTitle}>{report.category}</Text>
            <Text style={styles.reportMeta}>
              Rischio {report.risk_level} · confermato {report.confirm_count}{' '}
              volte
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 40 },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brand: { fontWeight: '800', fontSize: 14, color: colors.navy900 },
  safetyPill: {
    backgroundColor: colors.teal050,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  safetyPillText: { color: '#0d7a6c', fontWeight: '700', fontSize: 11 },
  greeting: { color: colors.inkSoft, fontSize: 13.5, marginBottom: 2 },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 18,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  quickCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
  },
  quickCardPrimary: {
    width: '100%',
    backgroundColor: colors.teal500,
    borderWidth: 0,
    padding: 18,
  },
  quickIcon: { fontSize: 21, marginBottom: 6 },
  quickTitle: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  quickSub: { color: colors.inkSoft, fontSize: 11, marginTop: 3 },
  quickTitlePrimary: { color: colors.white, fontWeight: '700', fontSize: 15 },
  quickSubPrimary: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 3,
  },
  sectionLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  emptyState: {
    color: colors.inkSoft,
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  reportItem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },
  reportTitle: { color: colors.ink, fontWeight: '700', fontSize: 12.5 },
  reportMeta: { color: colors.inkSoft, fontSize: 11, marginTop: 2 },
});
