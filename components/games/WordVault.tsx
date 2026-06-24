"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, X, Bookmark, BookmarkCheck, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getWordsForDifficulty, wordBanks } from "@/lib/words";
import { cn } from "@/lib/utils";
import { Difficulty, WordEntry } from "@/types";
import { validateDifficulty } from "@/lib/utils";

const WORDS_PER_ROUND = 10;
const BASE_SCORE = 10;

export function WordVault() {
  const { difficulty: rawDiff, endGame, addCollectedWord, isWordCollected, stats } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const selected = getWordsForDifficulty(difficulty, WORDS_PER_ROUND);
    setWords(selected);
    if (selected.length > 0) {
      generateOptions(selected[0]);
    }
  }, [difficulty]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const generateOptions = (correctWord: WordEntry) => {
    const allWords = wordBanks[difficulty];
    const others = allWords
      .filter((w) => w.word !== correctWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.translation);

    const opts = [correctWord.translation, ...others].sort(() => Math.random() - 0.5);
    setOptions(opts);
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(option);
    const correct = option === words[currentIndex].translation;
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      const streakBonus = newStreak >= 5 ? 5 : newStreak >= 3 ? 3 : 0;
      setScore((s) => s + BASE_SCORE + streakBonus);
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      addCollectedWord(words[currentIndex].word);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setStreak(0);
      setWrongCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= words.length) {
      endGame({
        gameId: "wordvault",
        score,
        correct: correctCount + (isCorrect ? 1 : 0),
        wrong: wrongCount + (isCorrect ? 0 : 1),
        streak: bestStreak,
        wordsLearned: words.filter((w) => isWordCollected(w.word)).map((w) => w.word),
        timeSpent,
      });
      return;
    }

    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowDetails(false);
    const next = currentIndex + 1;
    setCurrentIndex(next);
    generateOptions(words[next]);
  };

  const word = words[currentIndex];

  if (!word) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка слов...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="СловоХранилище"
        current={currentIndex + 1}
        total={words.length}
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
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Word display */}
            <motion.div
              className="text-center py-10"
              animate={isCorrect === true ? { scale: [1, 1.05, 1] } : isCorrect === false ? { x: [0, -10, 10, -10, 0] } : {}}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <Badge variant="outline" className="text-xs">
                  {word.topic}
                </Badge>
                {word.rarity === "rare" && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Редкое
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Это редкое слово — собери его!</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <h3 className="text-4xl md:text-5xl font-bold font-mono gradient-text mb-2">
                {word.word}
              </h3>
              <p className="text-gray-400 dark:text-white/40 font-mono text-sm">{word.transcription}</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option, i) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option === word.translation;
                let variant: string = "outline";

                if (answered && isSelected) {
                  variant = option === word.translation ? "default" : "destructive";
                } else if (answered && isCorrectOption) {
                  variant = "default";
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all duration-200 border",
                      answered && isCorrectOption && "border-green-500 bg-green-500/10",
                      answered && isSelected && !matchOption(option, word.translation) && "border-red-500 bg-red-500/10",
                      !answered && "glass-card hover:border-primary/30 cursor-pointer",
                      answered && !isSelected && !isCorrectOption && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {answered && isCorrectOption && <Check className="w-5 h-5 text-green-400" />}
                      {answered && isSelected && !matchOption(option, word.translation) && (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Answer feedback & details */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {isCorrect ? (
                    <div className="glass-card rounded-xl p-4 border-green-500/20">
                      <p className="text-green-400 font-semibold mb-2">
                        Правильно! +{BASE_SCORE + (streak >= 5 ? 5 : streak >= 3 ? 3 : 0)} очков
                      </p>
                      {streak >= 3 && (
                        <p className="text-amber-400 text-sm">
                          {streak >= 5 ? "Огненная серия! +5 бонус" : "Бонус серии! +3"}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(true)}
                        className="mt-2 text-primary-400"
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Детали слова
                      </Button>
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-4 border-red-500/20">
                      <p className="text-red-400 font-semibold">
                        Неправильно! Правильный ответ:{" "}
                        <span className="text-green-400 font-mono">{word.translation}</span>
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(true)}
                        className="mt-2 text-primary-400"
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Изучить слово
                      </Button>
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

      {/* Word details dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-mono gradient-text">
              {word.word}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Произношение</p>
              <p className="font-mono text-lg">{word.transcription}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Перевод</p>
              <p className="text-lg">{word.translation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Определение</p>
              <p className="text-gray-700 dark:text-white/80">{word.definition}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Пример</p>
              <p className="text-gray-700 dark:text-white/80 italic">&ldquo;{word.example}&rdquo;</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Синонимы</p>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Badge variant="outline">{word.topic}</Badge>
              <Badge variant={word.rarity === "rare" ? "default" : "outline"}>
                {word.rarity}
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (isWordCollected(word.word)) {
                  useGameStore.getState().removeCollectedWord(word.word);
                } else {
                  addCollectedWord(word.word);
                }
              }}
            >
              {isWordCollected(word.word) ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2 text-amber-400" />
                  В коллекции
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Добавить в коллекцию
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collection dialog */}
      <Dialog open={showCollection} onOpenChange={setShowCollection}>
        <DialogContent className="glass-strong max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Твоя коллекция слов</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2 pr-4">
              {stats.wordsCollected === 0 ? (
                <p className="text-gray-500 dark:text-white/50 text-center py-8">
                  Слов пока нет. Сыграй в СловоХранилище, чтобы собрать коллекцию!
                </p>
              ) : (
                <p className="text-gray-500 dark:text-white/50 text-sm mb-3">
                  Собрано слов: {stats.wordsCollected}
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function matchOption(option: string, translation: string): boolean {
  return option === translation;
}
