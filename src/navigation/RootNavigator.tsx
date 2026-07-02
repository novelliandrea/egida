// Lo "Stack" principale dell'app. Contiene:
//  - MainTabs: le 4 schede in basso (Home, Mappa, Community, Profilo)
//  - Percorso: si apre sopra tutto quando premi "Torno a casa"
//  - SOS, FakeCall, Arrived: si aprono come schermate a comparsa (modali)
//  - ReportSheet: il modulo "Segnala una zona", aperto dalla Mappa
//
// Uno "Stack Navigator" impila le schermate una sopra l'altra, un po'
// come una pila di carte: navigation.navigate('SOS') mette SOS in cima,
// navigation.goBack() la toglie e torni a quella sotto.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { PercorsoScreen } from '../screens/PercorsoScreen';
import { SOSScreen } from '../screens/SOSScreen';
import { FakeCallScreen } from '../screens/FakeCallScreen';
import { ArrivedScreen } from '../screens/ArrivedScreen';
import { ReportSheetScreen } from '../screens/ReportSheetScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Percorso: undefined;
  SOS: undefined;
  FakeCall: undefined;
  Arrived: undefined;
  ReportSheet: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Percorso" component={PercorsoScreen} />
      <Stack.Screen
        name="SOS"
        component={SOSScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="FakeCall"
        component={FakeCallScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="Arrived"
        component={ArrivedScreen}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="ReportSheet"
        component={ReportSheetScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
