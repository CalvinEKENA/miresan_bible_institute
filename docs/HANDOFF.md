# IB-MIRESAN — Note de reprise (handoff)

> Rédigée le 2026-09-25 à la fin de la session locale, pour reprendre le travail dans une autre session.
> Le brief complet (70 sections) reste la référence : campus numérique premium, Next.js + Firebase.

## 1. État actuel du dépôt

**Déjà fait**
- Audit du dossier local : **aucun code existant**. Contenu d'origine : logo, flyer, `STATUTS IBM.docx` et `REGLEMENT INTERIEUR IBM.docx`.
- Base de configuration : `package.json` (Next 16.3.6, React 19.3, TypeScript ~5.9 **(pas TS 7)**, Tailwind 4, motion 13, firebase 12, zod 4, vitest 5, Playwright, firebase-admin, tsx, sharp), `tsconfig.json` (strict + `noUncheckedIndexedAccess`), `next.config.ts` (en-têtes de sécurité, `X-Robots-Tag: noindex` sur /campus, /enseignant, /admin, /connexion), `eslint.config.mjs` (flat config, `no-console`, pas de `any`), `postcss.config.mjs`, `.env.example`, `.gitignore`.
- Assets : `public/branding/logo-ib-miresan.png` (logo officiel, PNG), `docs/institution/flyer-rentree-2026.jpeg`.

**Pas encore fait** : tout le code applicatif (`src/`), les règles Firebase, les Cloud Functions, les scripts, les tests et la documentation. `npm install` doit être relancé (`node_modules` n'est pas versionné).

**Fichiers volontairement NON versionnés** (voir `.gitignore`) : les deux `.docx` (ils contiennent les **signatures manuscrites** du Fondateur et du Doyen, à ne jamais publier) et les fichiers bruts à la racine. Les faits utiles qu'ils contiennent sont résumés ci-dessous.

## 2. Faits institutionnels (source : Statuts et Règlement intérieur du 24/07/2026, plus le flyer)

- **Nom** : Institut Biblique de la MIRESAN (IBM / IB-MIRESAN) — MIRESAN Bible Institute (MBI). **Devise** : Découvrir • Développer • Déployer.
- **Nature** : établissement privé confessionnel d'enseignement biblique, théologique et ministériel, à but non lucratif. Il est placé sous la couverture juridique de la **Grace Bible Church in Cameroon (GBCC)**, reconnue par le décret présidentiel n° 94/220 du 7 novembre 1994.
- **Siège** : Église de la MIRESAN, Complexe El Dorado, Nkomo, Yaoundé, Cameroun.
- **Gouvernance** : Fondateur **Rév. Armel Désiré SEUWOU** (= compte `pasteurarmel`, « Pasteur Armel »), Directeur **Rév. NGONO Mathurin**, Doyen académique **Rév. YAKI Jean**. Organes : Conseil d'administration, Conseil académique, Direction générale, Direction des études, Direction administrative et financière, Secrétariat académique.
- **Affiliation** : les statuts parlent d'une **démarche d'affiliation** auprès de la Christ for Africa University (CFAU). L'affiliation n'est **PAS acquise** ; ne jamais écrire « accrédité » ni « affilié ».
- **Vision (art. 7)** : faire de chaque croyant un disciple équipé, enraciné dans la Parole, capable de transformer son Église et sa communauté…
- **Mission (art. 8)** : former, équiper et accompagner les hommes et les femmes appelés au ministère…
- **Valeurs (art. 9)** : fidélité aux Écritures, excellence, intégrité et sainteté, service et humilité, discipline et ponctualité, respect de la diversité des appels.
- **Cursus** : 2 ans, 3 trimestres par an, diplôme de Théologie. L'Institut peut créer d'autres cycles, donc **l'architecture ne doit pas être figée à 36 cours**. La répartition des cours par trimestre n'est pas officielle (elle est fixée par la Direction des études). Hypothèse de seed provisoire : cours 1 à 6 au T1, 7 à 12 au T2, 13 à 18 au T3, marquée « provisoire ».
- **Horaires : conflit à signaler.** Les statuts et le règlement indiquent **jeudi 15h00–20h30** et samedi 08h00–14h30. Le flyer indique **jeudi 16h00–20h00**. Tout doit rester administrable et le conflit doit être affiché à l'administrateur.
- **Rentrée** : samedi **7 novembre 2026** (flyer). L'année va généralement d'octobre à juillet.
- **Admission** : être né de nouveau et membre actif d'une Église locale. Pièces : 4 photos 4x4, 1 chemise cartonnée, formulaires, lettre de recommandation du pasteur, témoignage de conversion et d'appel, 1 rame de papier A4, frais d'inscription. L'admission passe par un entretien préalable.
- **Frais** (à stocker en paramètres) : inscription 15 000 FCFA ; pension 120 000 FCFA (en une fois ou en 3 tranches) ; badge 1 000 ; carte étudiant 1 000.
- **Assiduité** (à rendre configurable) : au-delà de 25 % d'absence dans une matière, l'étudiant est exclu de l'examen ; 3 retards non justifiés valent 1 absence ; une absence se justifie sous 7 jours.
- **Évaluation** : note sur 20, contrôle continu (CC) plus examen de fin de trimestre, pondération définie par la Direction des études (configurable), validation à **10/20**, session de rattrapage. Le passage en année supérieure exige la validation de toutes les matières.
- **Mémoire** (2e année) : sujet validé au plus tard à la fin du T1 de la 2e année, jury d'au moins 2 enseignants.
- **Stage pratique** : Église locale ou œuvre agréée, rapport et attestation du responsable d'accueil.
- **Documents délivrés** : attestation de fin de 1re année, relevés annuels, diplôme de l'IBM (signé par le Fondateur, et par l'université partenaire le cas échéant).
- **Tenue** : nœud papillon **bleu en 1re année, vert en 2e année**.
- **Contacts** : +237 686 921 208 / +237 673 011 317. Deux e-mails différents existent : `ib_miresan@yahoo.com` (flyer) et `ibmiresan@gmail.com` (logo), **à confirmer**. Site indiqué sur le flyer : www.ib.miresan.org.
- **Slogans du flyer** (utilisables à la place de faux témoignages) : « Une formation pour aujourd'hui, un impact pour demain », « De l'appel à l'équipement, de l'équipement au déploiement ! », « Ensemble pour la moisson ! », « Prépare-toi pour le service, Dieu a une œuvre pour toi ! ». Verset : « Équipez le peuple de Dieu pour l'œuvre du ministère » (Éph 4:12).

