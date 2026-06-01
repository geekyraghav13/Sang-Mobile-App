import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
};

/** A labelled text field that follows the app theme. */
export function LabeledInput({ label, style, ...rest }: Props) {
  const theme = useTheme();
  const scheme = theme.background === Colors.dark.background ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
    alignSelf: 'stretch',
  },
  input: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
});
