# Déploiement — Firebase App Hosting

Deux usages, deux backends App Hosting distincts dans le projet `miresan-bible-institute` :

| | Preview client (maintenant) | Production (plus tard) |
| --- | --- | --- |
| Backend | `miresan-preview` | ex. `miresan-prod` |
| Région | `europe-west4` | `europe-west4` |
| Branche GitHub | `claude/stoic-feynman-02ipvu` | `main` |
| Nom d’environnement du backend | *(aucun)* | `production` |
| Fichiers appliqués | `apphosting.yaml` | `apphosting.yaml` + `apphosting.production.yaml` |
| Données | démo en mémoire (`NEXT_PUBLIC_DATA_MODE=demo`) | Firebase réel |
| Indexation | interdite (`NEXT_PUBLIC_PREVIEW_MODE=true`) | autorisée (pages publiques) |

## Principe : sûr par défaut

- **`apphosting.yaml` (base)** décrit la preview. Tout backend sans nom d’environnement est une démonstration non indexée. Il n’écrit rien dans Firestore et ne crée aucun compte Firebase Auth.
- **`apphosting.production.yaml`** n’est fusionné **que** si le backend porte explicitement le nom d’environnement `production`.

Un oubli de configuration ne peut donc ni publier la démo comme production indexée, ni brancher la preview sur les données réelles.

En mode preview :

- `<meta name="robots" content="noindex, nofollow">` sur toutes les pages ;
- en-tête `X-Robots-Tag: noindex, nofollow` sur toutes les réponses ;
- `robots.txt` interdit tout et `sitemap.xml` est vide ;
- la mention « Version de présentation » apparaît dans le pied de page.

## Créer le backend de preview (console, une seule fois)

1. Console Firebase → projet **miresan-bible-institute** → **Build → App Hosting** → **Commencer** / **Créer un backend**.
2. Si demandé, passer au **forfait Blaze** : App Hosting l’exige. Le coût d’une preview peu visitée est négligeable ; définissez une alerte budgétaire.
3. **Région** : `europe-west4`.
4. **Dépôt GitHub** : connecter `CalvinEKENA/miresan_bible_institute` et autoriser l’application Firebase sur ce dépôt.
5. **Répertoire racine** : `/`. **Branche en production du backend** : `claude/stoic-feynman-02ipvu`. **Déploiements automatiques** : activés.
6. **Nom du backend** : `miresan-preview`.
7. **Application Web Firebase** : laisser créer/associer l’application proposée.
8. **Terminer et déployer.** Le premier déploiement prend environ 5 à 10 minutes.

✅ **Preview en ligne depuis le 25/09/2026** : **https://miresan-preview--miresan-bible-institute.europe-west4.hosted.app**. Backend `miresan-preview` (europe-west4), relié à l’application Web Firebase existante, validé par le client interne. Elle figure dans `apphosting.yaml` (`NEXT_PUBLIC_SITE_URL`). Si la console affiche une autre URL, corriger cette valeur puis pousser.

Chaque `git push` sur la branche redéploie automatiquement la preview.

### Alternative en ligne de commande (poste local)

```bash
npm i -g firebase-tools
firebase login
firebase use miresan-bible-institute
firebase apphosting:backends:create --backend miresan-preview --primary-region europe-west4 --root-dir /
# la CLI propose ensuite de connecter GitHub et de choisir la branche claude/stoic-feynman-02ipvu
firebase apphosting:backends:list          # affiche l'URL du backend
```

## Comptes de démonstration (preview)

`etudiant.demo`, `enseignant.demo` et `direction.demo`, mot de passe `demo2026`. Ils n’existent que dans le code de démonstration côté navigateur, pas dans Firebase Auth. Chaque visiteur a ses propres données démo, conservées dans son navigateur.

## Passage en production (après validation du client)

1. Suivre `docs/FIREBASE.md` : règles, index, fonctions, `init:institution`, puis `bootstrap:admin` (mot de passe de `pasteurarmel` en variable d’environnement uniquement).
2. Fusionner la branche validée dans `main` (sur accord explicite).
3. Créer un **second backend** (ex. `miresan-prod`) relié à `main`, puis, dans **Paramètres → Environnement**, saisir le nom **`production`**, et relancer un déploiement.
4. Renseigner dans `apphosting.production.yaml` le domaine définitif (`NEXT_PUBLIC_SITE_URL`) et la clé App Check ; relier le domaine personnalisé au backend.
5. Vérifier en ligne : pas d’en-tête `X-Robots-Tag` sur les pages publiques, `robots.txt` avec sitemap, connexion Firebase fonctionnelle.
6. Supprimer ou restreindre le backend de preview.
