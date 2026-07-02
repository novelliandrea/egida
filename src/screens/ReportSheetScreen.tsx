// Modulo "Segnala una zona" — si apre come schermata modale dalla Mappa.
// Nota sulla posizione: qui usiamo coordinate finte (Milano, Duomo) perché
// non abbiamo ancora chiesto il permesso di geolocalizzazione. Quando
// aggiungeremo expo-location, sostituiremo latitude/longitude con la
// posizione reale dell'utente.

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme/colors';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RiskLevel } from '../types';

const CATEGORIES = [
  '💡 Scarsa illuminazione',
  '🚷 Persone moleste',
  '🏚️ Area isolata',
  '🔨 Atti vandalici',
  '✏️ Altro',
];

const RISK_LEVELS: { key: RiskLevel; label: string; color: string }[] = [
  { key: 'bassa', label: 'Bassa', color: colors.teal500 },
  { key: 'media', label: 'Media', color: colors.amber },
  { key: 'alta', label: 'Alta', color: colors.red },
];

// Coordinate segnaposto (Piazza Duomo, Milano) finché non c'è la geolocalizzazione reale.
const PLACEHOLDER_LAT = 45.4642;
const PLACEHOLDER_LNG = 9.19;

export function ReportSheetScreen() {
  const navigation = useNavigation();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [risk, setRisk] = useState<RiskLevel>('media');
  const [note, setNote] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase non configurato',
        'Aggiungi le chiavi nel file .env per poter salvare davvero le segnalazioni (vedi README.md).'
      );
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      category,
      risk_level: risk,
      note: note || null,
      latitude: PLACEHOLDER_LAT,
      longitude: PLACEHOLDER_LNG,
      is_anonymous: anonymous,
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Errore', error.message);
      return;
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Segnala una zona</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>COSA HAI NOTATO?</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, category === item && styles.chipActive]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>LIVELLO DI RISCHIO PERCEPITO</Text>
        <View style={styles.segRow}>
          {RISK_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.segBtn,
                risk === level.key && {
                  borderColor: level.color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setRisk(level.key)}
            >
              <View style={[styles.swatch, { backgroundColor: level.color }]} />
              <Text style={styles.segLabel}>{level.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.textarea}
          placeholder="Aggiungi un dettaglio (opzionale)"
          placeholderTextColor="#8aa0ad"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Segnala in forma anonima</Text>
            <Text style={styles.toggleSub}>
              Il tuo nome non sarà mai visibile
            </Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ false: '#cdd9df', true: colors.teal500 }}
            thumbColor={colors.white}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'Invio in corso…' : 'Invia segnalazione'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  close: { fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: colors.navy900, borderColor: colors.navy900 },
  chipText: { fontSize: 12.5, fontWeight: '600', color: colors.ink },
  chipTextActive: { color: colors.white },
  segRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  segBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    gap: 4,
  },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  segLabel: { fontSize: 12.5, fontWeight: '700', color: colors.inkSoft },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 13.5,
    color: colors.ink,
    minHeight: 70,
    textAlignVertical: 'top',
    marginTop: 6,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 20,
  },
  toggleTitle: { fontWeight: '700', fontSize: 13.5, color: colors.ink },
  toggleSub: { color: colors.inkSoft, fontSize: 11.5, marginTop: 2 },
  submitBtn: {
    backgroundColor: colors.teal500,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
