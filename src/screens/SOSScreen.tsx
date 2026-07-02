// Schermata SOS — si apre sopra a tutto quando premi il pulsante rosso
// nella barra in basso. Parte un conto alla rovescia annullabile; se arriva
// a zero, mostriamo cosa è stato "inviato" (in questa versione è solo
// simulato — collegare l'invio reale di posizione/SMS è un passo successivo
// che richiede i permessi di localizzazione e un modo per contattare le
// persone, es. Twilio o le API di messaggistica del telefono).

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const COUNTDOWN_SECONDS = 5;

export function SOSScreen() {
  const navigation = useNavigation();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [sent, setSent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setSent(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleCancel() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen}>
      {!sent ? (
        <View style={styles.center}>
          <View style={styles.ring}>
            <Text style={styles.countdownNum}>{secondsLeft}</Text>
          </View>
          <Text style={styles.title}>Stai inviando un SOS</Text>
          <Text style={styles.subtitle}>
            Posizione, orario e ultimo percorso saranno inviati ai tuoi
            contatti fidati tra pochi secondi.
          </Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Annulla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.title}>Allerta inviata</Text>
          <Text style={styles.subtitle}>
            I tuoi contatti fidati sono stati avvisati.
          </Text>
          <View style={styles.sentList}>
            <Text style={styles.sentItem}>📍 Posizione GPS condivisa</Text>
            <Text style={styles.sentItem}>🕘 Orario invio registrato</Text>
            <Text style={styles.sentItem}>🧭 Ultimo percorso allegato</Text>
          </View>
          <TouchableOpacity style={styles.emergencyBtn}>
            <Text style={styles.emergencyBtnText}>📞 Chiama il 112</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeBtnText}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2a0f12' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  countdownNum: { fontSize: 50, fontWeight: '800', color: colors.white },
  title: { color: colors.white, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 260,
  },
  cancelBtn: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 38,
  },
  cancelBtnText: { color: colors.red, fontWeight: '800', fontSize: 14.5 },
  sentList: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  sentItem: { color: colors.white, fontSize: 12.5, paddingVertical: 4 },
  emergencyBtn: {
    backgroundColor: colors.red,
    borderRadius: 16,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  closeBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  closeBtnText: { color: colors.white, fontWeight: '700', fontSize: 12.5 },
});
