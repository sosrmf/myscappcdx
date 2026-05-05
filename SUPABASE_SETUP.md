# Setup Supabase — guide débutant

Pas-à-pas pour activer la sauvegarde cloud de l'app. ~10 minutes.

---

## 1. Créer un compte Supabase (gratuit)

1. Va sur **https://supabase.com**
2. Clique **"Start your project"** → connecte-toi avec GitHub (ton compte `sosrmf`)
3. Tu arrives sur le **Dashboard**

---

## 2. Créer un projet

1. Clique **"New project"**
2. Remplis :
   - **Name** : `jjb-prep` (ou ce que tu veux)
   - **Database Password** : génère un mot de passe fort, **note-le quelque part** (tu n'en auras pas besoin tout de suite mais ne le perds pas)
   - **Region** : `Europe (Frankfurt)` ou `Paris` — le plus proche de toi
   - **Plan** : `Free` (largement suffisant : 500 Mo, 50k utilisateurs/mois)
3. Clique **"Create new project"**
4. Attends ~2 minutes que le projet se provisionne ☕

---

## 3. Exécuter le schéma SQL

C'est ici qu'on crée les tables qui vont stocker tes données.

1. Dans le menu de gauche du dashboard Supabase : clique **SQL Editor**
2. Clique **"+ New query"**
3. Ouvre le fichier `supabase/schema.sql` dans ton repo (sur GitHub ou en local)
4. **Copie tout le contenu** et colle-le dans l'éditeur Supabase
5. Clique le bouton vert **"Run"** (en bas à droite)
6. Tu dois voir **"Success. No rows returned"** ✅

Vérifie que les tables sont créées : menu **Table Editor** → tu dois voir :
- `profiles`
- `session_logs`
- `conditioning_logs`
- `readiness_logs`
- `body_metric_logs`

---

## 4. Récupérer tes clés API

1. Menu de gauche : **Settings** (l'icône engrenage tout en bas) → **API**
2. Tu vois deux infos importantes :
   - **Project URL** : `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** : une longue chaîne `eyJhbGc...`
3. **Garde cet onglet ouvert**, on va copier ces deux valeurs juste après

> ⚠️ La clé `anon` est faite pour être publique. **Ne partage JAMAIS la clé `service_role`** (juste en dessous), elle bypass la sécurité.

---

## 5. Configurer l'app

1. À la racine du projet (à côté de `package.json`), crée un fichier nommé exactement **`.env`**
2. Mets dedans :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Remplace par **tes propres valeurs** copiées à l'étape 4
4. **Sauvegarde**

> Ce fichier `.env` est déjà dans `.gitignore`, donc il ne partira **jamais** sur GitHub. ✅

---

## 6. (Optionnel) Réglages auth Supabase

Par défaut, Supabase demande une confirmation par email à chaque inscription.

**Pour désactiver pendant les tests** (recommandé tant que tu es seul utilisateur) :

1. Dashboard Supabase → **Authentication** → **Providers** → **Email**
2. Décoche **"Confirm email"**
3. Clique **Save**

Tu pourras réactiver plus tard quand tu voudras inviter quelqu'un.

---

## 7. Relance l'app

```bash
# Re-installe les deps (nouvelles libs Supabase)
npm install

# Relance Expo
npm run start
```

Dans Expo Go, recharge l'app (secoue le téléphone → "Reload").

---

## 8. Tester la sync

Dans l'app :

1. Va dans **Settings** (5e onglet)
2. Tape **"Configurer la sync cloud"**
3. Tape **"Créer un compte"**
4. Entre ton email + un mot de passe (≥ 6 caractères)
5. Tape **"Créer le compte"**

Si tout va bien :
- Tu vois un bandeau vert **"connecté"**
- Tes données locales sont **automatiquement poussées** dans Supabase

Pour vérifier côté Supabase : **Table Editor** → `readiness_logs` → tu dois voir tes données de check-in.

---

## Comment ça marche en pratique

- ✅ **L'app reste offline-first** : tu peux logger une séance sans connexion, ça sera synchronisé dès que tu reprends du réseau (au prochain redémarrage / sync manuelle)
- ✅ **À chaque modification** (check-in, log de séance, conditioning, mensuration) → push automatique vers le cloud
- ✅ **Au démarrage de l'app** → pull automatique depuis le cloud (le serveur écrase le local)
- ✅ **Settings → Configurer la sync cloud** → bouton "Tirer du cloud" / "Pousser vers le cloud" pour forcer manuellement

---

## Sécurité

Le schéma SQL active **Row Level Security (RLS)** : chaque utilisateur ne peut lire/écrire **que ses propres données**, même si quelqu'un volait ta clé `anon`. C'est paramétré dans `supabase/schema.sql` (politiques `for all using (auth.uid() = user_id)`).

---

## Débugger

| Symptôme | Cause probable | Solution |
|---|---|---|
| Écran "Supabase n'est pas configuré" | Fichier `.env` absent ou mal nommé | Vérifie le nom exact `.env` (avec le point devant) à la racine |
| "Invalid login credentials" | Mot de passe incorrect ou compte non créé | Utilise "Créer un compte" d'abord |
| "Email not confirmed" | Tu as gardé la confirmation email activée | Étape 6 ci-dessus, ou clique le lien dans ton email |
| "permission denied for table" | Tu as oublié d'exécuter le schema.sql | Étape 3, refais-la |
| Les données ne se synchronisent pas | Variables d'env pas rechargées | Arrête Expo (`Ctrl+C`) et relance `npm run start` |

---

## Prochaine étape

Une fois la sync activée, tu peux passer à :
- **Build APK** pour avoir l'app autonome sur ton tel
- **CI/CD GitHub Actions** pour build automatique à chaque push
