import { type Assessment, type AssessmentKey, type Lesson } from "@/domain/types";

/**
 * CONTENU DE DÉMONSTRATION — ne constitue pas un enseignement officiel de l'Institut.
 * Versets : Louis Segond 1910 (domaine public).
 */
const LSG = "Louis Segond 1910";

export const DEMO_LESSONS: Lesson[] = [
  {
    id: "a1-01-l1",
    courseId: "a1-01",
    order: 1,
    title: "La Bible, une bibliothèque",
    summary: "Soixante-six livres, deux Testaments, une seule histoire : situer les Écritures avant de les étudier.",
    durationMinutes: 18,
    status: "published",
    demo: true,
    glossary: [
      { term: "Testament", definition: "Du latin testamentum, traduisant « alliance » : l’Ancien et le Nouveau Testament désignent l’ancienne et la nouvelle alliance." },
    ],
    blocks: [
      {
        id: "b1",
        type: "paragraph",
        dropCap: true,
        text: "Avant d’être un livre, la Bible est une bibliothèque. Ses soixante-six livres ont été rédigés sur plus d’un millénaire, en trois langues, par des auteurs aux situations très diverses : bergers, rois, prophètes, pêcheurs, médecin, docteur de la Loi.",
      },
      { id: "b2", type: "heading", level: 2, text: "Deux Testaments, une seule histoire" },
      {
        id: "b3",
        type: "paragraph",
        text: "L’Ancien Testament raconte la création, la chute et la préparation du salut à travers l’histoire d’Israël. Le Nouveau Testament en présente l’accomplissement en Jésus-Christ et la naissance de l’Église.",
      },
      {
        id: "b4",
        type: "verse",
        reference: "Luc 24:27",
        version: LSG,
        text: "Et, commençant par Moïse et par tous les prophètes, il leur expliqua dans toutes les Écritures ce qui le concernait.",
      },
      {
        id: "b5",
        type: "list",
        ordered: false,
        items: [
          "**Ancien Testament** : Pentateuque, livres historiques, livres poétiques, prophètes.",
          "**Nouveau Testament** : Évangiles, Actes, épîtres, Apocalypse.",
        ],
      },
      { id: "b6", type: "reflection", prompt: "Quel livre de la Bible connaissez-vous le moins ? Notez pourquoi, et ce que vous aimeriez y découvrir cette année." },
    ],
  },
  {
    id: "a1-01-l2",
    courseId: "a1-01",
    order: 2,
    title: "L’inspiration des Écritures",
    summary: "Que veut dire « Toute Écriture est inspirée de Dieu » ? Lire ensemble 2 Timothée 3 et 2 Pierre 1.",
    durationMinutes: 26,
    status: "published",
    demo: true,
    glossary: [
      { term: "Révélation", definition: "Acte par lequel Dieu se fait connaître et communique sa volonté." },
      { term: "Inspiration", definition: "Action du Saint-Esprit sur les auteurs bibliques, de sorte que leurs écrits sont la Parole de Dieu." },
      { term: "Illumination", definition: "Œuvre de l’Esprit qui éclaire le lecteur pour comprendre et recevoir la Parole." },
      { term: "Canon", definition: "Liste des livres reconnus comme Écriture et faisant autorité pour la foi et la vie." },
    ],
    blocks: [
      {
        id: "b1",
        type: "paragraph",
        dropCap: true,
        text: "Lorsque Paul écrit à Timothée, son fils dans la foi, il sait que sa propre course touche à sa fin. Ses dernières recommandations ne portent ni sur une méthode ni sur une stratégie, mais sur un livre : les Écritures, capables de rendre *sage à salut*.",
      },
      {
        id: "b2",
        type: "verse",
        reference: "2 Timothée 3:16-17",
        version: LSG,
        text: "Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice, afin que l’homme de Dieu soit accompli et propre à toute bonne œuvre.",
      },
      { id: "b3", type: "heading", level: 2, text: "« Inspirée de Dieu »" },
      {
        id: "b4",
        type: "paragraph",
        text: "Le mot grec traduit par « inspirée » (*theopneustos*) signifie littéralement « soufflée par Dieu ». L’accent n’est pas d’abord mis sur l’enthousiasme des auteurs, mais sur l’origine du texte : l’Écriture procède de Dieu lui-même.",
      },
      {
        id: "b5",
        type: "callout",
        tone: "key",
        title: "À retenir",
        text: "L’inspiration porte sur les **écrits** eux-mêmes (« toute Écriture »), et pas seulement sur les idées ou sur les personnes qui les ont rédigés.",
      },
      { id: "b6", type: "heading", level: 2, text: "Des hommes poussés par l’Esprit" },
      {
        id: "b7",
        type: "paragraph",
        text: "Pierre complète le propos de Paul en décrivant la manière dont Dieu a agi. Les auteurs bibliques n’ont pas été de simples instruments passifs : leur style, leur vocabulaire et leur contexte transparaissent. Mais ils ont été *portés* par l’Esprit, comme un navire l’est par le vent.",
      },
      {
        id: "b8",
        type: "verse",
        reference: "2 Pierre 1:21",
        version: LSG,
        text: "car ce n’est pas par une volonté d’homme qu’une prophétie a jamais été apportée, mais c’est poussés par le Saint-Esprit que des hommes ont parlé de la part de Dieu.",
      },
      { id: "b9", type: "heading", level: 3, text: "Quatre usages de l’Écriture" },
      {
        id: "b10",
        type: "list",
        ordered: true,
        items: [
          "**Enseigner** — transmettre la vérité sur Dieu et sur l’homme.",
          "**Convaincre** — mettre en lumière ce qui est faux.",
          "**Corriger** — redresser ce qui a dévié.",
          "**Instruire dans la justice** — former le caractère et la conduite.",
        ],
      },
      {
        id: "b11",
        type: "quote",
        text: "L’herbe sèche, la fleur tombe ; mais la parole de notre Dieu subsiste éternellement.",
        source: "Ésaïe 40:8",
      },
      { id: "b12", type: "heading", level: 2, text: "Conséquences pour le ministère" },
      {
        id: "b13",
        type: "paragraph",
        text: "Si l’Écriture est soufflée par Dieu, alors celui qui enseigne n’en est pas le maître mais le serviteur. La prédication, l’accompagnement pastoral et la formation de disciples trouvent leur autorité non dans l’orateur, mais dans le texte fidèlement expliqué.",
      },
      {
        id: "b14",
        type: "verse",
        reference: "Psaume 119:105",
        version: LSG,
        text: "Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier.",
      },
      {
        id: "b15",
        type: "reflection",
        prompt: "Dans votre Église ou votre ministère, comment l’autorité de l’Écriture se manifeste-t-elle concrètement ? Donnez un exemple.",
      },
      { id: "b16", type: "quiz", assessmentId: "quiz-a1-01-l2", title: "Vérifier ma compréhension" },
    ],
  },
  {
    id: "a1-01-l3",
    courseId: "a1-01",
    order: 3,
    title: "Le canon des Écritures",
    summary: "Comment l’Église a reconnu les livres qui composent la Bible.",
    durationMinutes: 22,
    status: "published",
    demo: true,
    glossary: [],
    blocks: [
      {
        id: "b1",
        type: "paragraph",
        dropCap: true,
        text: "Le mot « canon » vient d’un terme grec désignant un roseau servant de règle à mesurer. Appliqué aux Écritures, il désigne la liste des livres reconnus comme la règle de la foi et de la vie.",
      },
      {
        id: "b2",
        type: "callout",
        tone: "note",
        title: "Leçon en cours de rédaction",
        text: "Le contenu complet de cette leçon de démonstration sera ajouté par l’enseignant.",
      },
    ],
  },
  {
    id: "a1-01-l4",
    courseId: "a1-01",
    order: 4,
    title: "Lire la Bible avec fruit",
    summary: "Observation, interprétation, application : une méthode simple pour l’étude personnelle.",
    durationMinutes: 24,
    status: "published",
    demo: true,
    glossary: [],
    blocks: [
      {
        id: "b1",
        type: "verse",
        reference: "Josué 1:8",
        version: LSG,
        text: "Que ce livre de la loi ne s’éloigne point de ta bouche ; médite-le jour et nuit, pour agir fidèlement selon tout ce qui y est écrit ; car c’est alors que tu auras du succès dans tes entreprises, c’est alors que tu réussiras.",
      },
      {
        id: "b2",
        type: "callout",
        tone: "note",
        title: "Leçon en cours de rédaction",
        text: "Le contenu complet de cette leçon de démonstration sera ajouté par l’enseignant.",
      },
    ],
  },
];

