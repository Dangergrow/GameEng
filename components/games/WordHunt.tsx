"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Home, Timer, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getWordsForDifficulty, wordBanks } from "@/lib/words";
import { cn, validateDifficulty } from "@/lib/utils";
import type { Difficulty } from "@/types";

const GAME_DURATION = 90;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

const GRID_SIZE: Record<Difficulty, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
};

const MIN_WORD_LENGTH: Record<Difficulty, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
};

interface Cell {
  row: number;
  col: number;
  letter: string;
}

function getScore(word: string): number {
  const len = word.length;
  if (len === 3) return 10;
  if (len === 4) return 25;
  if (len === 5) return 50;
  return 100;
}

function findWordsInGrid(grid: string[][], minLen: number, wordBank: string[]): string[] {
  const size = grid.length;
  const found = new Set<string>();
  const wordSet = new Set(wordBank.map((w) => w.toLowerCase()));

  function dfs(row: number, col: number, path: string, visited: boolean[][]) {
    if (row < 0 || row >= size || col < 0 || col >= size || visited[row][col]) return;
    path += grid[row][col].toLowerCase();
    visited[row][col] = true;

    if (path.length >= minLen && wordSet.has(path)) {
      found.add(path);
    }

    if (path.length < 8) {
      for (const [dr, dc] of DIRECTIONS) {
        dfs(row + dr, col + dc, path, visited.map((r) => [...r]));
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const visited = grid.map((row) => row.map(() => false));
      dfs(r, c, "", visited);
    }
  }

  return Array.from(found);
}

function generateGrid(difficulty: Difficulty): { grid: string[][]; possibleWords: string[] } {
  const size = GRID_SIZE[difficulty];
  const minLen = MIN_WORD_LENGTH[difficulty];
  const words = getWordsForDifficulty(difficulty, 50).map((w) => w.word.toLowerCase());
  const shortWords = words.filter((w) => w.length >= minLen && w.length <= size + 2);

  const consonants = "bcdfghjklmnpqrstvwxyz";
  const vowels = "aeiou";

  for (let attempt = 0; attempt < 200; attempt++) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
    const seeded = new Set<string>();

    const candidates = shortWords.sort(() => Math.random() - 0.5);
    const roomToWork = Math.floor(size * size * 0.7);

    for (const word of candidates) {
      if (seeded.size >= 4) break;
      if (seeded.has(word)) continue;

      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * (size - Math.max(0, (word.length - 1) * Math.abs(dir[0]))));
      const col = Math.floor(Math.random() * (size - Math.max(0, (word.length - 1) * Math.abs(dir[1]))));

      let fits = true;
      const positions: { r: number; c: number; l: string }[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { fits = false; break; }
        if (grid[r][c] && grid[r][c] !== word[i]) { fits = false; break; }
        positions.push({ r, c, l: word[i] });
      }

      if (fits) {
        for (const { r, c, l } of positions) {
          grid[r][c] = l;
        }
        seeded.add(word);
      }
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) {
          const pool = Math.random() > 0.4 ? consonants : vowels;
          grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
        }
      }
    }

    const allWords = wordBanks[difficulty].map((w) => w.word.toLowerCase());
    const possibleWords = findWordsInGrid(grid, minLen, allWords);

    if (possibleWords.length >= 4) {
      return { grid, possibleWords };
    }
  }

  const fallback = consonants + vowels;
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => fallback[Math.floor(Math.random() * fallback.length)])
  );
  const allWords = wordBanks[difficulty].map((w) => w.word.toLowerCase());
  return { grid, possibleWords: findWordsInGrid(grid, minLen, allWords) };
}

function areAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function WordHunt() {
  const { difficulty: rawDiff, endGame, goToLobby } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [grid, setGrid] = useState<string[][]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<{ word: string; translation: string }[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<{ word: string; translation: string } | null>(null);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const gameRef = useRef<{ grid: string[][]; possibleWords: string[]; foundWords: string[] } | null>(null);

  useEffect(() => {
    const { grid: g, possibleWords: pw } = generateGrid(difficulty);
    setGrid(g);
    setPossibleWords(pw);
    gameRef.current = { grid: g, possibleWords: pw, foundWords: [] };
  }, [difficulty]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const finishGame = useCallback(() => {
    setIsPlaying(false);
    setIsFinished(true);
    if (!gameRef.current) return;
    const { possibleWords: pw, foundWords: fw } = gameRef.current;
    const foundSet = new Set(fw);
    const missed = pw.filter((w) => !foundSet.has(w));
    setMissedWords(missed);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying) return;
    const cell: Cell = { row, col, letter: grid[row][col] };

    if (selectedCells.length === 0) {
      setSelectedCells([cell]);
      return;
    }

    const lastIdx = selectedCells.findIndex((c) => c.row === row && c.col === col);
    if (lastIdx !== -1) {
      if (lastIdx === selectedCells.length - 1) {
        setSelectedCells([]);
      } else {
        setSelectedCells(selectedCells.slice(0, lastIdx + 1));
      }
      return;
    }

    const last = selectedCells[selectedCells.length - 1];
    if (areAdjacent(last, cell)) {
      setSelectedCells([...selectedCells, cell]);
    } else {
      setSelectedCells([cell]);
    }
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  const submitWord = () => {
    if (!isPlaying || selectedCells.length < MIN_WORD_LENGTH[difficulty]) return;

    const word = selectedCells.map((c) => c.letter).join("").toLowerCase();
    const wordEntry = wordBanks[difficulty].find((w) => w.word.toLowerCase() === word);

    if (!gameRef.current) return;

    if (gameRef.current.foundWords.includes(word)) {
      setToast({ word, translation: "уже найдено!" });
      setSelectedCells([]);
      return;
    }

    if (gameRef.current.possibleWords.includes(word) && wordEntry) {
      gameRef.current.foundWords.push(word);
      const newEntry = { word, translation: wordEntry.translation };
      setFoundWords((prev) => [...prev, newEntry]);
      const pts = getScore(word);
      setScore((s) => s + pts);
      speak(word);
      setToast(newEntry);

      if (word.length >= 6) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }

      if (selectedCells.length === grid.length * grid.length) {
        const bonus = grid.length * 25;
        setScore((s) => s + bonus);
      }
    }
    setSelectedCells([]);
  };

  const isSelected = (row: number, col: number) =>
    selectedCells.some((c) => c.row === row && c.col === col);

  const getSelectionOrder = (row: number, col: number) => {
    const idx = selectedCells.findIndex((c) => c.row === row && c.col === col);
    return idx !== -1 ? idx + 1 : null;
  };

  const currentWord = selectedCells.map((c) => c.letter).join("");

  if (grid.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Loading grid...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Confetti active={foundWords.length >= 5} />
        <motion.div className="glass-strong rounded-2xl p-8 max-w-lg w-full">
          <h2 className="text-3xl font-bold text-center mb-2 gradient-text">
            СловоЛов
          </h2>
          <p className="text-center text-gray-400 dark:text-white/50 mb-6">Время вышло!</p>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold font-mono gradient-text">{score}</div>
            <div className="text-sm text-gray-500 dark:text-white/50">очков</div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-white/50 mb-2">
              Найденные слова ({foundWords.length})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {foundWords.map((fw) => (
                <span key={fw.word} className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-mono">
                  {fw.word} — {fw.translation}
                </span>
              ))}
              {foundWords.length === 0 && (
                <span className="text-gray-500 dark:text-white/50 text-sm">Ни одного слова не найдено</span>
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-400 dark:text-white/50 mb-2">
              Пропущенные слова ({missedWords.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {missedWords.map((w) => {
                const entry = wordBanks[difficulty].find((e) => e.word.toLowerCase() === w);
                return (
                  <span key={w} className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-sm font-mono">
                    {w}{entry ? ` — ${entry.translation}` : ""}
                  </span>
                );
              })}
              {missedWords.length === 0 && (
                <span className="text-green-400 text-sm">Все слова найдены!</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                endGame({
                  gameId: "wordhunt",
                  score,
                  correct: foundWords.length,
                  wrong: Math.max(0, missedWords.length),
                  streak: foundWords.length >= 5 ? foundWords.length : 0,
                  timeSpent: GAME_DURATION - timer,
                });
                setTimeout(() => {
                  useGameStore.getState().startGame("wordhunt");
                }, 50);
              }}
              className="w-full gradient-primary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Ещё раз
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                endGame({
                  gameId: "wordhunt",
                  score,
                  correct: foundWords.length,
                  wrong: Math.max(0, missedWords.length),
                  streak: foundWords.length >= 5 ? foundWords.length : 0,
                  timeSpent: GAME_DURATION - timer,
                });
              }}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Завершить
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />

      <div className="sticky top-0 z-30 glass border-b border-gray-200 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => goToLobby()}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">В лобби</span>
          </button>

          <h2 className="text-lg font-bold font-mono gradient-text">СловоЛов</h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm font-mono font-bold">{score}</div>
            <motion.div
              className={`flex items-center gap-1 text-sm font-mono ${timer <= 10 ? "text-red-400" : "text-gray-600 dark:text-white/70"}`}
              animate={timer <= 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Timer className="w-4 h-4" />
              <span>{timer}s</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        {/* Difficulty badge */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
            {difficulty === "beginner" ? "3×3 · 3+ букв" : difficulty === "intermediate" ? "4×4 · 4+ букв" : "5×5 · 5+ букв"}
          </span>
        </div>

        {/* Grid */}
        <div
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
            maxWidth: `${grid.length * 80}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const sel = isSelected(r, c);
              const order = getSelectionOrder(r, c);
              const isHovered = hoveredCell?.row === r && hoveredCell?.col === c;
              const isAdjacentToLast = selectedCells.length > 0 && areAdjacent(selectedCells[selectedCells.length - 1], { row: r, col: c, letter });

              return (
                <motion.button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  onMouseLeave={handleCellMouseLeave}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center text-2xl font-bold font-mono transition-all duration-150 border-2 select-none",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    sel
                      ? "bg-green-500/30 border-green-400 text-green-300 shadow-lg shadow-green-500/20"
                      : isHovered
                      ? "bg-white/10 border-white/30"
                      : selectedCells.length > 0 && isAdjacentToLast
                      ? "bg-white/5 border-white/20"
                      : "bg-white/5 border-white/10 text-gray-700 dark:text-white/80 hover:bg-white/10 hover:border-white/30"
                  )}
                >
                  {letter.toUpperCase()}
                  {order !== null && (
                    <span className="absolute top-0.5 right-1 text-[10px] text-green-300 font-bold">
                      {order}
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Current word display */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentWord && (
              <motion.div
                key={currentWord}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xl font-mono font-bold tracking-widest gradient-text"
              >
                {currentWord.toUpperCase()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={submitWord}
            disabled={selectedCells.length < MIN_WORD_LENGTH[difficulty]}
            className="flex-1 gradient-primary"
          >
            <Search className="w-4 h-4 mr-1" />
            Найти
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedCells([])}
            disabled={selectedCells.length === 0}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Found words list */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-400 dark:text-white/50 mb-2">
            Найдено ({foundWords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {foundWords.map((fw) => (
              <span
                key={fw.word}
                className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 text-xs font-mono"
              >
                {fw.word}
              </span>
            ))}
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-green-500/90 text-white font-mono text-sm shadow-lg"
            >
              {toast.word} — {toast.translation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
