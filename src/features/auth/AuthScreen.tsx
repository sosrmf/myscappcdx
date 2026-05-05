import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  Body,
  Button,
  Card,
  Field,
  H1,
  H2,
  Input,
  Muted,
  Pill,
  Row,
  Screen,
  Small,
} from "../../components/ui";
import { colors, spacing } from "../../app/theme";
import { supabase, SUPABASE_CONFIGURED } from "../../data/supabase";
import { useAppStore } from "../../data/store";

export const AuthScreen: React.FC = () => {
  const nav = useNavigation();
  const syncFromCloud = useAppStore((s) => s.syncFromCloud);
  const syncToCloud = useAppStore((s) => s.syncToCloud);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!SUPABASE_CONFIGURED) {
    return (
      <Screen>
        <Small>SYNCHRONISATION CLOUD</Small>
        <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Sync cloud</H1>
        <Card>
          <Pill label="non configuré" color={colors.warning} />
          <H2 style={{ marginTop: spacing.sm }}>Supabase n'est pas configuré</H2>
          <Muted style={{ marginTop: spacing.sm }}>
            Pour activer la sauvegarde cloud, crée un projet Supabase, puis ajoute tes
            identifiants dans un fichier .env à la racine du projet :
          </Muted>
          <View
            style={{
              backgroundColor: colors.bgElev2,
              padding: spacing.md,
              borderRadius: 8,
              marginTop: spacing.md,
            }}
          >
            <Body style={{ fontFamily: "monospace" as any, color: colors.textMuted }}>
              EXPO_PUBLIC_SUPABASE_URL=...{"\n"}EXPO_PUBLIC_SUPABASE_ANON_KEY=...
            </Body>
          </View>
          <Muted style={{ marginTop: spacing.sm }}>
            Étapes détaillées dans README.md, section « Setup Supabase ».
          </Muted>
        </Card>
      </Screen>
    );
  }

  async function signIn() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return Alert.alert("Erreur", error.message);
    Alert.alert("Connecté", "Synchronisation en cours…");
    const ok = await syncFromCloud();
    if (!ok) await syncToCloud();
    nav.goBack();
  }

  async function signUp() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return Alert.alert("Erreur", error.message);
    Alert.alert(
      "Compte créé",
      "Vérifie ta boîte mail pour confirmer (selon réglages Supabase)."
    );
    // Push current local data so it's not lost
    await syncToCloud();
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    Alert.alert("Déconnecté", "Tes données locales sont conservées.");
  }

  if (user) {
    return (
      <Screen>
        <Small>SYNCHRONISATION CLOUD</Small>
        <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Sync cloud</H1>

        <Card glow={colors.success}>
          <Pill label="connecté" color={colors.success} />
          <H2 style={{ marginTop: spacing.sm }}>{user}</H2>
          <Muted style={{ marginTop: spacing.sm }}>
            Tes données sont synchronisées automatiquement.
          </Muted>
        </Card>

        <Card>
          <H2 style={{ marginBottom: spacing.sm }}>Synchronisation manuelle</H2>
          <Button
            label="Tirer du cloud (écrase le local)"
            variant="secondary"
            onPress={async () => {
              const ok = await syncFromCloud();
              Alert.alert(ok ? "Tiré" : "Erreur", ok ? "Données à jour." : "Connexion ?");
            }}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            label="Pousser vers le cloud"
            variant="secondary"
            onPress={async () => {
              await syncToCloud();
              Alert.alert("Poussé", "Cloud à jour.");
            }}
          />
        </Card>

        <Button label="Se déconnecter" variant="danger" onPress={signOut} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Small>SYNCHRONISATION CLOUD</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Sync cloud</H1>

      <Card>
        <Muted>
          Connecte-toi pour sauvegarder tes données dans le cloud (Supabase). Tes données
          locales sont conservées et fusionnées à la première connexion.
        </Muted>
      </Card>

      <Card>
        <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          <Button
            label="Connexion"
            variant={mode === "signin" ? "primary" : "secondary"}
            onPress={() => setMode("signin")}
            style={{ flex: 1 }}
          />
          <Button
            label="Créer un compte"
            variant={mode === "signup" ? "primary" : "secondary"}
            onPress={() => setMode("signup")}
            style={{ flex: 1 }}
          />
        </Row>

        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="toi@exemple.com"
          />
        </Field>
        <Field label="Mot de passe">
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="6 caractères minimum"
          />
        </Field>

        <Button
          label={busy ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
          onPress={mode === "signin" ? signIn : signUp}
          disabled={busy || !email || password.length < 6}
        />
      </Card>
    </Screen>
  );
};
