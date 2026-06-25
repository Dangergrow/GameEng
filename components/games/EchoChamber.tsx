"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, RotateCcw, Lightbulb, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameHeader } from "@/components/shared/GameHeader";
import { PulseWave } from "@/components/shared/PulseWave";
import { useGameStore } from "@/store/gameStore";
import { getWordsForDifficulty } from "@/lib/words";
import { cn, validateDifficulty } from "@/lib/utils";
import { WordEntry } from "@/types";

const QUESTIONS_PER_ROUND = 10;
const BASE_SCORE = 15;

const phrases: Record<"beginner" | "intermediate" | "advanced", string[]> = {
  beginner: [
    "Hello, how are you?",
    "What time is it?",
    "Where is the station?",
    "I like coffee",
    "How much is this?",
    "My name is John",
    "Nice to meet you",
    "See you later",
  ],
  intermediate: [
    "I've been studying English for three years",
    "Could you tell me how to get to the museum?",
    "She would have come if she had known",
    "The meeting has been postponed until next week",
    "I'm looking forward to hearing from you",
    "It depends on the weather",
  ],
  advanced: [
    "Nevertheless, the implications of this discovery are profound",
    "Had I known about the circumstances, I would have acted differently",
    "The phenomenon has been extensively documented in scientific literature",
    "It goes without saying that thorough preparation is paramount",
    "The intricacies of the English language never cease to amaze me",
  ],
};

export function EchoChamber() {
  const { difficulty: rawDiff, endGame } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showLength, setShowLength] = useState(false);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [speed, setSpeed] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    const selected = getWordsForDifficulty(difficulty, QUESTIONS_PER_ROUND);
    setWords(selected);

    const items: string[] = [];
    if (difficulty === "beginner") {
      items.push(...selected.map((w) => w.word).slice(0, 7));
      items.push(...phrases.beginner.slice(0, 3));
    } else if (difficulty === "intermediate") {
      items.push(...selected.map((w) => w.word).slice(3, 10));
      items.push(...phrases.intermediate.slice(0, 3));
    } else {
      items.push(...selected.map((w) => w.word).slice(5, 10));
      items.push(...phrases.advanced.slice(0, 5));
    }
    const shuffled = items.sort(() => Math.random() - 0.5);
    setCurrentItems(shuffled);
  }, [difficulty]);

  const speak = useCallback(
    (text: string, rate = 1) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = speed * rate;
      utterance.pitch = 1;
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [speed]
  );

  useEffect(() => {
    if (currentItems.length > 0 && currentIndex < currentItems.length) {
      const timer = setTimeout(() => speak(currentItems[currentIndex], 1), 500);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis?.cancel();
      };
    }
  }, [currentIndex, currentItems]);

  const handlePlay = () => {
    if (currentItems[currentIndex]) speak(currentItems[currentIndex], 1);
  };

  const handlePlaySlow = () => {
    if (currentItems[currentIndex]) speak(currentItems[currentIndex], 0.6);
  };

  const handleSubmit = () => {
    if (answered) return;
    setAnswered(true);
    const current = currentItems[currentIndex].trim().toLowerCase();
    const input = userInput.trim().toLowerCase();

    const isClose = input === current || levenshteinDistance(input, current) <= 2;
    setIsCorrect(isClose);

    if (isClose) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      const penalty = hintPenalty;
      setScore((s) => s + Math.max(1, BASE_SCORE - penalty));
      setCorrectCount((c) => c + 1);
    } else {
      setStreak(0);
      setWrongCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= currentItems.length) {
      endGame({
        gameId: "echochamber",
        score,
        correct: correctCount + (isCorrect ? 1 : 0),
        wrong: wrongCount + (isCorrect ? 0 : 1),
        streak: bestStreak,
        timeSpent,
      });
      return;
    }

    setAnswered(false);
    setUserInput("");
    setIsCorrect(null);
    setShowHint(false);
    setShowLength(false);
    setHintPenalty(0);
    setCurrentIndex((i) => i + 1);
    inputRef.current?.focus();
  };

  const showFirstLetter = () => {
    setShowHint(true);
    setHintPenalty((p) => p + 1);
  };

  const showWordLength = () => {
    setShowLength(true);
    setHintPenalty((p) => p + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !answered) {
      handleSubmit();
    }
  };

  if (currentItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка...</p>
      </div>
    );
  }

  const current = currentItems[currentIndex];

  return (
    <div className="min-h-screen pb-8">
      <GameHeader
        title="Эхо-Камера"
        current={currentIndex + 1}
        total={currentItems.length}
        streak={streak}
        score={score}
      />

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Sound visualization */}
            <div className="flex flex-col items-center gap-6">
              <PulseWave active={isSpeaking} />

              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePlay}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14 p-0",
                    isSpeaking && "border-primary-400 animate-pulse-glow"
                  )}
                  disabled={isSpeaking}
                >
                  <Volume2 className="w-6 h-6" />
                </Button>

                <Button onClick={handlePlaySlow} variant="ghost" size="sm" disabled={isSpeaking}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Медленно
                </Button>

                <div className="flex gap-1">
                  {[0.8, 1, 1.2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={cn(
                        "px-2 py-1 rounded text-xs transition-colors",
                        speed === s ? "bg-primary-500/30 text-primary-300" : "text-gray-400 dark:text-white/40 hover:text-white"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input area */}
            <motion.div
              className="space-y-4"
              animate={isCorrect === false ? { x: [0, -10, 10, -10, 0] } : {}}
            >
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напиши, что слышишь..."
                  disabled={answered}
                  className={cn(
                    "text-xl md:text-2xl font-mono py-8 text-center bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/20",
                    "focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/30",
                    answered && isCorrect && "border-green-500 bg-green-500/5",
                    answered && !isCorrect && "border-red-500 bg-red-500/5"
                  )}
                />
              </div>

              {/* Hints */}
              {!answered && (
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showFirstLetter}
                    disabled={showHint}
                    className="text-gray-500 dark:text-white/50"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Первая буква (-1)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showWordLength}
                    disabled={showLength}
                    className="text-gray-500 dark:text-white/50"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Длина (-1)
                  </Button>
                </div>
              )}

              {showHint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-primary-400 font-mono text-lg"
                >
                  Первая буква: <span className="font-bold">{current[0]?.toUpperCase()}</span>
                </motion.p>
              )}

              {showLength && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-secondary-400 font-mono text-lg"
                >
                  {current.split(" ").length > 1
                    ? `${current.split(" ").length} слов(а)`
                    : `${current.length} букв`}
                </motion.p>
              )}
            </motion.div>

            {/* Submit / Feedback */}
            <AnimatePresence>
              {!answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button
                    onClick={handleSubmit}
                    className="w-full gradient-primary"
                    disabled={!userInput.trim()}
                  >
                    Проверить
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div
                    className={cn(
                      "glass-card rounded-xl p-4 text-center",
                      isCorrect ? "border-green-500/30" : "border-red-500/30"
                    )}
                  >
                    {isCorrect ? (
                      <p className="text-green-400 font-semibold text-lg">
                        Правильно!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-red-400 font-semibold">Не совсем!</p>
                        <p className="text-gray-600 dark:text-white/70">
                          Ты написал: <span className="text-red-300 font-mono">{userInput}</span>
                        </p>
                        <p className="text-gray-600 dark:text-white/70">
                          Правильно: <span className="text-green-300 font-mono">{current}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleNext} className="w-full gradient-primary">
                    {currentIndex + 1 >= currentItems.length ? "Результаты" : "Дальше"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
}
