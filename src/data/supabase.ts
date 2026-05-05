// Supabase client — optionnel.
// Si EXPO_PUBLIC_SUPABASE_URL n'est pas défini, l'app reste 100% local-first.

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = SUPABASE_CONFIGURED
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage as unknown as Storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
