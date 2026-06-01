import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabeledInput } from '@/components/labeled-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/lib/profile-context';

export default function Onboarding() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to create your card.');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      Alert.alert('Check your email', 'That email address does not look right.');
      return;
    }
    try {
      setSaving(true);
      await setProfile({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      router.replace('/');
    } catch {
      setSaving(false);
      Alert.alert('Something went wrong', 'Could not save your card. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <ThemedView style={styles.header}>
              <ThemedText type="title">SANG</ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
                Create your card. We turn it into a QR code others can scan to save you.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.form}>
              <LabeledInput
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                autoCapitalize="words"
                autoFocus
                returnKeyType="next"
              />
              <LabeledInput
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555 123 4567"
                keyboardType="phone-pad"
              />
              <LabeledInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="jane@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </ThemedView>
          </ScrollView>

          <Pressable
            onPress={onContinue}
            disabled={saving}
            style={({ pressed }) => [styles.button, (pressed || saving) && styles.buttonPressed]}>
            <ThemedText type="default" style={styles.buttonText}>
              {saving ? 'Saving…' : 'Create my card'}
            </ThemedText>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four },
  scroll: { flexGrow: 1, justifyContent: 'center', gap: Spacing.five, paddingVertical: Spacing.five },
  header: { gap: Spacing.two, alignItems: 'flex-start' },
  subtitle: { lineHeight: 22 },
  form: { gap: Spacing.three },
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontWeight: '700' },
});
