import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigation } from "./src/app/navigation";
import { supabase } from "./src/data/supabase";
import { useAppStore } from "./src/data/store";

export default function App() {
  const syncFromCloud = useAppStore((s) => s.syncFromCloud);

  useEffect(() => {
    if (!supabase) return;
    // If user is already signed in, pull latest data on startup
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        void syncFromCloud().catch(() => undefined);
      }
    });
  }, [syncFromCloud]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
