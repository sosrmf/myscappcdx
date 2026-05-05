# JJB Prep — App de préparation physique grappling

Application mobile (React Native + Expo) de préparation physique orientée **JJB / grappling**, suivi de séances, conditioning, readiness, et coaching simple.

## Ce que fait l'app

- **Programme 12 semaines** structuré en 3 phases :
  - Phase 1 : base aérobie + force générale
  - Phase 2 : force maximale + threshold
  - Phase 3 : puissance + cardiac power
- **Planning JJB flexible** : tu choisis tes jours et heures de JJB, l'app réorganise automatiquement S&C, conditioning et récupération autour.
- **Détail de séance** complet (warmup, plyo, strength, accessoires, correctif, conditioning).
- **Logging riche** : reps, charge, RPE, notes, douleur — par série.
- **Check-in quotidien** : poids, sommeil, fatigue, énergie, soreness, **bas du dos (visible)**, motivation.
- **Guidance** automatique : push / normal / charge réduite / récupération / prudence — basée sur tes données.
- **Conditioning** : Z2, threshold, intervalles, cardiac power, JJB, etc., avec total hebdo et répartition par type.
- **Suivi physique** : poids, tour de taille, courbe de tendance.
- **Analytics** : volume hebdo, complétion, top exercices, tendance poids / readiness / bas du dos.
- **Persistance locale** (AsyncStorage) — pas besoin de compte, tout reste sur le téléphone.

## Stack technique

- **React Native 0.81 + Expo 54** (Android-first, fonctionne aussi iOS / Web)
- **TypeScript strict**
- **React Navigation 7** (bottom tabs + native stack)
- **Zustand + persist** (état + persistance AsyncStorage)
- **react-native-svg** pour les graphes (sparklines, barres)
- Architecture par **features** (`src/features/<feature>/...`)

```
src/
  app/         # navigation, theme
  components/  # ui kit (Card, Button, Input, Sparkline…)
  data/        # types, store, scheduler, coaching, analytics, demo
  features/    # home, plan, log, stats, settings, checkin, conditioning, body
```

## Lancer le projet

```bash
npm install
npm run start        # ouvre Expo Dev Tools
npm run android      # lance sur émulateur / appareil Android
```

Sur ton téléphone Android : installe **Expo Go**, scanne le QR code affiché par `npm run start`.

## Build Android (APK)

```bash
npm install -g eas-cli
eas login
eas build:configure          # une seule fois
eas build -p android --profile preview
```

`preview` produit un **APK** installable directement (sans Play Store). Le profil `production` produit un AAB pour le Play Store.

Build local (sans EAS, plus avancé) :

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# APK : android/app/build/outputs/apk/release/app-release.apk
```

## Coaching — comment c'est calculé

Heuristiques transparentes (pas un système médical) :

- `caution` si **bas du dos ≥ 5/10** → évite hinge lourd.
- `recovery_focus` si fatigue élevée **et** énergie basse.
- `reduced_load` si fatigue OU énergie problématique.
- `push` si bon sommeil + énergie haute + motivation haute.
- `normal` sinon.

Drapeaux additionnels : adhérence (séances ratées), conditioning bas (< 60 min/semaine).

## Moteur de planning

Donné dans `src/data/scheduler.ts`. Règles :

1. JJB est fixe (input utilisateur).
2. Séance S&C principale → jour le plus loin possible des JJB.
3. Threshold / intervalles → évite la veille d'un JJB du soir.
4. Récupération / mobilité → proche d'un JJB pour soutenir la récupération.
5. Mode prudence bas du dos → S&C secondaire est un bloc hip-thrust + carries plutôt que RDL lourd.

## Données de démo

Au premier lancement : programme complet 12 semaines, 14 jours de check-ins réalistes, séances et conditioning d'exemple. Tu peux **réinjecter** ou **effacer** dans Réglages → Données.

## Roadmap V2 possible

- Sync cloud (Supabase / Firebase)
- Photos de progression
- Intégration cardiofréquencemètre (Polar / Garmin)
- Vidéos d'exercices
- Templates communautaires
- Export CSV
