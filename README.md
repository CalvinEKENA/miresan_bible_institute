# IB-MIRESAN — Campus numérique

Plateforme de l’**Institut Biblique de la MIRESAN** (MIRESAN Bible Institute, MBI), Yaoundé.
Devise : **Découvrir • Développer • Déployer**.

Site institutionnel, campus étudiant (leçons en Study Mode, quiz, résultats, calendrier), espace enseignant et back-office de direction, sur **Next.js 16 + React 19 + Tailwind 4 + Firebase 12**.

## Démarrage rapide (mode démo, sans Firebase)

```bash
npm install
npm run dev            # http://localhost:3000
```

Le mode démo (`NEXT_PUBLIC_DATA_MODE=demo`, valeur par défaut) charge des **données fictives** en mémoire.
Comptes de démonstration (mot de passe `demo2026`) :

| Identifiant       | Espace                                 |
| ----------------- | -------------------------------------- |
| `etudiant.demo`   | Campus étudiant (1re année)            |
| `enseignant.demo` | Espace enseignant (appel, cours)       |
| `direction.demo`  | Administration (« Bonjour Pasteur Armel ») |

Ces comptes n’existent qu’en démo. Ils n’ont aucun lien avec les comptes réels.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` / `build` / `start` | Développement, build de production, serveur |
| `npm run lint` · `typecheck` · `test` | ESLint, TypeScript strict, tests Vitest (domaine, store, quiz) |
| `npm run test:rules` | Tests des Security Rules sur l’émulateur Firestore (Firebase CLI requis) |
| `npm run test:e2e` | Parcours Playwright (mobile 360 et desktop 1440), après `npm run build` |
| `npm run validate` | lint + typecheck + tests + build |
| `npm run assets` | Génère les variantes du logo, les icônes PWA et l’image Open Graph |
| `npm run emulators` | Émulateurs Auth, Firestore, Storage, Functions |
| `npm run init:institution` | Écrit les données **réelles** : paramètres, programme, 36 cours |
| `npm run bootstrap:admin` | Crée le compte super administrateur (variables d’environnement) |
| `npm run seed:demo` | Données fictives, **émulateurs uniquement** |
| `npm run functions:build` | Compile les Cloud Functions |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : structure, modes de données, flux
- [docs/FIREBASE.md](docs/FIREBASE.md) : mise en service, bootstrap admin, émulateurs, déploiement
- [docs/SECURITY.md](docs/SECURITY.md) : rôles, règles, secrets, audit
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) : tokens, typographie, composants, mouvement
- [docs/HANDOFF.md](docs/HANDOFF.md) : faits institutionnels, décisions, état d’avancement

## Points institutionnels à confirmer

Ces points sont **paramétrables** dans `/admin/parametres` et signalés dans le tableau de bord :

1. **Horaire du jeudi.** Les Statuts indiquent 15h00–20h30, le flyer 16h00–20h00. La démo utilise l’horaire des Statuts.
2. **Adresse e-mail officielle.** `ib_miresan@yahoo.com` (flyer) ou `ibmiresan@gmail.com` (logo).
3. **Répartition des cours par trimestre.** Elle est provisoire (1–6, 7–12, 13–18).

L’affiliation à la CFAU est toujours présentée comme une **démarche** en cours, jamais comme acquise.
