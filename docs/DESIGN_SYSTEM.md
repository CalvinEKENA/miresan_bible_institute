# Design System IB-MIRESAN

Source unique : `src/app/globals.css` (`@theme` Tailwind 4). Composants : `src/components/{brand,ui}`.

## Intention

Une institution, pas une startup. Le **vert profond** porte l’autorité et la stabilité, l’**ivoire** évoque le papier et l’étude, l’**or** reste un accent rare. La référence visuelle est une édition soignée : table des matières, filets, marges annotées, lettrines. Les codes SaaS sont exclus : cartes blanches en série, gradients violets, grosses pilules.

## Couleurs

| Famille | Tokens | Usage |
| --- | --- | --- |
| Ink | `ink-950` `ink-900` | Texte principal, fonds nocturnes |
| Forest | `forest-900` → `forest-500` | Hero, barre latérale « dos de livre », actions primaires |
| Sage | `sage-500` → `sage-100` | Pilier « Développer », surfaces secondaires |
| Gold | `gold-800` → `gold-100` | Accents, eyebrows, CTA principal public, filets |
| Ivory / Sand | `ivory-50/100/200`, `sand-300/400` | Papier, fonds de page |
| États | `danger`, `warning`, `success`, `info` (600/100) | Badges, alertes |

Tokens sémantiques (`paper`, `paper-raised`, `paper-sunken`, `text`, `text-soft`, `text-muted`, `line`, `accent`, `brand`, `highlight`) redéfinis par thème : `data-theme="paper" | "sepia" | "night"`. La variante `dark:` cible `night`.

## Typographie

- **Newsreader** (serif éditoriale) : titres (`font-display`), lecture des leçons (`prose-reading`), chiffres clés.
- **Hanken Grotesk** : interface. Chiffres tabulaires via `numeric`.
- Échelle fluide 360 → 1440 px : `text-2xs` … `text-5xl`, puis `text-display` (jusqu’à 8,6 rem).
- `eyebrow` : petites capitales espacées (0,22 em) pour les surtitres.

## Espacement, rayons, ombres, couches

- `--spacing-gutter` (1 → 2,5 rem), `--spacing-section` (4,5 → 10 rem), `container-content` (76 rem), `container-wide` (90 rem), `--container-prose` (68 ch).
- Rayons **sobres** : `xs 2px`, `sm 4px` (boutons), `md 8px` (panneaux), `xl` réservé aux feuilles mobiles.
- Ombres teintées vert encre : `shadow-paper`, `shadow-lifted`, `shadow-overlay`.
- z-index : `--z-raised 10` · `sticky 20` · `header 40` · `nav 50` · `drawer 60` · `overlay 70` · `modal 80` · `popover 90` · `toast 100`.
- Points de rupture : `xs 384` · `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1440`.

## Mouvement

- Courbes : `ease-editorial` (0.22, 1, 0.36, 1), `ease-page`, `ease-soft`. Durées : `instant 90` · `quick 180` · `base 320` · `slow 640` · `reveal 1100` ms.
- `reveal` : entrée CSS au chargement (ne bloque jamais le LCP). `Reveal` ou `reveal-on-scroll` : un seul IntersectionObserver partagé.
- `scroll-ink` (mots qui « prennent l’encre ») et `parallax` : `animation-timeline` en amélioration progressive.
- `prefers-reduced-motion` neutralise tout mouvement ; sans JS, tout reste visible.

## Signatures visuelles

- `Rays` : rayons dorés du logo, rotation très lente.
- `OpenBible` : Bible ouverte en trait fin, avec une lumière dorée à la reliure.
- `PillarGlyph` : graine (Découvrir), croissance (Développer), envoi (Déployer).
- `Monogram` : initiales dans un double anneau doré (pas de photos inventées).
- `CourseCover` : chaque cours est un volume relié, teinté par pilier.
- `paper-grain`, `ruled`, `leader` : grain de papier, lignes de cahier, points de conduite.

## Composants

`Button`, `ButtonLink`, `TextLink` (flèche éditoriale), `Badge`, `Card`, `Panel`, `PageHeader`, `ProgressBar`, `ProgressRing`, `Skeleton`, `EmptyState`, `DemoNotice`, `Icon` (jeu maison au trait de 1,3), `AppShell` (barre latérale, barre du haut, navigation basse, tiroir), `StudyReader`, `QuizPlayer`, `ProgrammeToc`.

## Règles d’usage

- L’or ne sert jamais de fond de grande surface. Seul le CTA public « Commencer ma formation » est doré.
- Une seule serif par écran pour les titres ; la sans-serif sert à l’interface.
- Mobile d’abord : navigation basse côté étudiant, feuilles modales en bas d’écran, cibles tactiles d’au moins 40 px.
- Ne jamais afficher de métriques arbitraires : chaque chiffre vient des données.