Les 36 cours : voir la section 7 du brief. Détails du flyer : « Théologie 5 : Ecclésiologie + Eschatologie » et « Théologie 4 : Angélologie + Démonologie (Doctrine sur les Anges) ».

## 3. Décisions d'architecture prises

- **Deux modes de données** via `NEXT_PUBLIC_DATA_MODE=demo|firebase` :
  - Une interface `DataStore` (`get` / `list(where, orderBy, limit)` / `set` / `update` / `create` / `remove`) a deux implémentations : `DemoStore` (en mémoire, amorcée par le jeu de seed, surcouche `localStorage` protégée par try/catch) et `FirestoreStore`.
  - Les repositories sont écrits **une seule fois** au-dessus de `DataStore`.
  - Le SDK Firebase est chargé en **import dynamique** et n'est jamais embarqué en mode démo ni sur les pages publiques.
- **Séparation du seed** :
  - `scripts/init-institution.ts` écrit les données **réelles** : 36 cours, paramètres (frais, horaires, notation, assiduité), pièces d'admission.
  - `scripts/seed-demo.ts` écrit les données **fictives** et refuse de s'exécuter hors émulateur sans drapeau explicite.
- **Identité par identifiant** : si l'identifiant ne contient pas d'arobase, il devient `<identifiant>@${NEXT_PUBLIC_IDENTITY_DOMAIN}`. On évite ainsi une collection publique de noms d'utilisateur. La récupération passe par un e-mail de récupération facultatif ou par une réinitialisation faite par l'administration (callable).
- **Bootstrap admin** : `scripts/bootstrap-admin.ts` (Admin SDK) lit `BOOTSTRAP_ADMIN_USERNAME` et `BOOTSTRAP_ADMIN_PASSWORD` dans l'environnement, crée l'utilisateur, pose le custom claim `role=super_admin` et `users/{uid}.mustChangePassword=true`. **Le mot de passe ne doit apparaître dans aucun fichier.**
- **RBAC** : rôles `super_admin`, `founder`, `director`, `dean`, `academic_secretariat`, `finance_officer` (extension), `teacher`, `student`. La matrice de permissions vit dans `src/domain/permissions.ts`. Le rôle est porté par un **custom claim** et vérifié dans les Security Rules et les Cloud Functions. L'interface ne fait que refléter ces droits.
- **Quiz** :
  - Les corrigés sont stockés dans `assessmentKeys/{assessmentId}`, lisibles par le personnel uniquement.
  - La correction passe par la callable `submitAttempt` en mode Firebase et se fait en local en mode démo.
  - Types de questions : single, multiple, true_false, short_text, long_text, matching, ordering, verse_completion, case_study, reflection, file_upload, oral.
