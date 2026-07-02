// Schermata Profilo. I contatti fidati sono letti da Supabase; punti/badge
// sono ancora statici finché non aggiungiamo login (senza sapere "chi sei",
// non possiamo salvare punti che appartengono solo a te).

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme/colors';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TrustedContact } from '../types';

export function ProfiloScreen() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) return;
      const { data, error } = await supabase
        .from('trusted_contacts')
        .select('*');
      if (!error) setContacts(data ?? []);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profilo</Text>

        <View style={styles.profileHead}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Giulia Conti</Text>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>🏅 Livello 3 · Guardiana</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>845</Text>
            <Text style={styles.statLabel}>Punti</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>32</Text>
            <Text style={styles.statLabel}>Percorsi</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>9</Text>
            <Text style={styles.statLabel}>Segnalazioni</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CONTATTI FIDATI</Text>
        {!isSupabaseConfigured && (
          <Text style={styles.emptyState}>
            Collega Supabase per gestire qui i tuoi contatti fidati reali.
          </Text>
        )}
        {isSupabaseConfigured && contacts.length === 0 && (
          <Text style={styles.emptyState}>Nessun contatto fidato ancora.</Text>
        )}
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>
                {contact.full_name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.contactName}>{contact.full_name}</Text>
              {contact.role ? (
                <Text style={styles.contactRole}>{contact.role}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  profileHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.teal500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 20 },
  profileName: { fontSize: 16.5, fontWeight: '700', color: colors.ink },
  levelPill: {
    backgroundColor: colors.teal050,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  levelPillText: { color: '#0d7a6c', fontWeight: '700', fontSize: 11.5 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    marginBottom: 20,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statNum: { fontSize: 16, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 10, color: colors.inkSoft, marginTop: 2 },
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 10,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: { color: colors.white, fontWeight: '700', fontSize: 11 },
  contactName: { fontWeight: '700', fontSize: 12.5, color: colors.ink },
  contactRole: { fontSize: 10.5, color: colors.inkSoft },
});
