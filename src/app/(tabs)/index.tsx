import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { type ComponentRef, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

import { LabeledInput } from '@/components/labeled-input';
import { QRCard } from '@/components/qr-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/lib/profile-context';

export default function MyCardScreen() {
  const { profile, setProfile } = useProfile();
  const shotRef = useRef<ComponentRef<typeof ViewShot>>(null);
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Local edit state, seeded from the saved profile when the editor opens.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!profile) return null; // gate in (tabs)/_layout handles the no-profile case

  const openEditor = () => {
    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email);
    setEditing(true);
  };

  const saveEdits = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      Alert.alert('Check your email', 'That email address does not look right.');
      return;
    }
    await setProfile({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    setEditing(false);
  };

  const shareQR = async () => {
    try {
      setSharing(true);
      const uri = await shotRef.current?.capture?.();
      if (!uri) throw new Error('capture failed');
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share my SANG card' });
    } catch {
      Alert.alert('Could not share', 'Something went wrong while exporting your QR code.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">My Card</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Let someone scan this with SANG to save you — or with any camera to add you as a contact.
          </ThemedText>

          <QRCard ref={shotRef} profile={profile} />

          {editing ? (
            <ThemedView style={styles.form}>
              <LabeledInput label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
              <LabeledInput
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <LabeledInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.row}>
                <Pressable
                  onPress={() => setEditing(false)}
                  style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.pressed]}>
                  <ThemedText type="default">Cancel</ThemedText>
                </Pressable>
                <Pressable
                  onPress={saveEdits}
                  style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}>
                  <ThemedText type="default" style={styles.btnPrimaryText}>
                    Save
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          ) : (
            <View style={styles.row}>
              <Pressable
                onPress={openEditor}
                style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.pressed]}>
                <Ionicons name="create-outline" size={18} color="#3c87f7" />
                <ThemedText type="default" style={styles.btnGhostText}>
                  Edit
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={shareQR}
                disabled={sharing}
                style={({ pressed }) => [styles.btn, styles.btnPrimary, (pressed || sharing) && styles.pressed]}>
                <Ionicons name="share-outline" size={18} color="#ffffff" />
                <ThemedText type="default" style={styles.btnPrimaryText}>
                  {sharing ? 'Sharing…' : 'Share'}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  form: { gap: Spacing.three, alignSelf: 'stretch' },
  row: { flexDirection: 'row', gap: Spacing.three, alignSelf: 'stretch' },
  btn: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  btnPrimary: { backgroundColor: '#3c87f7' },
  btnPrimaryText: { color: '#ffffff', fontWeight: '700' },
  btnGhost: { borderWidth: 1, borderColor: '#3c87f7' },
  btnGhostText: { color: '#3c87f7', fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
