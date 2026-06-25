import type { Difficulty } from "@/types";

export interface SynonymEntry {
  word: string;
  translation: string;
  synonyms: string[];
}

const beginnerSynonyms: SynonymEntry[] = [
  {
    word: "big",
    translation: "большой",
    synonyms: ["large", "huge", "massive", "giant", "enormous", "tremendous"],
  },
  {
    word: "small",
    translation: "маленький",
    synonyms: ["little", "tiny", "miniature", "petite", "compact", "minute"],
  },
  {
    word: "happy",
    translation: "счастливый",
    synonyms: ["joyful", "glad", "pleased", "delighted", "content", "cheerful"],
  },
  {
    word: "sad",
    translation: "грустный",
    synonyms: ["unhappy", "sorrowful", "gloomy", "miserable", "downcast", "melancholy"],
  },
  {
    word: "fast",
    translation: "быстрый",
    synonyms: ["quick", "rapid", "swift", "speedy", "brisk", "hasty"],
  },
  {
    word: "smart",
    translation: "умный",
    synonyms: ["clever", "intelligent", "bright", "wise", "sharp", "brilliant"],
  },
  {
    word: "brave",
    translation: "храбрый",
    synonyms: ["courageous", "fearless", "bold", "heroic", "daring", "valiant"],
  },
  {
    word: "angry",
    translation: "злой",
    synonyms: ["mad", "furious", "irate", "enraged", "wrathful", "irritated"],
  },
  {
    word: "pretty",
    translation: "красивый",
    synonyms: ["beautiful", "lovely", "gorgeous", "attractive", "stunning", "elegant"],
  },
  {
    word: "rich",
    translation: "богатый",
    synonyms: ["wealthy", "affluent", "prosperous", "well-off", "opulent", "loaded"],
  },
  {
    word: "old",
    translation: "старый",
    synonyms: ["ancient", "aged", "elderly", "antique", "vintage", "senior"],
  },
  {
    word: "cold",
    translation: "холодный",
    synonyms: ["chilly", "freezing", "frigid", "icy", "frosty", "cool"],
  },
  {
    word: "hot",
    translation: "горячий",
    synonyms: ["warm", "scorching", "blazing", "sizzling", "sweltering", "boiling"],
  },
  {
    word: "kind",
    translation: "добрый",
    synonyms: ["nice", "gentle", "caring", "compassionate", "benevolent", "generous"],
  },
  {
    word: "strong",
    translation: "сильный",
    synonyms: ["powerful", "mighty", "sturdy", "tough", "robust", "muscular"],
  },
];

const intermediateSynonyms: SynonymEntry[] = [
  {
    word: "important",
    translation: "важный",
    synonyms: ["significant", "crucial", "essential", "vital", "paramount", "critical", "substantial"],
  },
  {
    word: "difficult",
    translation: "трудный",
    synonyms: ["challenging", "hard", "tough", "arduous", "demanding", "strenuous", "complex"],
  },
  {
    word: "interesting",
    translation: "интересный",
    synonyms: ["fascinating", "engaging", "captivating", "intriguing", "compelling", "absorbing"],
  },
  {
    word: "beautiful",
    translation: "красивый",
    synonyms: ["gorgeous", "stunning", "magnificent", "breathtaking", "exquisite", "splendid", "lovely"],
  },
  {
    word: "angry",
    translation: "злой",
    synonyms: ["furious", "enraged", "livid", "irate", "indignant", "wrathful", "incensed"],
  },
  {
    word: "tired",
    translation: "уставший",
    synonyms: ["exhausted", "fatigued", "weary", "drained", "worn-out", "spent", "lethargic"],
  },
  {
    word: "brave",
    translation: "храбрый",
    synonyms: ["courageous", "fearless", "valiant", "gallant", "heroic", "intrepid", "dauntless"],
  },
  {
    word: "strange",
    translation: "странный",
    synonyms: ["odd", "bizarre", "peculiar", "weird", "unusual", "eccentric", "quirky"],
  },
  {
    word: "careful",
    translation: "осторожный",
    synonyms: ["cautious", "prudent", "wary", "vigilant", "alert", "mindful", "heedful"],
  },
  {
    word: "friendly",
    translation: "дружелюбный",
    synonyms: ["amiable", "sociable", "cordial", "affable", "genial", "warm", "hospitable"],
  },
  {
    word: "expensive",
    translation: "дорогой",
    synonyms: ["costly", "pricey", "dear", "lavish", "extravagant", "high-priced", "premium"],
  },
  {
    word: "dangerous",
    translation: "опасный",
    synonyms: ["hazardous", "risky", "perilous", "treacherous", "threatening", "unsafe", "precarious"],
  },
  {
    word: "confident",
    translation: "уверенный",
    synonyms: ["self-assured", "poised", "assertive", "bold", "composed", "resolute", "fearless"],
  },
  {
    word: "calm",
    translation: "спокойный",
    synonyms: ["serene", "tranquil", "peaceful", "placid", "composed", "relaxed", "unruffled"],
  },
];

