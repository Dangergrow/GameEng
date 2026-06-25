"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronRight, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getWordsForDifficulty } from "@/lib/words";
import { cn, validateDifficulty } from "@/lib/utils";
import { WordEntry } from "@/types";

const WORDS_PER_ROUND = 10;
const BASE_SCORE = 20;
const SPEED_MODE_SECONDS = 60;

const trickyWords: WordEntry[] = [
  {
    word: "through",
    translation: "через, сквозь",
    definition: "Moving in one side and out of the other side",
    example: "The train went through the tunnel.",
    transcription: "[θruː]",
    synonyms: ["via", "across"],
    topic: "daily-life",
    rarity: "common",
  },
  {
    word: "though",
    translation: "хотя",
    definition: "Despite the fact that; however",
    example: "Though it was raining, we went out.",
    transcription: "[ðoʊ]",
    synonyms: ["although", "however"],
    topic: "daily-life",
    rarity: "common",
  },
  {
    word: "tough",
    translation: "жёсткий, трудный",
    definition: "Strong, difficult to break or endure",
    example: "This steak is really tough.",
    transcription: "[tʌf]",
    synonyms: ["hard", "difficult", "resilient"],
    topic: "daily-life",
    rarity: "common",
  },
  {
    word: "thorough",
    translation: "тщательный",
    definition: "Complete with regard to every detail",
    example: "She did a thorough cleaning of the house.",
    transcription: "[ˈθɜːroʊ]",
    synonyms: ["comprehensive", "meticulous", "exhaustive"],
    topic: "daily-life",
    rarity: "uncommon",
  },
  {
    word: "thought",
    translation: "мысль",
    definition: "An idea or opinion produced by thinking",
    example: "I just had an interesting thought.",
    transcription: "[θɔːt]",
    synonyms: ["idea", "notion", "concept"],
    topic: "daily-life",
    rarity: "common",
  },
  {
    word: "throughout",
    translation: "на протяжении",
    definition: "In every part of; during the whole period",
    example: "It rained throughout the day.",
    transcription: "[θruːˈaʊt]",
    synonyms: ["during", "across", "all over"],
    topic: "daily-life",
    rarity: "uncommon",
  },
];

