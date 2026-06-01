import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { addContact } from '@/lib/storage';
import { parseVCard } from '@/lib/vcard';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(true);
  // Locks out the burst of scan callbacks while we handle one result.
  const handling = useRef(false);

  // Re-arm the scanner every time the tab regains focus.
  useFocusEffect(
    useCallback(() => {
      handling.current = false;
      setActive(true);
      return () => {
        setActive(false);
      };
    }, []),
  );

  const onScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (handling.current) return;
      handling.current = true;
      setActive(false);

      const profile = parseVCard(data);
      if (!profile) {
        Alert.alert('Not a SANG card', 'That QR code is not a contact card.', [
          { text: 'Scan again', onPress: () => {
            handling.current = false;
            setActive(true);
          } },
        ]);
        return;
      }

      try {
        const list = await addContact(profile);
        const saved = list[0];
        router.push(`/contact/${saved.id}`);
      } catch {
        Alert.alert('Could not save', 'Something went wrong saving that contact.', [
          { text: 'OK', onPress: () => {
            handling.current = false;
            setActive(true);
          } },
        ]);
      }
    },
    [router],
  );

  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center}>
          <Ionicons name="camera-outline" size={48} color="#9a9aa0" />
          <ThemedText type="subtitle" style={styles.centerText}>
            Camera access needed
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            SANG uses the camera to scan a contact&apos;s QR code.
          </ThemedText>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <ThemedText type="default" style={styles.buttonText}>
              Grant camera access
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={active ? onScanned : undefined}
      />
      <SafeAreaView style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <ThemedText type="default" style={styles.hint}>
          {active ? 'Point at a SANG QR code' : 'Got it…'}
        </ThemedText>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  centerText: { textAlign: 'center' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.four },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: Spacing.four,
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
  buttonText: { color: '#ffffff', fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