/** Plans de cours (titres seuls) pour donner corps aux autres cours du 1er trimestre. */
const OUTLINES: Record<string, string[]> = {
  "a1-02": ["Qu’est-ce que prêcher ?", "Du texte au message", "Structurer une prédication", "L’introduction et la conclusion", "Prêcher à son auditoire"],
  "a1-03": ["Le leadership serviteur", "La loyauté dans l’Écriture", "Anatomie de la déloyauté", "Restaurer la confiance"],
  "a1-04": ["Dieu se révèle", "Les attributs de Dieu", "La Trinité", "Dieu créateur et souverain"],
  "a1-05": ["Introduction aux épîtres générales", "Jacques : une foi agissante", "1 Pierre : espérance dans l’épreuve", "Les épîtres de Jean", "Jude : combattre pour la foi"],
  "a1-06": ["Greetings and introductions", "Reading a Bible verse in English", "Church vocabulary"],
};

export const DEMO_OUTLINE_LESSONS: Lesson[] = Object.entries(OUTLINES).flatMap(([courseId, titles]) =>
  titles.map((title, i) => ({
    id: `${courseId}-l${i + 1}`,
    courseId,
    order: i + 1,
    title,
    summary: "Leçon de démonstration — contenu à rédiger par l’enseignant.",
    durationMinutes: 20 + ((i * 7) % 12),
    status: "published" as const,
    demo: true,
    glossary: [],
    blocks: [
      {
        id: "b1",
        type: "callout" as const,
        tone: "note" as const,
        title: "Leçon en cours de rédaction",
        text: "Le contenu complet de cette leçon de démonstration sera ajouté par l’enseignant.",
      },
    ],
  })),
);

