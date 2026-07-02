// Finto Squillo — simula una chiamata in arrivo per aiutarti a uscire da
// una situazione scomoda. "Rifiuta" chiude subito; "Rispondi" per ora torna
// semplicemente alla Home (in futuro potrebbe far partire un audio finto).

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export function FakeCallScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.name}>Mamma</Text>
        <Text style={styles.sub}>Chiamata in arrivo…</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionCol}>
          <TouchableOpacity
            style={[styles.callBtn, styles.decline]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Rifiuta finto squillo"
          >
            <Text style={styles.callIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Rifiuta</Text>
        </View>
        <View style={styles.actionCol}>
          <TouchableOpacity
            style={[styles.callBtn, styles.accept]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Rispondi al finto squillo"
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Rispondi</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy900,
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  top: { alignItems: 'center', gap: 10 },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.teal500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 38, fontWeight: '800', color: colors.white },
  name: { fontSize: 21, fontWeight: '700', color: colors.white },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCol: { alignItems: 'center', gap: 6 },
  callBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decline: { backgroundColor: colors.red },
  accept: { backgroundColor: '#3cd66f' },
  callIcon: { fontSize: 23, color: colors.white },
  actionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
});
