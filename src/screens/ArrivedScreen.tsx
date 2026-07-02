// "Bentornata a casa" — un pannello colorato scende dall'alto e copre TUTTO
// lo schermo (leggermente più alto dello schermo stesso, così anche il
// piccolo rimbalzo elastico dell'atterraggio non lascia mai uno spazio
// vuoto). Nessuna forma "ad acqua": la sensazione liquida viene dal
// movimento (Animated.spring, che rimbalza in modo naturale), non da una
// texture. Si chiude da sola dopo ~3 secondi o con "Continua".

import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 1.4;
const AUTO_CLOSE_MS = 3200;

export function ArrivedScreen() {
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(-PANEL_HEIGHT)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 9,
      tension: 50,
    }).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 400,
      delay: 350,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(handleClose, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    navigation.goBack();
  }

  return (
    <Animated.View
      style={[styles.panel, { transform: [{ translateY }] }]}
      pointerEvents="auto"
    >
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        <Text style={styles.check}>✅</Text>
        <Text style={styles.title}>Bentornata a casa!</Text>
        <Text style={styles.subtitle}>
          I tuoi contatti fidati sono stati avvisati che sei arrivata sana e
          salva.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleClose}>
          <Text style={styles.buttonText}>Continua</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -SCREEN_HEIGHT * 0.2,
    height: PANEL_HEIGHT,
    backgroundColor: colors.teal500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  check: { fontSize: 62, marginBottom: 18 },
  title: { fontSize: 25, fontWeight: '800', color: colors.white, marginBottom: 10 },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
    maxWidth: 260,
  },
  button: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  buttonText: { color: '#0d7a6c', fontWeight: '800', fontSize: 14 },
});