- **Audit log** : écrit par des triggers Cloud Functions (notes, paiements, rôles, certificats, publication d'examens). Les clients ne peuvent pas écrire dans `auditLogs`.
- **Vérification des diplômes** : collection publique minimale `certificateVerifications/{id}` (nom, type, date, statut) ; le certificat complet reste privé. Page `/verify/[documentId]`.
- **Bible** : parseur de références pour les noms de livres français et leurs abréviations. Les textes viennent de la **Louis Segond 1910 (domaine public)** uniquement, sous forme d'un petit JSON de versets, extensible par livre en chargement différé.
- **Présence** : un document par séance, `marks: Record<uid, present|absent|late|excused>`, tous présents par défaut.
- **Contenu de démo** : il doit être étiqueté « Contenu de démonstration — ne constitue pas un enseignement officiel ». Pas de faux témoignages, pas d'enseignants réels inventés.

## 4. Direction artistique retenue

- **Palette** : ink `#06110C` / `#0A1B14`, forest `#0B2A1F` `#0F3A2A` `#145039` `#1B6647` `#2A7D58`, sage `#8FA597` `#B3C3B6` `#D4DDD3`, gold `#9C7A2E` `#B8923E` `#CFAE62` `#E2CA8F` `#F0E2BD`, ivory `#FBF8F1` `#F6F1E6` `#EEE6D5`, sand `#E2D6BD` `#CDBE9E`, texte atténué `#6F6A5E`. L'or sert d'accent uniquement.
- **Typographies** (next/font) : **Newsreader** (serif avec axe optique, pour les titres et la lecture des leçons) et **Hanken Grotesk** (interface, chiffres tabulaires).
- **Signature visuelle** :
  - Rayons dorés issus du logo, en SVG, avec une rotation très lente.
  - Bible ouverte en trait fin, lignes réglées et annotations en marge (Mt 28:19, 2 Tm 2:2, Ép 4:12).
  - Grain de papier discret et grandes compositions asymétriques.
  - Animations d'entrée en **CSS pur** (pas d'overlay qui bloquerait le LCP) et respect de `prefers-reduced-motion`.
  - `LazyMotion` + `domAnimation`. Pas de WebGL.
- **Les trois piliers deviennent une logique UX** : chaque cours porte `pillar: discover|develop|deploy`. La progression étudiante est présentée par pilier, et la section de la homepage est en scroll « triptyque » : ivoire, puis sauge, puis vert profond.
- **Homepage** :
  - Hero sombre : titre serif géant « Institut biblique / de la *Miresan* », sceau et rayons, marginalia.
  - Ticker « Rentrée 7 nov. 2026 ».
  - Manifeste avec révélation au scroll, puis le triptyque.
  - Programme présenté comme une **table des matières** (points de conduite, pas de cartes).
  - Section « Formez-vous pour servir Dieu et son Église », vie académique, formation ministérielle, gouvernance (monogrammes, sans photos).
  - Slogans à la place des témoignages, admissions (pièces, frais, étapes), actualités et calendrier, contact.
- **Campus** : sidebar en « dos de livre » vert profond et filets or ; contenu sur papier ivoire ; barre de navigation en bas sur mobile.
- **Study Mode** :
  - Colonne de lecture en serif de 68ch avec lettrine, table des matières repliable, marge de notes.
  - Barre d'outils à la sélection : surligner, note, copier la référence, favori.
  - Thèmes Papier / Sépia / Nuit, mode Focus, reprise de lecture, sceau « Leçon achevée ».

## 5. Plan de travail restant (dans l'ordre)

1. `npm install`, puis `npm run assets` : script sharp qui génère les icônes PWA et les variantes webp du logo.
2. `src/app/globals.css` (tokens `@theme`, thèmes clair et nuit), polices, layout racine, i18n (`src/i18n/fr.ts`, `en.ts`).
3. `src/domain/` : types, permissions, notation (grading), assiduité, finances, progression et jalons, moteur de quiz, parseur biblique, identité, **plus les tests vitest**.
4. `src/data/` : catalogue officiel, seed de démo, `DataStore` (démo et Firestore), repositories, hook `useData`, `AuthProvider`.
5. Composants du design system : Button, Card, Tabs, Dialog, Drawer, Popover, Toast, DataTable, EmptyState, Skeleton, ProgressRing, BibleReference, CommandPalette (Ctrl+K)…
6. Pages publiques, `/connexion`, `/verify/[id]`.
7. `/campus` : aujourd'hui, cours, cours/[id], leçon (Study Mode), évaluations et quiz, résultats, calendrier, bibliothèque, messages, profil, mémoire, stage, paiements, onboarding.
8. `/enseignant` : aujourd'hui, cours et éditeur, présences, évaluations et correction, étudiants, ressources.
9. `/admin` : tableau de bord, puis toutes les sections de gestion listées au §18 du brief.
10. Firebase : `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `apphosting.yaml`, `functions/` (callables et triggers d'audit), tests des règles avec l'émulateur (Java 21 disponible).
11. PWA (manifest, `sw.js`, cache de l'app shell uniquement), SEO (metadata, sitemap, robots, JSON-LD `EducationalOrganization`).
12. Docs : README, ARCHITECTURE, FIREBASE, SECURITY, DESIGN_SYSTEM.
13. `npm run validate`, E2E Playwright en mode démo, revue visuelle desktop et mobile, puis corrections.
