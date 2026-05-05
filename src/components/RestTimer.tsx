import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors, font, spacing } from "../app/theme";

const PRESETS = [60, 90, 120, 180];
const R = 64;
const CX = 80;
const CY = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;

function presetLabel(s: number): string {
  if (s < 60) return `${s}s`;
  if (s === 60) return "1 min";
  if (s === 90) return "1:30";
  if (s === 120) return "2 min";
  return "3 min";
}

interface Props {
  visible: boolean;
  defaultSeconds?: number;
  onDismiss: () => void;
}

export const RestTimer: React.FC<Props> = ({
  visible,
  defaultSeconds = 90,
  onDismiss,
}) => {
  const [total, setTotal] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset & start when opened
  useEffect(() => {
    if (visible) {
      setTotal(defaultSeconds);
      setRemaining(defaultSeconds);
      setRunning(true);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
    }
  }, [visible, defaultSeconds]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running || !visible) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, visible]);

  function selectPreset(s: number) {
    setTotal(s);
    setRemaining(s);
    setRunning(true);
  }

  const progress = total > 0 ? remaining / total : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const done = remaining === 0;
  const ringColor = done ? colors.success : colors.accent;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeLabel =
    mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${remaining}`;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "#000000bb",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={onDismiss}
      >
        <Pressable
          style={{
            backgroundColor: colors.bgElev,
            borderRadius: 28,
            padding: spacing.xl,
            alignItems: "center",
            width: 300,
            borderWidth: 1,
            borderColor: colors.borderStrong,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Label */}
          <Text
            style={{
              color: colors.textMuted,
              fontSize: font.tiny,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: spacing.lg,
            }}
          >
            Repos
          </Text>

          {/* Ring */}
          <View style={{ width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
            <Svg width={160} height={160} style={{ position: "absolute" }}>
              {/* Track */}
              <Circle
                cx={CX}
                cy={CY}
                r={R}
                stroke={colors.bgElev2}
                strokeWidth={9}
                fill="none"
              />
              {/* Progress arc */}
              <Circle
                cx={CX}
                cy={CY}
                r={R}
                stroke={ringColor}
                strokeWidth={9}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${CX}, ${CY}`}
              />
            </Svg>
            {/* Center text */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: done ? colors.success : colors.text,
                  fontSize: done ? 36 : 44,
                  fontWeight: "800",
                  letterSpacing: -1,
                }}
              >
                {done ? "GO" : timeLabel}
              </Text>
              {!done && (
                <Text
                  style={{
                    color: colors.textDim,
                    fontSize: font.tiny,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {mins > 0 ? "min" : "sec"}
                </Text>
              )}
            </View>
          </View>

          {/* Preset buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              marginTop: spacing.xl,
              marginBottom: spacing.md,
            }}
          >
            {PRESETS.map((s) => {
              const active = total === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => selectPreset(s)}
                  style={{
                    backgroundColor: active ? colors.accent + "22" : colors.bgElev2,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.accent : colors.textMuted,
                      fontSize: font.tiny,
                      fontWeight: "800",
                      letterSpacing: 0.5,
                    }}
                  >
                    {presetLabel(s)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dismiss */}
          <Pressable
            onPress={onDismiss}
            style={{
              marginTop: spacing.sm,
              paddingVertical: 12,
              paddingHorizontal: 40,
              backgroundColor: done ? colors.accent : colors.bgElev2,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: done ? colors.accent : colors.borderStrong,
            }}
          >
            <Text
              style={{
                color: done ? "#000" : colors.text,
                fontWeight: "800",
                fontSize: font.body,
              }}
            >
              {done ? "C'est parti !" : "Passer"}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
