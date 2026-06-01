import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { getContacts } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';
import { Contact } from '@/types';

export default function ContactsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme.background === Colors.dark.background ? Colors.dark : Colors.light;
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Reload whenever the tab gains focus (a new scan may have been added).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getContacts().then((list) => active && setContacts(list));
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ThemedText type="subtitle" style={styles.heading}>
          Contacts
        </ThemedText>
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={contacts.length === 0 ? styles.emptyWrap : styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                No contacts yet. Scan someone&apos;s SANG QR code to save them here.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/contact/${item.id}`)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
                <ThemedText type="default" style={styles.avatarText}>
                  {(item.name.trim()[0] ?? '?').toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.rowText}>
                <ThemedText type="default" numberOfLines={1}>
                  {item.name || 'Unnamed'}
                </ThemedText>
                {!!(item.phone || item.email) && (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {item.phone || item.email}
                  </ThemedText>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  heading: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  listContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },
  empty: { alignItems: 'center', gap: Spacing.three },
  emptyText: { textAlign: 'center', maxWidth: 260 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: { opacity: 0.7 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', fontSize: 18 },
  rowText: { flex: 1, gap: 2 },
});
