/** Versets du jour — Louis Segond 1910 (domaine public). */
export const DAILY_VERSES = [
  { ref: "Psaume 119:105", text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier." },
  { ref: "Josué 1:9", text: "Ne t’ai-je pas donné cet ordre : Fortifie-toi et prends courage ? Ne t’effraie point et ne t’épouvante point, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." },
  { ref: "2 Timothée 2:15", text: "Efforce-toi de te présenter devant Dieu comme un homme éprouvé, un ouvrier qui n’a point à rougir, qui dispense droitement la parole de la vérité." },
  { ref: "Colossiens 3:23", text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes." },
  { ref: "Proverbes 1:7", text: "La crainte de l’Éternel est le commencement de la science ; les insensés méprisent la sagesse et l’instruction." },
  { ref: "Ésaïe 40:31", text: "Mais ceux qui se confient en l’Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; ils courent, et ne se lassent point, ils marchent, et ne se fatiguent point." },
  { ref: "Romains 12:2", text: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l’intelligence." },
] as const;

export function verseOfTheDay(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  return DAILY_VERSES[day % DAILY_VERSES.length]!;
}
