// Schermata "Mappa della sicurezza". Come in Percorso, la mappa vera arriverà
// in un secondo momento: per ora mostriamo un segnaposto e la lista reale
// delle segnalazioni lette da Supabase, così puoi già provare il flusso
// "segnala → salva su Supabase → ricompare qui".

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme/colors';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Report } from '../types';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MappaScreen() {
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);

  // useFocusEffect ricarica le segnalazioni ogni volta che torni su questa
  // schermata (es. dopo aver chiuso il modulo "Segnala"), non solo al primo
  // avvio.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        if (!isSupabaseConfigured) return;
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        if (active && !error) setReports(data ?? []);
      }
      load();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Mappa della sicurezza</Text>
        <Text style={styles.subtitle}>
          Zone, luoghi sicuri e segnalazioni della community
        </Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>🗺️ Mappa in arrivo</Text>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ReportSheet')}
          accessibilityLabel="Segnala una zona"
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.sectionLabel}>SEGNALAZIONI</Text>
        {!isSupabaseConfigured && (
          <Text style={styles.emptyState}>
            Collega Supabase per vedere e creare segnalazioni reali (vedi
            README.md).
          </Text>
        )}
        {isSupabaseConfigured && reports.length === 0 && (
          <Text style={styles.emptyState}>
            Nessuna segnalazione ancora. Tocca "+" per aggiungerne una.
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
  headerBlock: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 13.5, color: colors.inkSoft, marginTop: 2 },
  mapPlaceholder: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#dcebe9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  fab: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: colors.white, fontSize: 24 },
  list: { padding: 20 },
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
