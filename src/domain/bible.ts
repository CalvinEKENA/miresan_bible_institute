/**
 * Parseur de références bibliques (noms et abréviations françaises).
 * Exemples acceptés : « Jean 3:16 », « Jn 3.16-18 », « 2 Tm 2:2 », « Éph 4:11-12 », « Ps 119 ».
 */
export interface BibleBook {
  id: string; // code OSIS
  name: string;
  abbr: string;
  testament: "AT" | "NT";
  aliases: string[];
}

const B = (id: string, name: string, abbr: string, testament: "AT" | "NT", aliases: string[] = []): BibleBook => ({
  id,
  name,
  abbr,
  testament,
  aliases,
});

export const BIBLE_BOOKS: BibleBook[] = [
  B("Gen", "Genèse", "Gn", "AT", ["gen"]),
  B("Exod", "Exode", "Ex", "AT", ["exo"]),
  B("Lev", "Lévitique", "Lv", "AT", ["lev"]),
  B("Num", "Nombres", "Nb", "AT", ["nom", "no"]),
  B("Deut", "Deutéronome", "Dt", "AT", ["deut", "deu"]),
  B("Josh", "Josué", "Jos", "AT"),
  B("Judg", "Juges", "Jg", "AT", ["jug"]),
  B("Ruth", "Ruth", "Rt", "AT", ["ru"]),
  B("1Sam", "1 Samuel", "1 S", "AT", ["1 sam", "1sa"]),
  B("2Sam", "2 Samuel", "2 S", "AT", ["2 sam", "2sa"]),
  B("1Kgs", "1 Rois", "1 R", "AT", ["1 ro"]),
  B("2Kgs", "2 Rois", "2 R", "AT", ["2 ro"]),
  B("1Chr", "1 Chroniques", "1 Ch", "AT", ["1 chr"]),
  B("2Chr", "2 Chroniques", "2 Ch", "AT", ["2 chr"]),
  B("Ezra", "Esdras", "Esd", "AT"),
  B("Neh", "Néhémie", "Né", "AT", ["neh"]),
  B("Esth", "Esther", "Est", "AT"),
  B("Job", "Job", "Jb", "AT"),
  B("Ps", "Psaumes", "Ps", "AT", ["psaume", "psa"]),
  B("Prov", "Proverbes", "Pr", "AT", ["prov"]),
  B("Eccl", "Ecclésiaste", "Ec", "AT", ["qo", "qohelet", "eccl"]),
  B("Song", "Cantique des cantiques", "Ct", "AT", ["cantique", "cant"]),
  B("Isa", "Ésaïe", "És", "AT", ["esaie", "isaie", "es", "is"]),
  B("Jer", "Jérémie", "Jr", "AT", ["jer"]),
  B("Lam", "Lamentations", "Lm", "AT", ["lam"]),
  B("Ezek", "Ézéchiel", "Éz", "AT", ["ez", "ezech"]),
  B("Dan", "Daniel", "Dn", "AT", ["dan"]),
  B("Hos", "Osée", "Os", "AT"),
  B("Joel", "Joël", "Jl", "AT"),
  B("Amos", "Amos", "Am", "AT"),
  B("Obad", "Abdias", "Ab", "AT", ["abd"]),
  B("Jonah", "Jonas", "Jon", "AT"),
  B("Mic", "Michée", "Mi", "AT"),
  B("Nah", "Nahum", "Na", "AT"),
  B("Hab", "Habacuc", "Ha", "AT", ["hab"]),
  B("Zeph", "Sophonie", "So", "AT", ["soph"]),
  B("Hag", "Aggée", "Ag", "AT"),
  B("Zech", "Zacharie", "Za", "AT", ["zach"]),
  B("Mal", "Malachie", "Ml", "AT", ["mal"]),
  B("Matt", "Matthieu", "Mt", "NT", ["matt"]),
  B("Mark", "Marc", "Mc", "NT", ["mr"]),
  B("Luke", "Luc", "Lc", "NT", ["lu"]),
  B("John", "Jean", "Jn", "NT", ["jea"]),
  B("Acts", "Actes", "Ac", "NT", ["actes des apotres"]),
  B("Rom", "Romains", "Rm", "NT", ["ro", "rom"]),
  B("1Cor", "1 Corinthiens", "1 Co", "NT", ["1 cor"]),
  B("2Cor", "2 Corinthiens", "2 Co", "NT", ["2 cor"]),
  B("Gal", "Galates", "Ga", "NT", ["gal"]),
  B("Eph", "Éphésiens", "Ép", "NT", ["eph", "ep"]),
  B("Phil", "Philippiens", "Ph", "NT", ["phil"]),
  B("Col", "Colossiens", "Col", "NT"),
  B("1Thess", "1 Thessaloniciens", "1 Th", "NT", ["1 thes"]),
  B("2Thess", "2 Thessaloniciens", "2 Th", "NT", ["2 thes"]),
  B("1Tim", "1 Timothée", "1 Tm", "NT", ["1 ti", "1 tim"]),
  B("2Tim", "2 Timothée", "2 Tm", "NT", ["2 ti", "2 tim"]),
  B("Titus", "Tite", "Tt", "NT", ["tit"]),
  B("Phlm", "Philémon", "Phm", "NT", ["philem"]),
  B("Heb", "Hébreux", "Hé", "NT", ["heb", "he"]),
  B("Jas", "Jacques", "Jc", "NT", ["jac"]),
  B("1Pet", "1 Pierre", "1 P", "NT", ["1 pi", "1 pie"]),
  B("2Pet", "2 Pierre", "2 P", "NT", ["2 pi", "2 pie"]),
  B("1John", "1 Jean", "1 Jn", "NT", ["1 jean"]),
  B("2John", "2 Jean", "2 Jn", "NT", ["2 jean"]),
  B("3John", "3 Jean", "3 Jn", "NT", ["3 jean"]),
  B("Jude", "Jude", "Jud", "NT"),
  B("Rev", "Apocalypse", "Ap", "NT", ["apoc", "apo"]),
];

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

