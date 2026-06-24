"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, Palette, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";

const TOTAL_ROUNDS = 15;
const BASE_SCORE = 10;

interface ColorEntry {
  name: string;
  answers: string[];
  hex: string;
}

const colors: ColorEntry[] = [
  { name: "red", answers: ["красный"], hex: "#E53935" },
  { name: "blue", answers: ["синий"], hex: "#1E88E5" },
  { name: "green", answers: ["зелёный", "зеленый"], hex: "#43A047" },
  { name: "yellow", answers: ["жёлтый", "желтый"], hex: "#FDD835" },
  { name: "orange", answers: ["оранжевый"], hex: "#FB8C00" },
  { name: "purple", answers: ["фиолетовый"], hex: "#8E24AA" },
  { name: "pink", answers: ["розовый"], hex: "#EC407A" },
  { name: "brown", answers: ["коричневый"], hex: "#6D4C41" },
  { name: "black", answers: ["чёрный", "черный"], hex: "#212121" },
  { name: "white", answers: ["белый"], hex: "#F5F5F5" },
  { name: "gray", answers: ["серый"], hex: "#9E9E9E" },
  { name: "cyan", answers: ["голубой"], hex: "#00BCD4" },
  { name: "lime", answers: ["лаймовый"], hex: "#C0CA33" },
  { name: "violet", answers: ["лиловый"], hex: "#7B1FA2" },
  { name: "teal", answers: ["зелёно-голубой", "зелено-голубой"], hex: "#00897B" },
  { name: "gold", answers: ["золотой"], hex: "#FFB300" },
  { name: "silver", answers: ["серебряный"], hex: "#BDBDBD" },
  { name: "beige", answers: ["бежевый"], hex: "#D7CCC8" },
  { name: "coral", answers: ["коралловый"], hex: "#FF7043" },
  { name: "navy", answers: ["тёмно-синий", "темно-синий"], hex: "#1A237E" },
  { name: "crimson", answers: ["малиновый"], hex: "#C62828" },
  { name: "indigo", answers: ["индиго"], hex: "#3949AB" },
  { name: "turquoise", answers: ["бирюзовый"], hex: "#26A69A" },
  { name: "maroon", answers: ["каштановый"], hex: "#7B1F1F" },
  { name: "olive", answers: ["оливковый"], hex: "#827717" },
  { name: "mint", answers: ["мятный"], hex: "#81C784" },
  { name: "lavender", answers: ["лавандовый"], hex: "#B39DDB" },
  { name: "peach", answers: ["персиковый"], hex: "#FFAB91" },
  { name: "chocolate", answers: ["шоколадный"], hex: "#5D4037" },
  { name: "burgundy", answers: ["бордовый"], hex: "#880E4F" },
  { name: "magenta", answers: ["пурпурный", "маджента"], hex: "#D81B60" },
  { name: "salmon", answers: ["лососевый"], hex: "#F48FB1" },
  { name: "khaki", answers: ["хаки"], hex: "#A69B7C" },
  { name: "plum", answers: ["сливовый"], hex: "#AD1457" },
  { name: "tan", answers: ["песочный"], hex: "#BCAAA4" },
  { name: "aqua", answers: ["аквамариновый", "аквамарин", "аква"], hex: "#00E5A0" },
  { name: "ivory", answers: ["слоновая кость", "айвори"], hex: "#FFF8E1" },
  { name: "azure", answers: ["лазурный"], hex: "#2979FF" },
  { name: "ruby", answers: ["рубиновый"], hex: "#C2185B" },
  { name: "emerald", answers: ["изумрудный"], hex: "#2E7D32" },
  { name: "sapphire", answers: ["сапфировый"], hex: "#1565C0" },
  { name: "sky blue", answers: ["небесно-голубой", "голубой"], hex: "#64B5F6" },
];

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.55;
}

function numberToWords(n: number): string {
  if (n === 1000) return "one thousand";

  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen",
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
  ];

  const h = Math.floor(n / 100);
  const remainder = n % 100;

  let result = "";

  if (h > 0) {
    result += ones[h] + " hundred";
    if (remainder > 0) {
      result += " and ";
    }
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += ones[remainder];
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      result += tens[t];
      if (o > 0) {
        result += "-" + ones[o];
      }
    }
  }

  return result;
}

