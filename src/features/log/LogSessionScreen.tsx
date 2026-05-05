import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Body,
  Button,
  Card,
  Checkbox,
  Field,
  H1,
  H2,
  Input,
  Muted,
  Pill,
  Row,
  Screen,
  Small,
  Stepper,
} from "../../components/ui";
import { RestTimer } from "../../components/RestTimer";
import { colors, font, sessionTypeColor, spacing } from "../../app/theme";
import { todayISO, useAppStore } from "../../data/store";
import { RootStackParamList } from "../../app/navigation";
import { Exercise, ExerciseLog, SessionLog, SetLog } from "../../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, "LogSession">;

function parseRestSeconds(rest?: string): number {
  if (!rest) return 90;
  const m = rest.match(/(\d+)\s*(min|m|s)/i);
  if (!m) return 90;
  const n = parseInt(m[1], 10);
  return m[2].toLowerCase().startsWith("m") ? n * 60 : n;
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function buildInitialLog(
  exercises: Exercise[],
  sessionId: string,
  sessionTitle: string,
  type: SessionLog["type"]
): SessionLog {
  return {
    id: `log_${sessionId}_${todayISO()}`,
    date: todayISO(),
    sessionId,
    sessionTitle,
    type,
    completed: false,
    exercises: exercises.map<ExerciseLog>((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({ done: false } as SetLog)),
    })),
  };
}