const INDEX = new Map<string, BibleBook>();
for (const book of BIBLE_BOOKS) {
  for (const key of [book.name, book.abbr, book.id, ...book.aliases]) {
    INDEX.set(fold(key), book);
    INDEX.set(fold(key).replace(" ", ""), book);
  }
}

export function findBook(input: string): BibleBook | undefined {
  const key = fold(input);
  return INDEX.get(key) ?? INDEX.get(key.replace(" ", ""));
}

export interface BibleReference {
  book: BibleBook;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

const REF_PATTERN = /^\s*((?:[1-3]\s*)?[\p{L}][\p{L}.\s]*?)\s*(\d{1,3})(?:\s*[:.,]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?\s*$/u;

export function parseReference(input: string): BibleReference | null {
  const match = REF_PATTERN.exec(input);
  if (!match) return null;
  const [, rawBook, chapter, vStart, vEnd] = match;
  if (!rawBook || !chapter) return null;
  const book = findBook(rawBook);
  if (!book) return null;
  const ref: BibleReference = { book, chapter: Number(chapter) };
  if (vStart) ref.verseStart = Number(vStart);
  if (vEnd) ref.verseEnd = Number(vEnd);
  if (ref.verseStart && ref.verseEnd && ref.verseEnd < ref.verseStart) return null;
  return ref;
}

export function formatReference(ref: BibleReference, style: "long" | "short" = "long"): string {
  const name = style === "long" ? ref.book.name : ref.book.abbr;
  let out = `${name} ${ref.chapter}`;
  if (ref.verseStart) out += `:${ref.verseStart}`;
  if (ref.verseEnd) out += `-${ref.verseEnd}`;
  return out;
}