export function ColorsNumbers() {
  const { endGame } = useGameStore();

  const [mode, setMode] = useState<"colors" | "numbers">("colors");
  const [colorIndex, setColorIndex] = useState(() => Math.floor(Math.random() * colors.length));
  const [numberValue, setNumberValue] = useState(() => Math.floor(Math.random() * 1000) + 1);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [round, setRound] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pickColor = useCallback(() => {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * colors.length);
    } while (idx === colorIndex && colors.length > 1);
    setColorIndex(idx);
  }, [colorIndex]);

  const pickNumber = useCallback(() => {
    let num: number;
    do {
      num = Math.floor(Math.random() * 1000) + 1;
    } while (num === numberValue);
    setNumberValue(num);
  }, [numberValue]);

  const advanceOrEnd = useCallback(
    (finalScore: number, finalCorrect: number, finalWrong: number, finalBestStreak: number) => {
      if (round + 1 >= TOTAL_ROUNDS) {
        endGame({
          gameId: "colorsnumbers",
          score: finalScore,
          correct: finalCorrect,
          wrong: finalWrong,
          streak: finalBestStreak,
          timeSpent,
        });
        return;
      }
      setRound((r) => r + 1);
      setAnswered(false);
      setUserInput("");
      setIsCorrect(null);
      if (mode === "colors") {
        pickColor();
      } else {
        pickNumber();
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [round, timeSpent, mode, endGame, pickColor, pickNumber]
  );

  const handleSubmit = useCallback(() => {
    if (answered || !userInput.trim()) return;
    setAnswered(true);

    const input = userInput.trim().toLowerCase();

    if (mode === "colors") {
      const color = colors[colorIndex];
      const isCorrectAnswer = color.answers.some((a) => a.toLowerCase() === input);
      setCorrectAnswer(color.answers[0]);

      if (isCorrectAnswer) {
        handleCorrect();
      } else {
        handleWrong();
      }
    } else {
      const parsed = parseInt(input, 10);
      const isCorrectAnswer = !isNaN(parsed) && parsed === numberValue;
      setCorrectAnswer(numberValue.toString());

      if (isCorrectAnswer) {
        handleCorrect();
      } else {
        handleWrong();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, userInput, mode, colorIndex, numberValue]);

  const handleCorrect = useCallback(() => {
    setIsCorrect(true);
    const newStreak = streak + 1;
    const streakBonus = Math.min(newStreak, 5);
    const newScore = score + BASE_SCORE + streakBonus;

    setStreak(newStreak);
    setBestStreak((prev) => Math.max(prev, newStreak));
    setScore(newScore);
    setCorrectCount((prev) => prev + 1);
    setShowConfetti(true);

    setTimeout(() => setShowConfetti(false), 1500);
    setTimeout(() => {
      advanceOrEnd(newScore, correctCount + 1, wrongCount, Math.max(bestStreak, newStreak));
    }, 1000);
  }, [streak, score, correctCount, wrongCount, bestStreak, advanceOrEnd]);

  const handleWrong = useCallback(() => {
    setIsCorrect(false);
    setStreak(0);
    setWrongCount((prev) => prev + 1);

    setTimeout(() => {
      advanceOrEnd(score, correctCount, wrongCount + 1, bestStreak);
    }, 1500);
  }, [score, correctCount, wrongCount, bestStreak, advanceOrEnd]);

  const handleTabChange = useCallback(
    (value: string) => {
      const newMode = value as "colors" | "numbers";
      if (newMode === mode) return;
      setMode(newMode);
      setAnswered(false);
      setUserInput("");
      setIsCorrect(null);
      if (newMode === "colors") {
        pickColor();
      } else {
        pickNumber();
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [mode, pickColor, pickNumber]
  );

  const handleEndGame = useCallback(() => {
    endGame({
      gameId: "colorsnumbers",
      score,
      correct: correctCount,
      wrong: wrongCount,
      streak: bestStreak,
      timeSpent,
    });
  }, [endGame, score, correctCount, wrongCount, bestStreak, timeSpent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const displayScore = score;
  const displayRound = round;
  const total = TOTAL_ROUNDS;

  const colorsModeContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-white/50">
          Раунд {displayRound + 1} из {total}
        </span>
        <span className="text-gray-500 dark:text-white/50">
          Счёт: {displayScore} &middot; Серия: {streak}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${colorIndex}-${round}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isCorrect === true
                ? { opacity: 1, scale: [1, 1.08, 1] }
                : isCorrect === false
                  ? { opacity: 1, x: [0, -12, 12, -8, 8, 0] }
                  : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md aspect-[3/2] rounded-2xl flex items-center justify-center shadow-2xl border border-gray-200 dark:border-white/10"
            style={{ backgroundColor: colors[colorIndex]?.hex }}
          >
            <span
              className={cn(
                "text-4xl md:text-5xl font-bold font-mono select-none uppercase",
                isLightColor(colors[colorIndex]?.hex ?? "#000") ? "text-gray-900" : "text-white"
              )}
            >
              {colors[colorIndex]?.name}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-md space-y-3">
          <p className="text-center text-gray-500 dark:text-white/50">
            Введите название цвета на русском
          </p>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Название цвета..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={answered}
              className={cn(
                "flex-1 text-center text-lg",
                isCorrect === true && "border-green-500 ring-green-500/20",
                isCorrect === false && "border-red-500 ring-red-500/20"
              )}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={answered || !userInput.trim()}
              size="icon"
              className="shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "text-center py-3 px-4 rounded-xl font-medium",
                  isCorrect
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}
              >
                {isCorrect ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Правильно!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    Неправильно! Правильный ответ:{" "}
                    <span className="font-bold text-green-400">
                      {colors[colorIndex]?.answers[0]}
                    </span>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  const numbersModeContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-white/50">
          Раунд {displayRound + 1} из {total}
        </span>
        <span className="text-gray-500 dark:text-white/50">
          Счёт: {displayScore} &middot; Серия: {streak}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${numberValue}-${round}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isCorrect === true
                ? { opacity: 1, scale: [1, 1.08, 1] }
                : isCorrect === false
                  ? { opacity: 1, x: [0, -12, 12, -8, 8, 0] }
                  : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md py-16 px-8 rounded-2xl flex items-center justify-center shadow-2xl border border-gray-200 dark:border-white/10 glass-card"
          >
            <span className="text-3xl md:text-4xl font-bold text-center select-none gradient-text">
              {numberToWords(numberValue)}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-md space-y-3">
          <p className="text-center text-gray-500 dark:text-white/50">
            Введите число цифрами
          </p>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              placeholder="Число..."
              value={userInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^-?\d*$/.test(val)) {
                  setUserInput(val);
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={answered}
              className={cn(
                "flex-1 text-center text-lg",
                isCorrect === true && "border-green-500 ring-green-500/20",
                isCorrect === false && "border-red-500 ring-red-500/20"
              )}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={answered || !userInput.trim()}
              size="icon"
              className="shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "text-center py-3 px-4 rounded-xl font-medium",
                  isCorrect
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}
              >
                {isCorrect ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Правильно!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    Неправильно! Правильный ответ:{" "}
                    <span className="font-bold text-green-400">
                      {correctAnswer}
                    </span>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />

      <GameHeader
        title="Цифры и Цвета"
        current={displayRound + 1}
        total={total}
        streak={streak}
        score={displayScore}
      />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="glass-card">
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Цвета
              </TabsTrigger>
              <TabsTrigger value="numbers" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Цифры
              </TabsTrigger>
            </TabsList>

            <Button variant="outline" size="sm" onClick={handleEndGame} className="glass-card">
              Завершить
            </Button>
          </div>

          <TabsContent value="colors" forceMount className="data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`colors-tab`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-2xl p-6 md:p-8"
              >
                {colorsModeContent}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="numbers" forceMount className="data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`numbers-tab`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-2xl p-6 md:p-8"
              >
                {numbersModeContent}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
