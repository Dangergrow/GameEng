"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, Lightbulb, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getRandomIdioms, getDailyIdiom, idioms as idiomsData } from "@/lib/idioms";
import { cn, validateDifficulty } from "@/lib/utils";
import { IdiomEntry, IdiomCategory } from "@/types";

const QUESTIONS_PER_ROUND = 10;
const BASE_SCORE = 15;

const categoryLabels: Record<IdiomCategory, string> = {
  business: "Бизнес",
  everyday: "Повседневные",
  "phrasal-verbs": "Фразовые глаголы",
  proverbs: "Пословицы",
};

export function IdiomLab() {
  const { difficulty: rawDiff, endGame, stats } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [idioms, setIdioms] = useState<IdiomEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [dailyIdiom, setDailyIdiom] = useState<IdiomEntry | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const selected = getRandomIdioms(QUESTIONS_PER_ROUND);
    setIdioms(selected);
    setDailyIdiom(getDailyIdiom());
    if (selected.length > 0) {
      generateOptions(selected[0]);
    }
  }, []);

  const generateOptions = (correct: IdiomEntry) => {
    const allIdioms = Object.values(idiomsData).flat() as IdiomEntry[];
    const others = allIdioms
      .filter((i) => i.idiom !== correct.idiom)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((i) => i.meaning);

    const opts = [correct.meaning, ...others].sort(() => Math.random() - 0.5);
    setOptions(opts);
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(option);
    const correct = option === idioms[currentIndex].meaning;
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      const streakBonus = newStreak >= 5 ? 5 : newStreak >= 3 ? 3 : 0;
      setScore((s) => s + BASE_SCORE + streakBonus);
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setStreak(0);
      setWrongCount((c) => c + 1);
    }

    setTimeout(() => setShowOrigin(true), 500);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= idioms.length) {
      endGame({
        gameId: "idiomlab",
        score,
        correct: correctCount + (isCorrect ? 1 : 0),
        wrong: wrongCount + (isCorrect ? 0 : 1),
        streak: bestStreak,
        timeSpent,
      });
      return;
    }

    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowOrigin(false);
    const next = currentIndex + 1;
    setCurrentIndex(next);
    generateOptions(idioms[next]);
  };

  if (idioms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка идиом...</p>
      </div>
    );
  }

  const idiom = idioms[currentIndex];

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="ЛабИдиом"
        current={currentIndex + 1}
        total={idioms.length}
        streak={streak}
        score={score}
      />

      <div className="max-w-2xl mx-auto px-4 pt-8">
        {/* Daily idiom banner */}
        {dailyIdiom && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 mb-8 flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Идиома дня</p>
              <p className="text-sm">
                <span className="font-mono font-bold gradient-text">{dailyIdiom.idiom}</span>
                <span className="text-gray-500 dark:text-white/50"> — {dailyIdiom.meaning}</span>
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Category badge */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {categoryLabels[idiom.category]}
              </Badge>
            </div>

            {/* Idiom display */}
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              animate={isCorrect === true ? { scale: [1, 1.02, 1] } : isCorrect === false ? { x: [0, -10, 10, -10, 0] } : {}}
            >
              <Sparkles className="w-6 h-6 text-primary-400 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold font-mono gradient-text mb-2">
                &ldquo;{idiom.idiom}&rdquo;
              </h3>
              <p className="text-gray-500 dark:text-white/50 text-sm">Что это значит?</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {options.map((option, i) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option === idiom.meaning;

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all border",
                      answered && isCorrectOption && "border-green-500 bg-green-500/10",
                      answered && isSelected && !isCorrectOption && "border-red-500 bg-red-500/10",
                      !answered && "glass-card hover:border-primary/30 cursor-pointer",
                      answered && !isSelected && !isCorrectOption && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm md:text-base">{option}</span>
                      {answered && isCorrectOption && <Check className="w-5 h-5 text-green-400 flex-shrink-0" />}
                      {answered && isSelected && !isCorrectOption && (
                        <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Origin and example */}
            <AnimatePresence>
              {showOrigin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "glass-card rounded-xl p-5 border-l-4",
                    isCorrect ? "border-l-green-500" : "border-l-red-500"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Происхождение</p>
                      <p className="text-sm text-gray-600 dark:text-white/70">{idiom.origin}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                    <p className="text-sm font-semibold mb-1">Пример</p>
                    <p className="text-sm text-gray-600 dark:text-white/70 italic">
                      &ldquo;{idiom.example}&rdquo;
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Button onClick={handleNext} className="w-full gradient-primary">
                    {currentIndex + 1 >= idioms.length ? "Результаты" : "Следующая идиома"}
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