export const LogSessionScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { phaseIdx, weekIdx, weekday } = route.params;

  const program = useAppStore((s) => s.program);
  const upsertSessionLog = useAppStore((s) => s.upsertSessionLog);
  const existingLogs = useAppStore((s) => s.sessionLogs);

  const session = program.phases[phaseIdx]?.weeks[weekIdx]?.days.find(
    (d) => d.weekday === weekday
  )?.session;

  const allExercises = useMemo(
    () => session?.blocks.flatMap((b) => b.exercises) ?? [],
    [session]
  );

  const initial = useMemo(() => {
    if (!session) return null;
    const candidate = `log_${session.id}_${todayISO()}`;
    const existing = existingLogs.find((l) => l.id === candidate);
    if (existing) return existing;
    return buildInitialLog(allExercises, session.id, session.title, session.type);
  }, [session, allExercises, existingLogs]);

  const [log, setLog] = useState<SessionLog | null>(initial);
  const [duration, setDuration] = useState<string>(
    initial?.durationMin?.toString() ?? ""
  );
  const [globalRpe, setGlobalRpe] = useState<number>(initial?.rpe ?? 7);
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  // Session elapsed timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current != null) clearInterval(timerRef.current); };
  }, []);

  // Rest timer state
  const [restVisible, setRestVisible] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);

  if (!session || !log) {
    return (
      <Screen>
        <H1>Séance introuvable</H1>
      </Screen>
    );
  }

  function updateSet(exIdx: number, setIdx: number, patch: Partial<SetLog>) {
    setLog((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((e, ei) =>
          ei !== exIdx
            ? e
            : {
                ...e,
                sets: e.sets.map((s, si) =>
                  si === setIdx ? { ...s, ...patch } : s
                ),
              }
        ),
      };
    });
  }

  function handleSetToggle(
    exIdx: number,
    setIdx: number,
    currentDone: boolean,
    exercise: Exercise
  ) {
    updateSet(exIdx, setIdx, { done: !currentDone });
    if (!currentDone) {
      const secs = parseRestSeconds(exercise.rest);
      setRestSeconds(secs);
      setRestVisible(true);
    }
  }

  function save(completed: boolean) {
    if (!log) return;
    if (timerRef.current != null) clearInterval(timerRef.current);
    const finalDuration = duration
      ? parseInt(duration, 10) || undefined
      : elapsed > 0
      ? Math.round(elapsed / 60)
      : undefined;
    const final: SessionLog = {
      ...log,
      completed,
      durationMin: finalDuration,
      rpe: globalRpe,
      notes: notes || undefined,
    };
    upsertSessionLog(final);
    Alert.alert(
      completed ? "Séance enregistrée ✓" : "Brouillon enregistré",
      completed ? "Bien joué." : "Tu pourras la finaliser plus tard."
    );
    nav.goBack();
  }

  // Build flat item list with block headers
  const items: Array<
    | { kind: "block"; title: string; type: string }
    | { kind: "exercise"; exercise: Exercise; logIndex: number }
  > = [];
  let logIdx = 0;
  for (const block of session.blocks) {
    items.push({ kind: "block", title: block.title, type: block.type });
    for (const ex of block.exercises) {
      items.push({ kind: "exercise", exercise: ex, logIndex: logIdx });
      logIdx++;
    }
  }

  const typeColor = sessionTypeColor(session.type);

  return (
    <>
      <Screen>
        {/* Header row: pill + elapsed timer */}
        <Row style={{ justifyContent: "space-between", marginBottom: spacing.sm }}>
          <Pill label={session.type} color={typeColor} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.bgElev2,
              borderRadius: 99,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 6,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.success,
              }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: font.body,
                fontWeight: "800",
                fontVariant: ["tabular-nums"],
                letterSpacing: 1,
              }}
            >
              {formatElapsed(elapsed)}
            </Text>
          </View>
        </Row>

        <H1 style={{ marginBottom: 2 }}>{session.title}</H1>
        <Muted style={{ marginBottom: spacing.lg }}>{session.focus}</Muted>

        {items.map((item, i) =>
          item.kind === "block" ? (
            <View
              key={`b_${i}`}
              style={{ marginTop: spacing.md, marginBottom: spacing.xs }}
            >
              <Small style={{ color: typeColor }}>{item.type}</Small>
              <H2 style={{ marginTop: 2 }}>{item.title}</H2>
            </View>
          ) : (
            <Card key={`e_${i}`}>
              <Row style={{ justifyContent: "space-between", marginBottom: spacing.xs }}>
                <Body style={{ fontWeight: "700", flex: 1 }}>
                  {item.exercise.name}
                </Body>
                {/* History shortcut */}
                <Pressable
                  onPress={() =>
                    nav.navigate("ExerciseHistory", {
                      exerciseName: item.exercise.name,
                    })
                  }
                  hitSlop={8}
                  style={{
                    backgroundColor: colors.bgElev2,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginLeft: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: font.tiny,
                      fontWeight: "800",
                      letterSpacing: 0.5,
                    }}
                  >
                    HIST
                  </Text>
                </Pressable>
              </Row>

              <Row style={{ marginBottom: spacing.sm, gap: spacing.md }}>
                <Small>
                  {item.exercise.sets} séries × {item.exercise.reps}
                </Small>
                {item.exercise.loadHint ? (
                  <Small style={{ color: colors.accent }}>
                    {item.exercise.loadHint}
                  </Small>
                ) : null}
                {item.exercise.rest ? (
                  <Small style={{ color: colors.textMuted }}>
                    repos {item.exercise.rest}
                  </Small>
                ) : null}
              </Row>

              <View>
                {/* Column headers */}
                <Row
                  style={{
                    paddingBottom: spacing.xs,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    gap: spacing.sm,
                  }}
                >
                  <Small style={{ width: 28 }}>#</Small>
                  <Small style={{ flex: 1, textAlign: "center" }}>Reps</Small>
                  <Small style={{ flex: 1, textAlign: "center" }}>kg</Small>
                  <Small style={{ width: 60, textAlign: "center" }}>RPE</Small>
                  <View style={{ width: 28 }} />
                </Row>

                {log.exercises[item.logIndex]?.sets.map((s, si) => (
                  <Row
                    key={si}
                    style={{
                      paddingVertical: 7,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      gap: spacing.sm,
                      opacity: s.done ? 0.55 : 1,
                    }}
                  >
                    <Small
                      style={{
                        width: 28,
                        color: s.done ? colors.accent : colors.textDim,
                        fontWeight: s.done ? "900" : "400",
                      }}
                    >
                      {si + 1}
                    </Small>
                    <Input
                      value={s.reps?.toString() ?? ""}
                      onChangeText={(t) =>
                        updateSet(item.logIndex, si, {
                          reps: t ? parseInt(t, 10) || undefined : undefined,
                        })
                      }
                      placeholder="—"
                      keyboardType="number-pad"
                      style={{ flex: 1, textAlign: "center" }}
                    />
                    <Input
                      value={s.load?.toString() ?? ""}
                      onChangeText={(t) =>
                        updateSet(item.logIndex, si, {
                          load: t ? parseFloat(t) || undefined : undefined,
                        })
                      }
                      placeholder="—"
                      keyboardType="decimal-pad"
                      style={{ flex: 1, textAlign: "center" }}
                    />
                    <Input
                      value={s.rpe?.toString() ?? ""}
                      onChangeText={(t) =>
                        updateSet(item.logIndex, si, {
                          rpe: t ? parseInt(t, 10) || undefined : undefined,
                        })
                      }
                      placeholder="—"
                      keyboardType="number-pad"
                      style={{ width: 60, textAlign: "center" }}
                    />
                    <Checkbox
                      checked={s.done}
                      onPress={() =>
                        handleSetToggle(
                          item.logIndex,
                          si,
                          s.done,
                          item.exercise
                        )
                      }
                    />
                  </Row>
                ))}
              </View>
            </Card>
          )
        )}

        {/* Session summary */}
        <Card style={{ marginTop: spacing.sm }}>
          <H2 style={{ marginBottom: spacing.md }}>Bilan séance</H2>
          <Field label="Durée (min)">
            <Input
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder={
                elapsed > 0
                  ? Math.round(elapsed / 60).toString()
                  : session.durationMin.toString()
              }
            />
          </Field>
          <Field label="RPE global">
            <Stepper value={globalRpe} min={1} max={10} onChange={setGlobalRpe} />
          </Field>
          <Field label="Notes">
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Sensations, douleur, technique…"
              multiline
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </Field>
        </Card>

        <Row style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Button
            label="Brouillon"
            variant="secondary"
            onPress={() => save(false)}
            style={{ flex: 1 }}
          />
          <Button
            label="Terminer"
            onPress={() => save(true)}
            style={{ flex: 1 }}
          />
        </Row>
      </Screen>

      <RestTimer
        visible={restVisible}
        defaultSeconds={restSeconds}
        onDismiss={() => setRestVisible(false)}
      />
    </>
  );
};
