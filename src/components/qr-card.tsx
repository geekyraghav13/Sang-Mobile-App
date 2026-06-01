import { type ComponentRef, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { buildVCard } from '@/lib/vcard';
import { Profile } from '@/types';

type Props = {
  profile: Profile;
  size?: number;
};

/**
 * Renders the profile as a scannable vCard QR code on a white card. Wrapped in
 * ViewShot so the parent can capture it to an image for sharing. Always white
 * background + dark modules so the QR stays scannable in dark mode too.
 */
export const QRCard = forwardRef<ComponentRef<typeof ViewShot>, Props>(function QRCard(
  { profile, size = 240 },
  ref,
) {
  const value = buildVCard(profile);
  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 1 }} style={styles.shot}>
      <View style={styles.card}>
        <QRCode value={value} size={size} color="#0b0b0c" backgroundColor="#ffffff" />
        <ThemedText type="subtitle" style={styles.name}>
          {profile.name}
        </ThemedText>
        {!!profile.phone && (
          <ThemedText type="default" style={styles.detail}>
            {profile.phone}
          </ThemedText>
        )}
        {!!profile.email && (
          <ThemedText type="default" style={styles.detail}>
            {profile.email}
          </ThemedText>
        )}
        <ThemedText type="small" style={styles.brand}>
          SANG
        </ThemedText>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  shot: { alignSelf: 'center' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: { color: '#0b0b0c', textAlign: 'center', marginTop: Spacing.two, fontSize: 24, lineHeight: 30 },
  detail: { color: '#3a3a3c', textAlign: 'center', fontSize: 15, lineHeight: 20 },
  brand: { color: '#9a9aa0', letterSpacing: 4, marginTop: Spacing.one },
});
