import React, { useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  Body,
  Button,
  Card,
  Field,
  H1,
  H2,
  Muted,
  Row,
  Screen,
  Segmented,
  Small,
  Stepper,
} from "../../components/ui";
import { colors, spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import { buildWeeklyPlan, WEEKDAYS, WEEKDAYS_FULL } from "../../data/scheduler";
import { DayPart, JJBSlot, Weekday } from "../../data/types";

export const ScheduleSettingsScreen: React.FC = () => {
  const nav = useNavigation();
  const schedule = useAppStore((s) => s.settings.schedule);
  const updateSchedule = useAppStore((s) => s.updateSchedule);

  const [slots, setSlots] = useState<JJBSlot[]>(schedule.jjbSlots);
  const [scCount, setScCount] = useState(schedule.scStrengthCount);
  const [condCount, setCondCount] = useState(schedule.conditioningCount);
  const [recCount, setRecCount] = useState(schedule.recoveryCount);
  const [lowBack, setLowBack] = useState(schedule.lowBackCaution);

  function toggleDay(d: Weekday) {
    setSlots((prev) => {
      const has = prev.find((s) => s.weekday === d);
      if (has) return prev.filter((s) => s.weekday !== d);
      return [...prev, { weekday: d, dayPart: "evening" }];
    });
  }

  function setDayPart(d: Weekday, part: DayPart) {
    setSlots((prev) => prev.map((s) => (s.weekday === d ? { ...s, dayPart: part } : s)));
  }

  const preview = useMemo(
    () =>
      buildWeeklyPlan({
        jjbSlots: slots,
        scStrengthCount: scCount,
        conditioningCount: condCount,
        recoveryCount: recCount,
        lowBackCaution: lowBack,
      }),
    [slots, scCount, condCount, recCount, lowBack]
  );

  function save() {
    if (slots.length === 0) {
      Alert.alert("Au moins un JJB", "Sélectionne au moins un jour de JJB.");
      return;
    }
    updateSchedule({
      jjbSlots: slots,
      scStrengthCount: scCount,
      conditioningCount: condCount,
      recoveryCount: recCount,
      lowBackCaution: lowBack,
    });
    Alert.alert("Planning mis à jour", "Le programme a été réorganisé.");
    nav.goBack();
  }

  return (
    <Screen>
      <Small>PLANNING</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Configurer la semaine</H1>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Jours de JJB</H2>
        <Muted style={{ marginBottom: spacing.md }}>
          Touche les jours où tu fais du JJB. Choisis ensuite le moment de la journée pour chacun.
        </Muted>
        <Row style={{ flexWrap: "wrap", gap: spacing.sm }}>
          {([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((d) => {
            const active = !!slots.find((s) => s.weekday === d);
            return (
              <Pressable
                key={d}
                onPress={() => toggleDay(d)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: active ? colors.jjb : colors.bgElev2,
                  borderWidth: 1,
                  borderColor: active ? colors.jjb : colors.border,
                }}
              >
                <Body style={{ color: active ? "#fff" : colors.textMuted, fontWeight: "700" }}>
                  {WEEKDAYS[d]}
                </Body>
              </Pressable>
            );
          })}
        </Row>

        <View style={{ marginTop: spacing.md }}>
          {slots.map((s) => (
            <View key={s.weekday} style={{ marginBottom: spacing.sm }}>
              <Small>{WEEKDAYS_FULL[s.weekday].toUpperCase()}</Small>
              <Segmented
                options={[
                  { value: "morning", label: "Matin" },
                  { value: "midday", label: "Midi" },
                  { value: "evening", label: "Soir" },
                ]}
                value={s.dayPart}
                onChange={(v) => setDayPart(s.weekday, v as DayPart)}
              />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Volume hebdomadaire</H2>
        <Field label="Séances de force / S&C">
          <Stepper value={scCount} min={0} max={4} onChange={setScCount} />
        </Field>
        <Field label="Séances de conditioning">
          <Stepper value={condCount} min={0} max={4} onChange={setCondCount} />
        </Field>
        <Field label="Séances de récupération / mobilité">
          <Stepper value={recCount} min={0} max={3} onChange={setRecCount} />
        </Field>
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Bas du dos</H2>
        <Segmented
          options={[
            { value: "on", label: "Prudence activée" },
            { value: "off", label: "Désactivée" },
          ]}
          value={lowBack ? "on" : "off"}
          onChange={(v) => setLowBack(v === "on")}
        />
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Aperçu de la semaine</H2>
        {preview.map((p) => (
          <Row
            key={p.weekday}
            style={{
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: spacing.md,
            }}
          >
            <Small style={{ width: 36 }}>{WEEKDAYS[p.weekday]}</Small>
            <View style={{ flex: 1 }}>
              <Body>{p.label}</Body>
              <Muted>{p.reason}</Muted>
            </View>
          </Row>
        ))}
      </Card>

      <Button label="Enregistrer le planning" onPress={save} />
    </Screen>
  );
};
