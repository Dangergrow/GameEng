"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, Lightbulb, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getGrammarQuestions } from "@/lib/grammar";
import { cn, validateDifficulty } from "@/lib/utils";
import { GrammarCategory, GrammarTemplate } from "@/types";

const QUESTIONS_PER_ROUND = 10;
const BASE_SCORE = 10;

const categoryLabels: Record<GrammarCategory, string> = {
  tenses: "Времена",
  prepositions: "Предлоги",
  conditionals: "Условия",
  articles: "Артикли",
  "reported-speech": "Косвенная речь",
  modals: "Модальные",
};

const categoryColors: Record<GrammarCategory, string> = {
  tenses: "border-blue-500/30 text-blue-400",
  prepositions: "border-purple-500/30 text-purple-400",
  conditionals: "border-amber-500/30 text-amber-400",
  articles: "border-green-500/30 text-green-400",
  "reported-speech": "border-pink-500/30 text-pink-400",
  modals: "border-cyan-500/30 text-cyan-400",
};

export function GrammarForge() {
  const { difficulty: rawDiff, endGame } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [questions, setQuestions] = useState<GrammarTemplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedCategories, setSelectedCategories] = useState<GrammarCategory[]>(["tenses", "prepositions", "conditionals", "articles", "modals"]);
  const [showCategorySelect, setShowCategorySelect] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const startGame = (categories: GrammarCategory[]) => {
    const qs = getGrammarQuestions(categories, difficulty, QUESTIONS_PER_ROUND);
    setQuestions(qs);
    setShowCategorySelect(false);
    setCurrentIndex(0);
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(option);
    const correct = option === questions[currentIndex].correct;
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
      setTimeout(() => setShowExplanation(true), 500);
    } else {
      setStreak(0);
      setWrongCount((c) => c + 1);
      setTimeout(() => setShowExplanation(true), 300);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      endGame({
        gameId: "grammarforge",
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
    setShowExplanation(false);
    setCurrentIndex((i) => i + 1);
  };

  const toggleCategory = (cat: GrammarCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  if (showCategorySelect) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="glass-strong rounded-2xl p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-2xl font-bold gradient-text text-center mb-2">ГраммоКузница</h2>
          <p className="text-gray-500 dark:text-white/50 text-center mb-6">Выбери категории грамматики:</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.keys(categoryLabels) as GrammarCategory[]).map((cat) => (
              <motion.button
                key={cat}
                onClick={() => toggleCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  selectedCategories.includes(cat)
                    ? `${categoryColors[cat]} border-opacity-50 bg-gray-50 dark:bg-white/5`
                    : "border-gray-200 dark:border-white/10 opacity-50 hover:opacity-80"
                )}
              >
                {categoryLabels[cat]}
              </motion.button>
            ))}
          </div>
          <Button
            onClick={() => startGame(selectedCategories)}
            disabled={selectedCategories.length === 0}
            className="w-full gradient-primary"
          >
            Начать игру
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка заданий...</p>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="ГраммоКузница"
        current={currentIndex + 1}
        total={questions.length}
        streak={streak}
        score={score}
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
            {/* Category badge and streak */}
            <div className="flex items-center justify-between">
              <Badge className={cn(categoryColors[question.category], "border bg-transparent")}>
                {categoryLabels[question.category]}
              </Badge>
              {streak >= 3 && (
                <motion.div
                  className="flex items-center gap-1 text-amber-400"
                  animate={{ scale: streak >= 5 ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: streak >= 5 ? Infinity : 0, duration: 0.5 }}
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">серия: {streak}</span>
                </motion.div>
              )}
            </div>

            {/* Sentence with blank */}
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              animate={isCorrect === true ? { borderColor: "rgba(34, 197, 94, 0.3)" } : isCorrect === false ? { x: [0, -10, 10, -10, 0] } : {}}
            >
              <p className="text-xl md:text-2xl leading-relaxed">
                {question.sentence.split("___").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span
                        className={cn(
                          "inline-block min-w-[100px] mx-1 px-3 py-1 rounded-lg font-mono border-b-2",
                          answered && isCorrect
                            ? "bg-green-500/20 border-green-500 text-green-400"
                            : answered && !isCorrect
                            ? "bg-red-500/20 border-red-500 text-red-400"
                            : "border-primary-400/50 text-primary-300"
                        )}
                      >
                        {answered ? question.correct : "___"}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option === question.correct;

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl text-center font-mono text-lg transition-all border",
                      answered && isCorrectOption && "border-green-500 bg-green-500/10",
                      answered && isSelected && !isCorrectOption && "border-red-500 bg-red-500/10",
                      !answered && "glass-card hover:border-primary/30 cursor-pointer",
                      answered && !isSelected && !isCorrectOption && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{option}</span>
                      {answered && isCorrectOption && <Check className="w-5 h-5 text-green-400 flex-shrink-0" />}
                      {answered && isSelected && !isCorrectOption && (
                        <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "glass-card rounded-xl p-5 border-l-4",
                    isCorrect ? "border-l-green-500" : "border-l-red-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold mb-1">
                        {isCorrect ? "Отлично!" : "Не совсем!"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-white/70">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next / Results button */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Button onClick={handleNext} className="w-full gradient-primary">
                    {currentIndex + 1 >= questions.length ? "Результаты" : "Следующий вопрос"}
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
