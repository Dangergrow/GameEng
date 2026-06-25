export type Difficulty = "beginner" | "intermediate" | "advanced";

export type GameId = "wordvault" | "grammarforge" | "echochamber" | "spellstorm" | "idiomlab" | "wordhunt" | "tenseportal" | "phraseblast" | "synonymclash" | "dialoguebuilder" | "colorsnumbers" | "wordladder" | "memorymatch" | "anagramscramble";

export interface WordEntry {
  word: string;
  translation: string;
  definition: string;
  example: string;
  transcription: string;
  synonyms: string[];
  topic: string;
  rarity: "common" | "uncommon" | "rare";
}

export interface GrammarTemplate {
  sentence: string;
  options: string[];
  correct: string;
  placeholder: string;
  category: GrammarCategory;
  explanation: string;
}

export type GrammarCategory = "tenses" | "prepositions" | "conditionals" | "articles" | "reported-speech" | "modals";

export interface IdiomEntry {
  idiom: string;
  meaning: string;
  origin: string;
  example: string;
  category: IdiomCategory;
}

export type IdiomCategory = "business" | "everyday" | "phrasal-verbs" | "proverbs";

export interface GameConfig {
  id: GameId;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  wordsCollected: number;
  coins: number;
  gamesByType: Record<GameId, { played: number; correct: number; wrong: number }>;
  achievements: string[];
  lastPlayedDate: string;
  dailyIdiom: { idiom: string; meaning: string; date: string } | null;
}

export interface SessionResult {
  gameId: GameId;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
  wordsLearned?: string[];
  timeSpent: number;
  errors?: { question: string; userAnswer: string; correctAnswer: string }[];
}

export interface LearnedWord {
  word: string;
  translation: string;
  learnedAt: string;
}