const advancedSynonyms: SynonymEntry[] = [
  {
    word: "ubiquitous",
    translation: "вездесущий",
    synonyms: ["omnipresent", "pervasive", "universal", "prevalent", "widespread", "everywhere", "all-over"],
  },
  {
    word: "ephemeral",
    translation: "эфемерный",
    synonyms: ["fleeting", "transient", "transitory", "momentary", "brief", "short-lived", "temporary"],
  },
  {
    word: "eloquent",
    translation: "красноречивый",
    synonyms: ["articulate", "expressive", "fluent", "silver-tongued", "persuasive", "well-spoken", "rhetorical"],
  },
  {
    word: "benevolent",
    translation: "благожелательный",
    synonyms: ["charitable", "altruistic", "philanthropic", "generous", "magnanimous", "humane", "kind-hearted"],
  },
  {
    word: "resilient",
    translation: "стойкий",
    synonyms: ["tough", "hardy", "tenacious", "indomitable", "unyielding", "durable", "steadfast"],
  },
  {
    word: "pragmatic",
    translation: "прагматичный",
    synonyms: ["practical", "realistic", "sensible", "rational", "logical", "utilitarian", "down-to-earth"],
  },
  {
    word: "ambiguous",
    translation: "двусмысленный",
    synonyms: ["vague", "unclear", "obscure", "cryptic", "enigmatic", "equivocal", "nebulous"],
  },
  {
    word: "meticulous",
    translation: "дотошный",
    synonyms: ["thorough", "precise", "painstaking", "scrupulous", "exacting", "diligent", "careful"],
  },
  {
    word: "verbose",
    translation: "многословный",
    synonyms: ["wordy", "long-winded", "prolix", "loquacious", "garrulous", "talkative", "rambling"],
  },
  {
    word: "tenacious",
    translation: "упорный",
    synonyms: ["persistent", "determined", "dogged", "unyielding", "stubborn", "relentless", "resolute"],
  },
  {
    word: "candid",
    translation: "откровенный",
    synonyms: ["frank", "honest", "blunt", "forthright", "straightforward", "sincere", "direct"],
  },
  {
    word: "lucid",
    translation: "ясный",
    synonyms: ["clear", "intelligible", "comprehensible", "coherent", "transparent", "pellucid", "plain"],
  },
  {
    word: "surreptitious",
    translation: "тайный",
    synonyms: ["secret", "covert", "clandestine", "stealthy", "furtive", "underhand", "sneaky"],
  },
  {
    word: "gregarious",
    translation: "общительный",
    synonyms: ["sociable", "outgoing", "extroverted", "convivial", "affable", "companionable", "hail-fellow-well-met"],
  },
];

const allSynonyms: Record<Difficulty, SynonymEntry[]> = {
  beginner: beginnerSynonyms,
  intermediate: intermediateSynonyms,
  advanced: advancedSynonyms,
};

export function getSynonymsForDifficulty(
  difficulty: Difficulty,
  count: number
): SynonymEntry[] {
  const pool = [...(allSynonyms[difficulty] ?? allSynonyms.beginner)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function isValidSynonym(entry: SynonymEntry, candidate: string): boolean {
  return entry.synonyms.some(
    (s) => s.toLowerCase().trim() === candidate.toLowerCase().trim()
  );
}