export function Spellstorm() {
  const { difficulty: rawDiff, endGame } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [speedMode, setSpeedMode] = useState(false);
  const [speedTimer, setSpeedTimer] = useState(SPEED_MODE_SECONDS);
  const [letterDiff, setLetterDiff] = useState<{ correct: string[]; wrong: string[] } | null>(null);

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
    if (speedMode && speedTimer > 0) {
      const timer = setInterval(() => {
        setSpeedTimer((t) => {
          if (t <= 1) {
            clearInterval(timer);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [speedMode, speedTimer]);

  useEffect(() => {
    if (speedMode && speedTimer === 0) {
      endGame({
        gameId: "spellstorm",
        score,
        correct: correctCount,
        wrong: wrongCount + (answered ? 0 : 1),
        streak: bestStreak,
        timeSpent,
      });
    }
  }, [speedTimer, speedMode]);

  useEffect(() => {
    const selected = getWordsForDifficulty(difficulty, WORDS_PER_ROUND);
    if (difficulty === "advanced") {
      const mixed = [...selected.slice(0, 6), ...trickyWords.slice(0, 4)];
      setWords(mixed.sort(() => Math.random() - 0.5));
    } else {
      setWords(selected);
    }
  }, [difficulty]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const checkSpelling = () => {
    if (answered || !userInput.trim()) return;

    const current = words[currentIndex].word;
    const input = userInput.trim().toLowerCase();
    const currentLower = current.toLowerCase();
    const newAttempts = attempts + 1;

    if (input === currentLower) {
      setIsCorrect(true);
      setAnswered(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      const bonus = attempts === 0 ? BASE_SCORE : Math.max(5, BASE_SCORE - attempts * 5);
      setScore((s) => s + bonus);
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
      setLetterDiff(null);
    } else if (newAttempts >= 3) {
      setIsCorrect(false);
      setAnswered(true);
      setStreak(0);
      setWrongCount((c) => c + 1);
      computeDiff(input, current);
    } else {
      setAttempts(newAttempts);
      computeDiff(input, current);
      setIsCorrect(false);
    }

    speak(current);
  };

  const computeDiff = (input: string, correct: string) => {
    const maxLen = Math.max(input.length, correct.length);
    const correctLetters: string[] = [];
    const wrongLetters: string[] = [];

    for (let i = 0; i < maxLen; i++) {
      if (i < correct.length) {
        if (i < input.length && input[i] === correct[i]) {
          correctLetters.push(correct[i]);
        } else {
          wrongLetters.push(i < correct.length ? correct[i] : "");
        }
      }
    }

    setLetterDiff({ correct: correctLetters, wrong: wrongLetters });
  };

  const handleNext = () => {
    if (currentIndex + 1 >= words.length || (speedMode && speedTimer <= 0)) {
      endGame({
        gameId: "spellstorm",
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
    setAttempts(0);
    setLetterDiff(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !answered) {
      checkSpelling();
    }
  };

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка слов...</p>
      </div>
    );
  }

  const word = words[currentIndex];

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="СпеллШторм"
        current={currentIndex + 1}
        total={speedMode ? Infinity : words.length}
        streak={streak}
        score={score}
        timer={speedMode ? speedTimer : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Speed mode toggle */}
            {!speedMode && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSpeedMode(true)}
                  className="text-amber-400 border-amber-500/30"
                >
                  <Timer className="w-4 h-4 mr-1" />
                  На скорость (60с)
                </Button>
              </div>
            )}

            {/* Translation display */}
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              animate={answered && isCorrect ? { borderColor: "rgba(34, 197, 94, 0.3)" } : answered && !isCorrect ? { x: [0, -10, 10, -10, 0] } : {}}
            >
              <p className="text-sm text-gray-400 dark:text-white/40 mb-3">Переведи и напиши:</p>
              <h3 className="text-3xl font-bold mb-4">{word.translation}</h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(word.word)}
                className="text-primary-400"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Прослушать
              </Button>

              {/* Attempts indicator */}
              <div className="flex justify-center gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      i < attempts ? "bg-red-400" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </motion.div>

            {/* Wordle-style letter display */}
            {letterDiff && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-1 flex-wrap"
              >
                {word.word.split("").map((letter, i) => {
                  const isCorrectLetter =
                    i < userInput.length && userInput[i].toLowerCase() === letter.toLowerCase();
                  return (
                    <motion.span
                      key={i}
                      initial={{ rotateX: 90 }}
                      animate={{ rotateX: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "w-10 h-12 flex items-center justify-center rounded-lg font-mono font-bold text-lg border-2",
                        isCorrectLetter
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : i < userInput.length
                          ? "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-300 dark:text-white/30"
                      )}
                    >
                      {letter.toUpperCase()}
                    </motion.span>
                  );
                })}
              </motion.div>
            )}

            {/* Input */}
            <div className="relative">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напиши слово по-английски..."
                disabled={answered}
                className={cn(
                  "text-xl md:text-2xl font-mono py-8 text-center bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/20",
                  answered && isCorrect && "border-green-500 bg-green-500/5",
                  answered && !isCorrect && attempts >= 3 && "border-red-500 bg-red-500/5"
                )}
                autoFocus
              />
            </div>

            {/* Actions */}
            <AnimatePresence>
              {!answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button
                    onClick={checkSpelling}
                    className="w-full gradient-primary"
                    disabled={!userInput.trim()}
                  >
                    Проверить
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <p className="text-center text-xs text-gray-300 dark:text-white/30 mt-2">
                    Попыток: {attempts}/3
                  </p>
                </motion.div>
              )}

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {isCorrect ? (
                    <div className="glass-card rounded-xl p-4 border-green-500/30 text-center">
                      <p className="text-green-400 font-semibold text-lg">
                        Правильно! +{attempts === 0 ? BASE_SCORE : Math.max(5, BASE_SCORE - attempts * 5)} очков
                      </p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-4 border-red-500/30 text-center">
                      <p className="text-red-400 mb-2">Попытки кончились!</p>
                      <p className="text-gray-600 dark:text-white/70">
                        Правильное слово:{" "}
                        <span className="text-green-400 font-mono text-lg">{word.word}</span>
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
        </AnimatePresence>
      </div>
    </div>
  );
}
