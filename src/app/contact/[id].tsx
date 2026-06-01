import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getContact, removeContact } from '@/lib/storage';
import { Contact } from '@/types';

type Palette = (typeof Colors)[keyof typeof Colors];

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const colors = theme.background === Colors.dark.background ? Colors.dark : Colors.light;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getContact(id)
        .then((c) => {
          if (!active) return;
          setContact(c);
          if (c?.name) navigation.setOptions({ title: c.name });
        })
        .finally(() => active && setLoaded(true));
      return () => {
        active = false;
      };
    }, [id, navigation]),
  );

  const open = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Unavailable', 'No app can handle that action.'));
  };

  const confirmDelete = () => {
    Alert.alert('Delete contact', 'Remove this contact from SANG?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeContact(id);
          router.back();
        },
      },
    ]);
  };

  if (!loaded) return <ThemedView style={styles.container} />;

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center} edges={['bottom']}>
          <ThemedText type="default" themeColor="textSecondary">
            This contact no longer exists.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
          <ThemedText type="title" style={styles.avatarText}>
            {(contact.name.trim()[0] ?? '?').toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.name}>
          {contact.name || 'Unnamed'}
        </ThemedText>

        <View style={styles.rows}>
          {!!contact.phone && (
            <DetailRow
              icon="call"
              label={contact.phone}
              colors={colors}
              onPress={() => open(`tel:${contact.phone}`)}
            />
          )}
          {!!contact.email && (
            <DetailRow
              icon="mail"
              label={contact.email}
              colors={colors}
              onPress={() => open(`mailto:${contact.email}`)}
            />
          )}
        </View>

        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
          <Ionicons name="trash-outline" size={18} color="#e5484d" />
          <ThemedText type="default" style={styles.deleteText}>
            Delete contact
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailRow({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: Palette;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: colors.backgroundElement }, pressed && styles.pressed]}>
      <Ionicons name={icon} size={20} color="#3c87f7" />
      <ThemedText type="default" style={styles.rowLabel}>
        {label}
      </ThemedText>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: Spacing.four, alignItems: 'center', gap: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  avatarText: { fontSize: 40, lineHeight: 48 },
  name: { textAlign: 'center' },
  rows: { alignSelf: 'stretch', gap: Spacing.two, marginTop: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowLabel: { flex: 1 },
  pressed: { opacity: 0.7 },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 'auto',
    paddingVertical: Spacing.three,
  },
  deleteText: { color: '#e5484d', fontWeight: '700' },
});
