"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Lightbulb } from "lucide-react";
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
}

const PUZZLES: Puzzle[] = [
  { start: "cat", target: "dog" },
  { start: "cold", target: "warm" },
  { start: "hand", target: "foot" },
  { start: "love", target: "hate" },
  { start: "life", target: "death" },
  { start: "hard", target: "soft" },
  { start: "dark", target: "light" },
  { start: "rich", target: "poor" },
  { start: "fast", target: "slow" },
  { start: "warm", target: "cool" },
  { start: "team", target: "work" },
  { start: "ship", target: "dock" },
  { start: "fire", target: "burn" },
  { start: "tree", target: "wood" },
  { start: "king", target: "lord" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    const shuffled = shuffle(PUZZLES);
    const p = shuffled[0];
    setPuzzle(p);
    setUserPath([p.start]);
    setCurrentInput("");
    setFeedback(null);
    setHintsUsed(0);
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
    const lastWord = userPath[userPath.length - 1];
    const bank = wordBanks.intermediate.map((w) => w.word.toLowerCase());
    const neighbor = bank.find((w) => differsByOne(lastWord, w) && !userPath.includes(w) && w !== puzzle.target);
    if (neighbor) {
      setFeedback({ type: "correct", msg: `Подсказка: попробуй «${neighbor}» (-${HINT_PENALTY} очков)` });
    } else {
      setFeedback({ type: "invalid", msg: "Нет подходящего слова. Попробуй сам!" });
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
