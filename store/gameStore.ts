"use client";

import { create } from "zustand";
import { Difficulty, GameId, GameStats, SessionResult, LearnedWord } from "@/types";
import { checkAchievements, checkSpecialAchievements } from "@/lib/achievements";

const STORAGE_KEY = "english-games-stats";
const COLLECTION_KEY = "word-collection";
const LEARNED_KEY = "learned-words";

interface GameState {
  screen: "lobby" | "playing" | "results";
  currentGame: GameId | null;
  difficulty: Difficulty;
  gameSession: number;
  sessionResult: SessionResult | null;
  stats: GameStats;
  wordCollection: string[];
  learnedWords: LearnedWord[];

  setScreen: (screen: "lobby" | "playing" | "results") => void;
  setCurrentGame: (game: GameId | null) => void;
  goToLobby: () => void;
  startGame: (game: GameId) => void;
  endGame: (result: SessionResult) => void;
  addCollectedWord: (word: string) => void;
  isWordCollected: (word: string) => boolean;
  removeCollectedWord: (word: string) => void;
  addLearnedWord: (word: string, translation: string) => void;
  removeLearnedWord: (word: string) => void;
  isWordLearned: (word: string) => boolean;
  resetLearnedWords: () => void;
  loadStats: () => void;
  saveStats: () => void;
  resetStats: () => void;
}

const defaultStats: GameStats = {
  totalGamesPlayed: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
  wordsCollected: 0,
  coins: 0,
  gamesByType: {
    wordvault: { played: 0, correct: 0, wrong: 0 },
    grammarforge: { played: 0, correct: 0, wrong: 0 },
    echochamber: { played: 0, correct: 0, wrong: 0 },
    spellstorm: { played: 0, correct: 0, wrong: 0 },
    idiomlab: { played: 0, correct: 0, wrong: 0 },
    wordhunt: { played: 0, correct: 0, wrong: 0 },
        tenseportal: { played: 0, correct: 0, wrong: 0 },
        phraseblast: { played: 0, correct: 0, wrong: 0 },
        synonymclash: { played: 0, correct: 0, wrong: 0 },
        dialoguebuilder: { played: 0, correct: 0, wrong: 0 },
        colorsnumbers: { played: 0, correct: 0, wrong: 0 },
    },
  achievements: [],
  lastPlayedDate: "",
  dailyIdiom: null,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (key === STORAGE_KEY) {
        return { ...defaultStats, ...parsed, gamesByType: { ...defaultStats.gamesByType, ...(parsed.gamesByType || {}) } };
      }
      return parsed;
    }
  } catch {}
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: "lobby",
  currentGame: null,
  difficulty: "intermediate",
  gameSession: 0,
  sessionResult: null,
  stats: defaultStats,
  wordCollection: [],
  learnedWords: [],

  setScreen: (screen) => set({ screen }),
  setCurrentGame: (game) => set({ currentGame: game }),

  goToLobby: () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    set({
      screen: "lobby",
      currentGame: null,
      sessionResult: null,
      gameSession: get().gameSession + 1,
    });
  },

  startGame: (game) => {
    const stats = get().stats;
    const nextSession = get().gameSession + 1;
    set({
      screen: "playing",
      currentGame: game,
      gameSession: nextSession,
      sessionResult: null,
      stats: {
        ...stats,
        lastPlayedDate: new Date().toISOString(),
      },
    });
    saveToStorage(STORAGE_KEY, get().stats);
  },

  endGame: (result) => {
    const state = get();
    const stats = { ...state.stats };
    stats.totalGamesPlayed++;
    stats.totalCorrect += result.correct;
    stats.totalWrong += result.wrong;
    if (result.streak > stats.bestStreak) {
      stats.bestStreak = result.streak;
    }
    stats.coins += result.score;
    stats.lastPlayedDate = new Date().toISOString();

    const gameType = result.gameId;
    if (stats.gamesByType[gameType]) {
      stats.gamesByType[gameType]!.played++;
      stats.gamesByType[gameType]!.correct += result.correct;
      stats.gamesByType[gameType]!.wrong += result.wrong;
    }

    const newAchievs = checkAchievements(stats);
    const specialAchievs = checkSpecialAchievements(
      stats,
      result.correct,
      result.correct + result.wrong,
      result.timeSpent
    );
    const allNew = [...newAchievs, ...specialAchievs];
    stats.achievements = [...stats.achievements, ...allNew.map((a) => a.id)];

    set({ screen: "results", sessionResult: result, stats });
    saveToStorage(STORAGE_KEY, stats);
  },

  addCollectedWord: (word) => {
    const collection = get().wordCollection;
    if (!collection.includes(word)) {
      const newCollection = [...collection, word];
      const stats = { ...get().stats, wordsCollected: newCollection.length };
      set({ wordCollection: newCollection, stats });
      saveToStorage(COLLECTION_KEY, newCollection);
      saveToStorage(STORAGE_KEY, stats);
    }
  },

  isWordCollected: (word) => get().wordCollection.includes(word),

  removeCollectedWord: (word) => {
    const newCollection = get().wordCollection.filter((w) => w !== word);
    const stats = { ...get().stats, wordsCollected: newCollection.length };
    set({ wordCollection: newCollection, stats });
    saveToStorage(COLLECTION_KEY, newCollection);
    saveToStorage(STORAGE_KEY, stats);
  },

  addLearnedWord: (word, translation) => {
    const current = get().learnedWords;
    if (current.some((w) => w.word === word)) return;
    const newLearned: LearnedWord = {
      word,
      translation,
      learnedAt: new Date().toISOString(),
    };
    const updated = [...current, newLearned];
    set({ learnedWords: updated });
    saveToStorage(LEARNED_KEY, updated);
  },

  removeLearnedWord: (word) => {
    const updated = get().learnedWords.filter((w) => w.word !== word);
    set({ learnedWords: updated });
    saveToStorage(LEARNED_KEY, updated);
  },

  isWordLearned: (word) => get().learnedWords.some((w) => w.word === word),

  resetLearnedWords: () => {
    set({ learnedWords: [] });
    saveToStorage(LEARNED_KEY, []);
  },

  loadStats: () => {
    const stats = loadFromStorage(STORAGE_KEY, defaultStats);
    const collection = loadFromStorage<string[]>(COLLECTION_KEY, []);
    const learned = loadFromStorage<LearnedWord[]>(LEARNED_KEY, []);
    set({ stats, wordCollection: collection, learnedWords: learned });
  },

  saveStats: () => {
    saveToStorage(STORAGE_KEY, get().stats);
    saveToStorage(COLLECTION_KEY, get().wordCollection);
  },

  resetStats: () => {
    set({ stats: { ...defaultStats }, wordCollection: [] });
    saveToStorage(STORAGE_KEY, defaultStats);
    saveToStorage(COLLECTION_KEY, []);
  },
}));
