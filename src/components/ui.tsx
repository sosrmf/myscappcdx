import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, font, radius, spacing } from "../app/theme";

export const Screen: React.FC<{
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
}> = ({ children, scroll = true, padded = true }) => {
  const inner = (
    <View style={[{ flex: 1 }, padded && { padding: spacing.lg }]}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={padded ? { padding: spacing.lg, paddingBottom: 80 } : { paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
};

export const Card: React.FC<ViewProps & { glow?: string }> = ({
  style,
  glow,
  children,
  ...rest
}) => (
  <View
    style={[
      {
        backgroundColor: colors.bgElev,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
      },
      glow ? { borderColor: glow + "55", shadowColor: glow } : null,
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);

export const H1: React.FC<TextProps> = ({ style, ...rest }) => (
  <Text
    style={[
      { color: colors.text, fontSize: font.title, fontWeight: "800", letterSpacing: 0.3 },
      style,
    ]}
    {...rest}
  />
);

export const H2: React.FC<TextProps> = ({ style, ...rest }) => (
  <Text
    style={[
      { color: colors.text, fontSize: font.h2, fontWeight: "700" },
      style,
    ]}
    {...rest}
  />
);

export const Body: React.FC<TextProps> = ({ style, ...rest }) => (
  <Text style={[{ color: colors.text, fontSize: font.body }, style]} {...rest} />
);

export const Muted: React.FC<TextProps> = ({ style, ...rest }) => (
  <Text
    style={[{ color: colors.textMuted, fontSize: font.small }, style]}
    {...rest}
  />
);

export const Small: React.FC<TextProps> = ({ style, ...rest }) => (
  <Text
    style={[{ color: colors.textDim, fontSize: font.tiny, letterSpacing: 0.4 }, style]}
    {...rest}
  />
);

export const Pill: React.FC<{
  label: string;
  color?: string;
  style?: ViewStyle;
}> = ({ label, color = colors.info, style }) => (
  <View
    style={[
      {
        backgroundColor: color + "22",
        borderColor: color + "55",
        borderWidth: 1,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: 3,
        alignSelf: "flex-start",
      },
      style,
    ]}
  >
    <Text style={{ color, fontSize: font.tiny, fontWeight: "700", letterSpacing: 0.5 }}>
      {label.toUpperCase()}
    </Text>
  </View>
);

export const Button: React.FC<{
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ label, onPress, variant = "primary", disabled, style }) => {
  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
      ? colors.danger
      : variant === "secondary"
      ? colors.bgElev2
      : "transparent";
  const fg = variant === "secondary" || variant === "ghost" ? colors.text : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: "center",
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: font.body }}>
        {label}
      </Text>
    </Pressable>
  );
};

export const Row: React.FC<ViewProps> = ({ style, children, ...rest }) => (
  <View
    style={[{ flexDirection: "row", alignItems: "center", gap: spacing.sm }, style]}
    {...rest}
  >
    {children}
  </View>
);

export const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, children, hint }) => (
  <View style={{ marginBottom: spacing.md }}>
    <Small style={{ marginBottom: 4 }}>{label.toUpperCase()}</Small>
    {children}
    {hint ? <Muted style={{ marginTop: 4 }}>{hint}</Muted> : null}
  </View>
);

export const Input: React.FC<TextInputProps> = ({ style, ...rest }) => (
  <TextInput
    placeholderTextColor={colors.textDim}
    style={[
      {
        backgroundColor: colors.bgElev2,
        color: colors.text,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: font.body,
      },
      style,
    ]}
    {...rest}
  />
);

export const Stepper: React.FC<{
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}> = ({ value, min = 0, max = 999, step = 1, onChange, suffix }) => (
  <Row>
    <Pressable
      onPress={() => onChange(Math.max(min, value - step))}
      style={styles.stepBtn}
    >
      <Text style={styles.stepBtnText}>-</Text>
    </Pressable>
    <View style={{ minWidth: 60, alignItems: "center" }}>
      <Body style={{ fontWeight: "700" }}>
        {value}
        {suffix ? ` ${suffix}` : ""}
      </Body>
    </View>
    <Pressable
      onPress={() => onChange(Math.min(max, value + step))}
      style={styles.stepBtn}
    >
      <Text style={styles.stepBtnText}>+</Text>
    </Pressable>
  </Row>
);

export const Segmented: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <Row
    style={{
      backgroundColor: colors.bgElev2,
      borderRadius: radius.md,
      padding: 3,
      gap: 0,
    }}
  >
    {options.map((o) => {
      const active = o.value === value;
      return (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          style={{
            flex: 1,
            paddingVertical: 8,
            alignItems: "center",
            borderRadius: radius.sm,
            backgroundColor: active ? colors.accent : "transparent",
          }}
        >
          <Text
            style={{
              color: active ? "#fff" : colors.textMuted,
              fontWeight: "700",
              fontSize: font.small,
            }}
          >
            {o.label}
          </Text>
        </Pressable>
      );
    })}
  </Row>
);

export const Checkbox: React.FC<{ checked: boolean; onPress: () => void }> = ({
  checked,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={10}
    style={{
      width: 26,
      height: 26,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: checked ? colors.accent : colors.border,
      backgroundColor: checked ? colors.accent : "transparent",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {checked ? (
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>✓</Text>
    ) : null}
  </Pressable>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({
  title,
  hint,
}) => (
  <View style={{ alignItems: "center", padding: spacing.xl }}>
    <H2 style={{ color: colors.textMuted, marginBottom: spacing.sm }}>{title}</H2>
    {hint ? <Muted style={{ textAlign: "center" }}>{hint}</Muted> : null}
  </View>
);

const styles = StyleSheet.create({
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgElev2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: colors.text, fontSize: 20, fontWeight: "700" },
});