export const DEMO_QUIZ: Assessment = {
  id: "quiz-a1-01-l2",
  courseId: "a1-01",
  kind: "quiz",
  title: "L’inspiration des Écritures",
  description: "Quiz d’auto-évaluation de la leçon 2. Correction immédiate, tentatives illimitées.",
  durationMinutes: 10,
  maxAttempts: 0,
  status: "published",
  questions: [
    {
      id: "q1",
      type: "single",
      prompt: "Selon 2 Timothée 3:16, toute Écriture est…",
      points: 2,
      reference: "2 Tm 3:16",
      options: [
        { id: "a", label: "inspirée de Dieu" },
        { id: "b", label: "rédigée par des prophètes" },
        { id: "c", label: "réservée aux docteurs de la Loi" },
      ],
    },
    {
      id: "q2",
      type: "multiple",
      prompt: "D’après le même passage, l’Écriture est utile pour… (plusieurs réponses)",
      points: 4,
      options: [
        { id: "a", label: "enseigner" },
        { id: "b", label: "convaincre" },
        { id: "c", label: "divertir" },
        { id: "d", label: "corriger" },
        { id: "e", label: "instruire dans la justice" },
      ],
    },
    {
      id: "q3",
      type: "true_false",
      prompt: "2 Pierre 1:21 affirme que des hommes ont parlé de la part de Dieu, poussés par le Saint-Esprit.",
      points: 2,
      options: [
        { id: "true", label: "Vrai" },
        { id: "false", label: "Faux" },
      ],
    },
    {
      id: "q4",
      type: "verse_completion",
      prompt: "« Ta parole est une lampe à mes pieds, et une ______ sur mon sentier. »",
      reference: "Ps 119:105",
      points: 2,
    },
    {
      id: "q5",
      type: "ordering",
      prompt: "Remettez les quatre premiers livres de la Bible dans l’ordre.",
      points: 2,
      options: [
        { id: "num", label: "Nombres" },
        { id: "gen", label: "Genèse" },
        { id: "lev", label: "Lévitique" },
        { id: "exo", label: "Exode" },
      ],
    },
    {
      id: "q6",
      type: "matching",
      prompt: "Associez chaque livre à sa catégorie.",
      points: 4,
      pairs: {
        left: [
          { id: "gen", label: "Genèse" },
          { id: "act", label: "Actes" },
          { id: "rom", label: "Romains" },
          { id: "ps", label: "Psaumes" },
        ],
        right: [
          { id: "pent", label: "Pentateuque" },
          { id: "hist", label: "Livre historique" },
          { id: "ep", label: "Épître" },
          { id: "poet", label: "Livre poétique" },
        ],
      },
    },
    {
      id: "q7",
      type: "reflection",
      prompt: "En deux ou trois phrases : pourquoi l’inspiration de l’Écriture fonde-t-elle l’autorité de la prédication ?",
      points: 4,
    },
  ],
};

export const DEMO_QUIZ_KEY: AssessmentKey & { id: string } = {
  id: DEMO_QUIZ.id,
  assessmentId: DEMO_QUIZ.id,
  answers: {
    q1: { type: "single", optionId: "a" },
    q2: { type: "multiple", optionIds: ["a", "b", "d", "e"] },
    q3: { type: "true_false", optionId: "true" },
    q4: { type: "verse_completion", accepted: ["lumière", "lumiere", "une lumière"] },
    q5: { type: "ordering", order: ["gen", "exo", "lev", "num"] },
    q6: { type: "matching", pairs: { gen: "pent", act: "hist", rom: "ep", ps: "poet" } },
  },
};
