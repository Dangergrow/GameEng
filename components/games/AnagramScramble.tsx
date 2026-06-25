"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { wordBanks } from "@/lib/words";
import { cn } from "@/lib/utils";

const TOTAL_WORDS = 12;
const BASE_SCORE = 15;
const TIME_PER_WORD = 25;

function shuffleLetters(word: string): string {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join("");
  if (result === word) return shuffleLetters(word);
  return result;
}

export function AnagramScramble() {
  const { endGame } = useGameStore();
  const [words, setWords] = useState<{ en: string; ru: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [timer, setTimer] = useState(TIME_PER_WORD);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeSpent(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  useEffect(() => {
    if (answered || gameOver) return;
    if (timer <= 0) {
      handleTimeout();
      return;
    }
    const t = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer, answered, gameOver]);

  useEffect(() => {
    const bank = wordBanks.intermediate;
    const selected = bank
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL_WORDS)
      .map((w) => ({ en: w.word, ru: w.translation }));
    setWords(selected);
    if (selected.length > 0) {
      setScrambled(shuffleLetters(selected[0].en));
    }
  }, []);

  const handleTimeout = () => {
    setAnswered(true);
    setIsCorrect(false);
    setWrongCount((c) => c + 1);
    setStreak(0);
  };

  const handleSubmit = () => {
    if (answered || gameOver || !userInput.trim()) return;
    setAnswered(true);

    const correct = userInput.trim().toLowerCase() === words[currentIndex]?.en.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.floor(timer / 2);
      const hintPenalty = hintsUsed * 3;
      const pts = Math.max(5, BASE_SCORE + timeBonus - hintPenalty);
      setScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setWrongCount((c) => c + 1);
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= words.length) {
      setGameOver(true);
      endGame({
        gameId: "anagramscramble",
        score,
        correct: correctCount + (isCorrect ? 1 : 0),
        wrong: wrongCount + (isCorrect ? 0 : 1),
        streak: bestStreak,
        timeSpent,
      });
      return;
    }

    const next = currentIndex + 1;
    setCurrentIndex(next);
    setScrambled(shuffleLetters(words[next].en));
    setUserInput("");
    setTimer(TIME_PER_WORD);
    setAnswered(false);
    setIsCorrect(null);
    setHint(null);
    setHintsUsed(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const showHint = () => {
    if (!words[currentIndex]) return;
    setHintsUsed((h) => h + 1);
    const word = words[currentIndex].en;
    const revealCount = Math.min(hintsUsed + 1, word.length - 1);
    const hintStr = word.slice(0, revealCount) + "_".repeat(word.length - revealCount);
    setHint(hintStr);
  };

  if (words.length === 0) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500 dark:text-white/50">Загрузка...</p></div>;
  }

  const word = words[currentIndex];
  const progressPercent = ((correctCount + wrongCount + (answered ? 1 : 0)) / TOTAL_WORDS) * 100;

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="Анаграммы"
        current={currentIndex + 1}
        total={TOTAL_WORDS}
        streak={streak}
        score={score}
        timer={timer}
      />

      <div className="max-w-xl mx-auto px-4 pt-8">
        {word && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={isCorrect === true ? { opacity: 1, scale: [1, 1.03, 1] } : isCorrect === false ? { opacity: 1, x: [0, -12, 12, -8, 8, 0] } : { opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Scrambled letters */}
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm text-gray-400 dark:text-white/50 mb-2">Расставь буквы правильно</p>
              <div className="flex justify-center gap-2 flex-wrap mb-4">
                {scrambled.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ rotate: 0, y: 0 }}
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="w-10 h-12 rounded-lg bg-primary-500/15 flex items-center justify-center font-mono font-bold text-2xl text-primary-400 border border-primary-500/30"
                  >
                    {letter.toUpperCase()}
                  </motion.span>
                ))}
              </div>
              <p className="text-gray-400 dark:text-white/40 text-sm">
                Перевод: <span className="text-gray-700 dark:text-white/70">{word.ru}</span>
              </p>
              {hint && (
                <p className="mt-2 font-mono text-primary-400 text-sm">
                  Подсказка: {hint}
                </p>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Слово из ${scrambled.length} букв...`}
                disabled={answered}
                className={cn(
                  "flex-1 text-xl font-mono text-center py-8",
                  isCorrect === true && "border-green-500 bg-green-500/5",
                  isCorrect === false && "border-red-500 bg-red-500/5"
                )}
                autoFocus
              />
              <Button onClick={showHint} variant="outline" disabled={answered} title="Подсказка (-3 очка)">
                <Lightbulb className="w-4 h-4" />
              </Button>
            </div>

            {/* Submit / Feedback */}
            {!answered && (
              <Button onClick={handleSubmit} className="w-full gradient-primary" disabled={!userInput.trim()}>
                Проверить
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            <AnimatePresence>
              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {isCorrect ? (
                    <div className="glass-card rounded-xl p-4 border-green-500/30 text-center">
                      <Check className="w-8 h-8 text-green-400 mx-auto mb-1" />
                      <p className="text-green-400 font-semibold text-lg">Правильно!</p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-4 border-red-500/30 text-center">
                      <X className="w-8 h-8 text-red-400 mx-auto mb-1" />
                      <p className="text-red-400 font-semibold">Неправильно</p>
                      <p className="text-gray-500 dark:text-white/50 mt-1">
                        Правильный ответ:{" "}
                        <span className="text-green-400 font-mono font-bold text-lg">{word.en}</span>
                      </p>
                    </div>
                  )}

                  <Button onClick={handleNext} className="w-full gradient-primary">
                    {currentIndex + 1 >= words.length ? "Результаты" : "Следующее слово"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
