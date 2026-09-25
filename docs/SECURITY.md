# Sécurité

## Principes

1. **Le serveur décide.** Les droits proviennent du custom claim `role`, posé par l’Admin SDK, et sont appliqués par `firestore.rules`, `storage.rules` et les Cloud Functions. L’interface ne fait que refléter ces droits.
2. **Aucun secret dans le client.** Seules les variables `NEXT_PUBLIC_*` (configuration Web Firebase, publique par nature) sont inlinées. `src/lib/firebase/admin.ts` est marqué `server-only`.
3. **Aucun mot de passe réel dans le dépôt.** Le mot de passe initial de `pasteurarmel` est passé à `scripts/bootstrap-admin.ts` par variable d’environnement uniquement. Il n’est ni journalisé ni stocké dans Firestore, et il est absent du seed et du bundle. Un test unitaire vérifie que le seed n’en contient aucun.
4. **Moindre privilège** : voir la matrice `src/domain/permissions.ts`, miroir documentaire des règles.

## Rôles

`super_admin`, `founder`, `director`, `dean`, `academic_secretariat`, `finance_officer`, `teacher`, `student`.

| Garantie | Où |
| --- | --- |
| Un étudiant ne modifie ni ses notes, ni son rôle, ni ses paiements | `grades`, `users`, `payments` dans `firestore.rules` (testé) |
| Un étudiant ne lit pas les données privées d’un autre étudiant | `users`, `grades`, `payments`, `attendance` (testé) |
| Un étudiant ne lit jamais les corrigés | `assessmentKeys` ; correction par `submitAttempt` (testé) |
| Un enseignant ne devient pas administrateur | création de `users` interdite côté client ; `setUserRole` hiérarchique (testé) |
| Un enseignant n’agit que sur ses cours et ne publie pas de notes | `teaches(courseId)`, `published == false` (testé) |
| Journal d’audit infalsifiable | `auditLogs` : écriture interdite aux clients ; triggers serveur |
| La progression ne régresse pas | `progress` : `percent` croissant (testé) |

## Comptes et mots de passe

- Les identités sont techniques (`<identifiant>@<domaine interne>`) : il n’existe **pas** de collection publique de noms d’utilisateur.
- La réinitialisation passe par le secrétariat (`resetUserPassword`) : mot de passe provisoire remis en main propre, `mustChangePassword`, révocation des sessions.
- Nouveaux mots de passe : au moins 8 caractères, dont une lettre et un chiffre (`passwordIssues`). Le changement exige une ré-authentification.

## Web

En-têtes (`next.config.ts`) : `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS, et `X-Robots-Tag: noindex` sur les espaces privés.

Les redirections après connexion n’acceptent que des chemins internes (`safeNext`). Le JSON-LD est échappé.

Le service worker ne met en cache ni les données personnelles ni les requêtes Firebase.

## À faire avant la production

- Activer App Check (reCAPTCHA Enterprise) et l’imposer sur Firestore, Storage et Functions.
- Ajouter une CSP stricte avec nonces, une fois les origines Firebase figées.
- Alertes budgétaires et quotas sur Functions.
- Vérifier la région Firestore et la politique de rétention de `auditLogs`.
