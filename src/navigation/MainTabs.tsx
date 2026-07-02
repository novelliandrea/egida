// Le 4 schede in basso: Home, Mappa, Community, Profilo.
// Il pulsante SOS al centro NON è una vera scheda — è un bottone che, quando
// premuto, salta fuori dallo stack di navigazione e apre la schermata SOS
// sopra a tutto (vedi RootNavigator). Per questo usiamo un "tabBar"
// personalizzato invece di quello di default.

import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { MappaScreen } from '../screens/MappaScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfiloScreen } from '../screens/ProfiloScreen';
import { RootStackParamList } from './RootNavigator';

export type MainTabsParamList = {
  Home: undefined;
  Mappa: undefined;
  Community: undefined;
  Profilo: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<keyof MainTabsParamList, string> = {
  Home: '🏠',
  Mappa: '🗺️',
  Community: '🤝',
  Profilo: '👤',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Dividiamo le 4 schede in due gruppi: le prime due a sinistra del
  // pulsante SOS, le ultime due a destra — così il bottone rosso resta
  // sempre esattamente al centro della barra.
  const routes = state.routes;
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: (typeof routes)[number], index: number) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const label = route.name as keyof MainTabsParamList;

    return (
      <TouchableOpacity
        key={route.key}
        onPress={() => navigation.navigate(route.name as never)}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.tabIcon}>{TAB_ICONS[label]}</Text>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bar}>
      {left.map(renderTab)}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => rootNavigation.navigate('SOS')}
        accessibilityRole="button"
        accessibilityLabel="Attiva SOS, allerta i tuoi contatti fidati"
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
      {right.map(renderTab)}
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Mappa" component={MappaScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profilo" component={ProfiloScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: 18,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9fb0bb',
  },
  tabLabelActive: {
    color: colors.teal500,
  },
  sosButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.red,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sosText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
});
