# Architecture

## Vue d’ensemble

```
src/
  app/
    (public)/            site vitrine : rendu serveur/statique, sans SDK Firebase ni AuthProvider
      page.tsx           accueil
      programme/         table des matières des 36 cours
      verifier/[id]/     vérification publique d’un diplôme (API REST Firestore)
      hors-ligne/        repli du service worker
    (app)/               espaces privés : AuthProvider, noindex
      connexion/
      campus/
        (shell)/         pages avec barre latérale et navigation basse
        (study)/         Study Mode plein écran : /campus/cours/[courseId]/[lessonId]
      enseignant/
      admin/
    layout.tsx           polices, métadonnées, service worker
    globals.css          design system (tokens Tailwind 4)
  components/            brand/ ui/ public/ shell/ campus/ study/ auth/ pwa/
  domain/                logique métier pure et testée (aucune dépendance UI/Firebase)
  data/
    store/               contrat DataStore + DemoStore + FirestoreStore
    auth/                AuthProvider + adaptateurs démo / Firebase
    demo/                seed fictif (personnes, leçons LSG, quiz)
    catalog.ts           36 cours officiels (seed administrable)
    institution.ts       paramètres par défaut (données réelles)
    repositories.ts      chargements composés (étudiant, cours)
    admin.ts             agrégats du tableau de bord de direction
    public-settings.ts   paramètres publics côté serveur (REST, revalidation 10 min)
  lib/                   env, firebase (client dynamique, admin server-only)
functions/               Cloud Functions (domaine partagé copié au build)
scripts/                 bootstrap-admin, init-institution, seed-demo, assets
tests/unit · tests/rules · e2e/
```

## Deux modes de données

`NEXT_PUBLIC_DATA_MODE` vaut `demo` (par défaut) ou `firebase`.

- Les pages dialoguent avec un **`DataStore`** (`get`, `list(where, orderBy, limit)`, `set`, `update`, `remove`), typé par `CollectionMap`.
- Les implémentations sont chargées par **import dynamique** (`src/data/store/index.ts`). Le seed démo et le SDK Firebase ne pèsent donc jamais sur le bundle initial, et le site public n’embarque aucun des deux.
- Les requêtes sont écrites pour être **acceptées par les Security Rules** : par exemple, un étudiant filtre toujours ses notes par `uid` et `published == true`.
- `useData(key, fetcher)` ajoute un cache mémoire par clé. La navigation entre pages déjà visitées est instantanée, sans requête réseau redondante.

## Authentification

- L’utilisateur saisit un **identifiant** (`pasteurarmel`) ; Firebase Auth reçoit `pasteurarmel@<NEXT_PUBLIC_IDENTITY_DOMAIN>` (`src/domain/identity.ts`).
- Le rôle provient du **custom claim `role`**, lu dans le jeton d’identité. Le document `users/{uid}` n’en est qu’un miroir informatif.
- « Se souvenir de moi » choisit la persistance `browserLocal` ou `browserSession`.
- `RequireRole` redirige et filtre l’interface, mais la protection effective des données est assurée par `firestore.rules`.

## Programme académique extensible

`Program.levels` et `termsPerLevel` sont libres, et les cours portent `programId`, `level`, `term` et `pillar`. Les 36 cours actuels ne sont qu’un seed (`init-institution`). Un certificat, une formation courte, un autre cycle ou un autre campus s’ajoutent sans modifier le code.

## Study Mode

Les leçons sont des listes de **blocs typés** (`LessonBlock` : paragraphe, titre, verset, citation, liste, encadré, image, vidéo, audio, PDF, réflexion, quiz).

Le lecteur (`components/study/study-reader.tsx`) gère :

- la progression, observée par IntersectionObserver et jamais régressive ;
- les surlignages et les notes (collection `highlights`) ;
- le glossaire ;
- les thèmes Papier, Sépia et Nuit, la taille du texte et le mode Focus ;
- la reprise de lecture et le sceau « Leçon achevée ».

Les médias se chargent **à la demande** (`preload="none"`).

## Performance et contexte mobile

- Les animations sont en CSS : révélations, et effets pilotés par le scroll avec `animation-timeline` en amélioration progressive. Aucune bibliothèque d’animation n’est chargée, et `prefers-reduced-motion` est respecté.
- Polices : sous-ensemble `latin` uniquement, sans axe optique (~155 Ko préchargés).
- Logo : variantes webp dimensionnées. Aucun WebGL, aucune vidéo de fond.
- Firestore est configuré avec un cache persistant IndexedDB, et le service worker est prudent.
- Budgets mesurés : environ 480 Ko pour l’accueil, 30 à 80 Ko par page du campus une fois l’application chargée.
