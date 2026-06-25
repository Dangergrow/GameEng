"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { wordBanks } from "@/lib/words";
import { cn } from "@/lib/utils";

const BASE_SCORE = 20;
const HINT_PENALTY = 5;

interface Puzzle {
  start: string;
  target: string;
  bestPath: string[];
}

function getRandomWord(bank: string[], length: number): string {
  const filtered = bank.filter((w) => w.length === length);
  return filtered[Math.floor(Math.random() * filtered.length)] || bank[0];
}

function differsByOne(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}

function findShortestPath(start: string, target: string, wordSet: Set<string>): string[] | null {
  const queue: { word: string; path: string[] }[] = [{ word: start, path: [start] }];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const { word, path } = queue.shift()!;
    if (word === target) return path;

    for (const next of wordSet) {
      if (visited.has(next)) continue;
      if (differsByOne(word, next)) {
        visited.add(next);
        queue.push({ word: next, path: [...path, next] });
      }
    }
  }
  return null;
}

function generatePuzzle(length: number, wordBank: string[]): Puzzle | null {
  const words = [...new Set(wordBank.map((w) => w.toLowerCase()))].filter((w) => w.length === length);
  if (words.length < 10) return null;

  const wordSet = new Set(words);

  for (let attempt = 0; attempt < 200; attempt++) {
    const start = getRandomWord(words, length);
    const target = getRandomWord(words, length);
    if (start === target) continue;

    const path = findShortestPath(start, target, wordSet);
    if (path && path.length >= 3 && path.length <= 6) {
      return { start, target, bestPath: path };
    }
  }
  return null;
}

export function WordLadder() {
  const { endGame } = useGameStore();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userPath, setUserPath] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(5);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | "win" | "invalid"; msg: string } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const startNewRound = useCallback(() => {
    const bank = wordBanks.intermediate.map((w) => w.word);
    const wordLen = 4 + Math.floor(Math.random() * 2);
    const p = generatePuzzle(wordLen, bank);
    if (p) {
      setPuzzle(p);
      setUserPath([p.start]);
      setCurrentInput("");
      setFeedback(null);
      setHintsUsed(0);
    } else {
      startNewRound();
    }
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleSubmit = () => {
    if (!puzzle || !currentInput.trim() || gameOver) return;
    const word = currentInput.trim().toLowerCase();
    const bank = wordBanks.intermediate.map((w) => w.word.toLowerCase());
    const validWords = new Set(bank);

    if (!validWords.has(word)) {
      setFeedback({ type: "invalid", msg: `«${word}» — нет такого слова в словаре` });
      setCurrentInput("");
      return;
    }

    const lastWord = userPath[userPath.length - 1];
    if (!differsByOne(lastWord, word)) {
      setFeedback({ type: "wrong", msg: `«${word}» отличается от «${lastWord}» больше чем на одну букву` });
      setCurrentInput("");
      setStreak(0);
      return;
    }

    if (userPath.includes(word)) {
      setFeedback({ type: "wrong", msg: `«${word}» уже есть в цепочке` });
      setCurrentInput("");
      setStreak(0);
      return;
    }

    const newPath = [...userPath, word];
    setUserPath(newPath);

    if (word === puzzle.target) {
      const bonus = hintsUsed === 0 ? 30 : 0;
      const pts = BASE_SCORE + bonus - hintsUsed * HINT_PENALTY;
      setScore((s) => s + pts);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      setFeedback({ type: "win", msg: `Дошёл за ${newPath.length - 1} шагов! +${pts} очков` });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setScore((s) => s + BASE_SCORE);
      setStreak((s) => s + 1);
      setBestStreak((b) => Math.max(b, streak + 1));
      setFeedback({ type: "correct", msg: `+${BASE_SCORE} очков` });
    }
    setCurrentInput("");
    inputRef.current?.focus();
  };

  const handleNextRound = () => {
    if (round + 1 >= totalRounds) {
      setGameOver(true);
      endGame({
        gameId: "wordladder",
        score,
        correct: streak,
        wrong: 0,
        streak: bestStreak,
        timeSpent,
      });
      return;
    }
    setRound((r) => r + 1);
    startNewRound();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const showHint = () => {
    if (!puzzle || gameOver) return;
    setHintsUsed((h) => h + 1);
    const nextStep = puzzle.bestPath[puzzle.bestPath.indexOf(userPath[userPath.length - 1]) + 1];
    if (nextStep) {
      const letter = nextStep[0];
      setCurrentInput(letter.repeat(puzzle.start.length));
      setTimeout(() => {
        setCurrentInput("");
        setFeedback({ type: "correct", msg: `Подсказка: слово начинается на «${letter}...» (-${HINT_PENALTY} очков)` });
      }, 500);
    }
  };

  if (!puzzle) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500 dark:text-white/50">Генерация головоломки...</p></div>;
  }

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader title="Словесная Лестница" current={round + 1} total={totalRounds} streak={streak} score={score} />

      <div className="max-w-xl mx-auto px-4 pt-8">
        <motion.div
          key={round}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Раунд {round + 1} из {totalRounds}</Badge>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">
              Меняй по одной букве, чтобы дойти от первого слова до последнего. Все промежуточные слова должны быть настоящими.
            </p>
          </div>

          {/* Chain display */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col gap-2">
              {/* Start word */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center font-mono font-bold text-primary-400">
                  1
                </div>
                <span className="font-mono font-bold text-xl text-primary-400">{puzzle.start}</span>
              </div>

              {/* User path middle words */}
              {userPath.slice(1).map((w, i) => (
                <motion.div
                  key={`${w}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center font-mono font-bold text-green-400">
                    {i + 2}
                  </div>
                  <span className={cn(
                    "font-mono font-bold text-xl",
                    w === puzzle.target ? "text-green-400" : "text-green-300"
                  )}>
                    {w}
                    {w === puzzle.target && " ✓"}
                  </span>
                </motion.div>
              ))}

              {/* Target word */}
              {!userPath.includes(puzzle.target) && (
                <div className="flex items-center gap-2 opacity-40">
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-mono font-bold">
                    ?
                  </div>
                  <span className="font-mono font-bold text-xl">{puzzle.target}</span>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          {!userPath.includes(puzzle.target) && (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.toLowerCase())}
                onKeyDown={handleKeyDown}
                placeholder={`Слово из ${puzzle.start.length} букв...`}
                className="flex-1 text-lg font-mono text-center"
                autoFocus
              />
              <Button onClick={handleSubmit} disabled={!currentInput.trim() || gameOver}>
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={showHint} title={`Подсказка (-${HINT_PENALTY})`}>
                <Lightbulb className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "text-center p-4 rounded-xl font-medium",
                  feedback.type === "win" && "bg-green-500/10 text-green-400",
                  feedback.type === "correct" && "bg-green-500/10 text-green-400",
                  feedback.type === "wrong" && "bg-red-500/10 text-red-400",
                  feedback.type === "invalid" && "bg-amber-500/10 text-amber-400"
                )}
              >
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next round button */}
          {userPath.includes(puzzle.target) && (
            <Button onClick={handleNextRound} className="w-full gradient-primary">
              {round + 1 >= totalRounds ? "Результаты" : "Следующая лестница"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
