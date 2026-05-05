import React, { useMemo, useState } from "react";
import { Alert, View } from "react-native";
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
import { colors, sessionTypeColor, spacing } from "../../app/theme";
import { todayISO, useAppStore } from "../../data/store";
import { RootStackParamList } from "../../app/navigation";
import { Exercise, ExerciseLog, SessionLog, SetLog } from "../../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, "LogSession">;

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
  const [duration, setDuration] = useState<string>(initial?.durationMin?.toString() ?? "");
  const [globalRpe, setGlobalRpe] = useState<number>(initial?.rpe ?? 7);
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

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
      const next: SessionLog = {
        ...prev,
        exercises: prev.exercises.map((e, ei) =>
          ei !== exIdx
            ? e
            : {
                ...e,
                sets: e.sets.map((s, si) => (si === setIdx ? { ...s, ...patch } : s)),
              }
        ),
      };
      return next;
    });
  }

  function save(completed: boolean) {
    if (!log) return;
    const final: SessionLog = {
      ...log,
      completed,
      durationMin: duration ? parseInt(duration, 10) || undefined : undefined,
      rpe: globalRpe,
      notes: notes || undefined,
    };
    upsertSessionLog(final);
    Alert.alert(
      completed ? "Séance enregistrée" : "Brouillon enregistré",
      completed ? "Bon boulot." : "Tu pourras la finaliser plus tard."
    );
    nav.goBack();
  }

  // Build flat list with block headers
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

  return (
    <Screen>
      <Pill label={session.type} color={sessionTypeColor(session.type)} />
      <H1 style={{ marginTop: spacing.sm }}>{session.title}</H1>
      <Muted style={{ marginBottom: spacing.lg }}>{session.focus}</Muted>

      {items.map((item, i) =>
        item.kind === "block" ? (
          <View key={`b_${i}`} style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
            <Small>{item.type.toUpperCase()}</Small>
            <H2>{item.title}</H2>
          </View>
        ) : (
          <Card key={`e_${i}`}>
            <Row style={{ justifyContent: "space-between" }}>
              <Body style={{ fontWeight: "700", flex: 1 }}>{item.exercise.name}</Body>
              <Small>
                {item.exercise.sets}×{item.exercise.reps}
              </Small>
            </Row>
            {item.exercise.loadHint ? (
              <Muted style={{ marginTop: 2 }}>Cible : {item.exercise.loadHint}</Muted>
            ) : null}

            <View style={{ marginTop: spacing.sm }}>
              {log.exercises[item.logIndex]?.sets.map((s, si) => (
                <Row
                  key={si}
                  style={{
                    paddingVertical: 6,
                    borderTopWidth: si === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                    gap: spacing.sm,
                  }}
                >
                  <Small style={{ width: 28 }}>S{si + 1}</Small>
                  <Input
                    value={s.reps?.toString() ?? ""}
                    onChangeText={(t) =>
                      updateSet(item.logIndex, si, {
                        reps: t ? parseInt(t, 10) || undefined : undefined,
                      })
                    }
                    placeholder="reps"
                    keyboardType="number-pad"
                    style={{ flex: 1 }}
                  />
                  <Input
                    value={s.load?.toString() ?? ""}
                    onChangeText={(t) =>
                      updateSet(item.logIndex, si, {
                        load: t ? parseFloat(t) || undefined : undefined,
                      })
                    }
                    placeholder="kg"
                    keyboardType="decimal-pad"
                    style={{ flex: 1 }}
                  />
                  <Input
                    value={s.rpe?.toString() ?? ""}
                    onChangeText={(t) =>
                      updateSet(item.logIndex, si, {
                        rpe: t ? parseInt(t, 10) || undefined : undefined,
                      })
                    }
                    placeholder="RPE"
                    keyboardType="number-pad"
                    style={{ width: 60 }}
                  />
                  <Checkbox
                    checked={s.done}
                    onPress={() => updateSet(item.logIndex, si, { done: !s.done })}
                  />
                </Row>
              ))}
            </View>
          </Card>
        )
      )}

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Bilan séance</H2>
        <Field label="Durée (min)">
          <Input
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder={session.durationMin.toString()}
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

      <Row style={{ gap: spacing.sm }}>
        <Button label="Brouillon" variant="secondary" onPress={() => save(false)} style={{ flex: 1 }} />
        <Button label="Terminer" onPress={() => save(true)} style={{ flex: 1 }} />
      </Row>
    </Screen>
  );
};
