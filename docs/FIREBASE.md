# Firebase — mise en service

Projet : **`miresan-bible-institute`**. La configuration Web est publique par nature (`.env.example`). Aucun secret serveur n’est exposé au client.

## 1. Services à activer (console Firebase)

1. **Authentication** : fournisseur « E-mail/Mot de passe ». Les identités sont techniques (`<identifiant>@id.miresan-bible-institute.app`) ; aucun e-mail n’est envoyé.
2. **Firestore** (édition standard) : région proche de l’Afrique centrale, par exemple `europe-west1` ou `eur3`. Ce choix est **définitif**.
3. **Storage** : même région.
4. **Functions** : plan Blaze requis. Les fonctions sont déployées en `europe-west1`.
5. **App Check** (recommandé) : reCAPTCHA Enterprise, puis renseigner `NEXT_PUBLIC_APP_CHECK_SITE_KEY`.
6. **App Hosting** : relier le dépôt GitHub. `apphosting.yaml` fixe `NEXT_PUBLIC_DATA_MODE=firebase`.

## 2. Déployer règles, index et fonctions

```bash
npm i -g firebase-tools
firebase login
firebase use miresan-bible-institute
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

## 3. Initialiser l’Institut (données réelles)

```bash
gcloud auth application-default login      # ou GOOGLE_APPLICATION_CREDENTIALS=<clé de service>
npm run init:institution                   # paramètres, programme, 36 cours — n'écrase pas les modifications
```

## 4. Créer le compte d’administration initial

Le mot de passe est transmis **uniquement par variable d’environnement**, le temps de la commande. Il n’est écrit dans aucun fichier, aucun log, aucun document Firestore :

```bash
BOOTSTRAP_ADMIN_USERNAME=pasteurarmel \
BOOTSTRAP_ADMIN_PASSWORD='<mot de passe communiqué par la Direction>' \
BOOTSTRAP_ADMIN_DISPLAY_NAME='Pasteur Armel' \
npm run bootstrap:admin
```

Comportement :

- Le compte est créé avec le custom claim `role: super_admin`, et le profil `users/{uid}` avec `mustChangePassword: true`. Un bandeau invite alors au changement ; l’option `--keep-password` le désactive.
- Relancer la commande ne modifie pas le mot de passe, sauf avec l’option `--reset-password`.
- Identifiant visible à la connexion : `pasteurarmel`.

> Astuce : préfixez la commande d’une espace (si `HISTCONTROL=ignorespace`) pour qu’elle n’entre pas dans l’historique du shell.

## 5. Gestion des comptes (Cloud Functions)

| Fonction | Qui | Effet |
| --- | --- | --- |
| `createUserAccount` | secrétariat (étudiants, enseignants) ; direction (rôles inférieurs) | Crée le compte avec un mot de passe provisoire, renvoyé une seule fois |
| `setUserRole` | direction, super admin | Custom claim + miroir `users.role` + audit ; impossible sur soi-même ou vers un rang supérieur |
| `resetUserPassword` | secrétariat, direction | Mot de passe provisoire, `mustChangePassword: true`, sessions révoquées |
| `submitAttempt` | tout utilisateur connecté | Correction serveur (le corrigé reste inaccessible au client) |
| `auditGrades` / `auditPayments` | triggers | Journal `auditLogs` |
| `summarizeAttendanceOnWrite` | trigger | Résumé d’assiduité par étudiant (`attendanceSummaries`) |

## 6. Émulateurs (développement)

```bash
npm run emulators                                    # Auth 9099, Firestore 8080, Storage 9199, Functions 5001, UI 4000
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
FIREBASE_PROJECT_ID=demo-miresan npm run init:institution
# idem : npm run seed:demo, npm run bootstrap:admin
```

Pour que l’application utilise les émulateurs, renseigner `.env.local` :

```
NEXT_PUBLIC_DATA_MODE=firebase
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-miresan
```

Le seed de démonstration **refuse** de s’exécuter hors émulateur. La seule exception exige une double confirmation : `--allow-production` et `SEED_DEMO_CONFIRM=<projet>`. Elle est réservée à un projet de préproduction.

## 7. Tests des règles

```bash
npm run test:rules   # 15 scénarios : notes, rôles, paiements, données d'autrui, corrigés, progression…
```
