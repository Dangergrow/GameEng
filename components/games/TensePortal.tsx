"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Home, Check, X, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getVerbsForDifficulty, type VerbEntry } from "@/lib/verbs";
import { cn, validateDifficulty } from "@/lib/utils";
import type { Difficulty } from "@/types";

type Tense =
  | "present-simple"
  | "past-simple"
  | "present-perfect"
  | "past-continuous"
  | "future-simple"
  | "past-perfect"
  | "conditional-simple"
  | "passive-present"
  | "reported-past";

interface TenseInfo {
  id: Tense;
  label: string;
  labelRu: string;
  position: number;
  formatter: (verb: VerbEntry) => string;
  helper: string;
  example: (verb: VerbEntry) => string;
}

const TENSES: TenseInfo[] = [
  {
    id: "past-perfect",
    label: "Past Perfect",
    labelRu: "Прошедшее совершённое",
    position: 0,
    formatter: (v) => "had " + v.participle,
    helper: "had + V3",
    example: (v) => `had ${v.participle}`,
  },
  {
    id: "past-continuous",
    label: "Past Continuous",
    labelRu: "Прошедшее длительное",
    position: 15,
    formatter: (v) => "was " + v.ing,
    helper: "was/were + V-ing",
    example: (v) => `was ${v.ing}`,
  },
  {
    id: "past-simple",
    label: "Past Simple",
    labelRu: "Прошедшее простое",
    position: 25,
    formatter: (v) => v.past,
    helper: "V2",
    example: (v) => v.past,
  },
  {
    id: "present-perfect",
    label: "Present Perfect",
    labelRu: "Настоящее совершённое",
    position: 40,
    formatter: (v) => "has " + v.participle,
    helper: "has/have + V3",
    example: (v) => `has ${v.participle}`,
  },
  {
    id: "present-simple",
    label: "Present Simple",
    labelRu: "Настоящее простое",
    position: 50,
    formatter: (v) => v.thirdPerson,
    helper: "V1 / V-s",
    example: (v) => v.thirdPerson,
  },
  {
    id: "future-simple",
    label: "Future Simple",
    labelRu: "Будущее простое",
    position: 75,
    formatter: (v) => "will " + v.base,
    helper: "will + V1",
    example: (v) => `will ${v.base}`,
  },
  {
    id: "conditional-simple",
    label: "Conditional",
    labelRu: "Условное",
    position: 85,
    formatter: (v) => "would " + v.base,
    helper: "would + V1",
    example: (v) => `would ${v.base}`,
  },
  {
    id: "reported-past",
    label: "Reported (Past → Past Perfect)",
    labelRu: "Косвенная речь",
    position: 95,
    formatter: (v) => "had " + v.participle,
    helper: "had + V3",
    example: (v) => `had ${v.participle}`,
  },
  {
    id: "passive-present",
    label: "Passive (Present)",
    labelRu: "Пассивный залог",
    position: 100,
    formatter: (v) => "is " + v.participle,
    helper: "is/are + V3",
    example: (v) => `is ${v.participle}`,
  },
];

const TENSE_DIFFICULTY: Record<Difficulty, Tense[]> = {
  beginner: ["present-simple", "past-simple"],
  intermediate: ["present-simple", "past-simple", "present-perfect", "past-continuous", "future-simple"],
  advanced: ["present-simple", "past-simple", "present-perfect", "past-continuous", "future-simple", "past-perfect", "conditional-simple", "passive-present", "reported-past"],
};

const SUBJECTS = [
  { en: "I", ru: "Я", thirdPerson: false },
  { en: "You", ru: "Ты", thirdPerson: false },
  { en: "He", ru: "Он", thirdPerson: true },
  { en: "She", ru: "Она", thirdPerson: true },
  { en: "We", ru: "Мы", thirdPerson: false },
  { en: "They", ru: "Они", thirdPerson: false },
];

const COMPLEMENTS: Record<string, string[]> = {
  "в парке": ["in the park"],
  "в школе": ["at school"],
  "на работе": ["at work"],
  "дома": ["at home"],
  "в магазине": ["in the shop"],
  "на кухне": ["in the kitchen"],
  "в парке вчера": ["in the park yesterday"],
  "каждый день": ["every day"],
  "по выходным": ["on weekends"],
  "прямо сейчас": ["right now"],
  "на следующей неделе": ["next week"],
  "уже два часа": ["for two hours"],
};

const QUESTIONS_PER_ROUND = 10;
const BASE_SCORE = 15;

interface Question {
  verb: VerbEntry;
  subject: { en: string; ru: string; thirdPerson: boolean };
  complementRu: string;
  complementEn: string;
  tense: TenseInfo;
  correctAnswer: string;
}

function generateQuestion(difficulty: Difficulty): Question {
  const verbs = getVerbsForDifficulty(difficulty, 20);
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  const tenses = TENSE_DIFFICULTY[difficulty];
  const tenseId = tenses[Math.floor(Math.random() * tenses.length)];
  const tense = TENSES.find((t) => t.id === tenseId)!;

  const compKeys = Object.keys(COMPLEMENTS);
  const compKey = compKeys[Math.floor(Math.random() * compKeys.length)];
  const complementEn = COMPLEMENTS[compKey][0];

  let correctAnswer = tense.formatter(verb);
  if (tense.id === "present-simple") {
    correctAnswer = subject.thirdPerson ? verb.thirdPerson : verb.base;
  } else if (tense.id === "past-continuous") {
    correctAnswer = (subject.en === "I" || subject.en === "He" || subject.en === "She") ? "was " + verb.ing : "were " + verb.ing;
  } else if (tense.id === "present-perfect") {
    correctAnswer = (subject.en === "I" || subject.en === "We" || subject.en === "You" || subject.en === "They") ? "have " + verb.participle : "has " + verb.participle;
  } else if (tense.id === "passive-present") {
    correctAnswer = (subject.en === "I") ? "am " + verb.participle : (subject.en === "He" || subject.en === "She") ? "is " + verb.participle : "are " + verb.participle;
  }

  return { verb, subject, complementRu: compKey, complementEn, tense, correctAnswer };
}

export function TensePortal() {
  const { difficulty: rawDiff, endGame, goToLobby } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [tensePositions, setTensePositions] = useState<Tense[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const qs: Question[] = [];
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
      qs.push(generateQuestion(difficulty));
    }
    setQuestions(qs);
  }, [difficulty]);

  const handleSubmit = () => {
    if (answered || !userInput.trim()) return;
    setAnswered(true);

    const q = questions[currentIndex];
    const input = userInput.trim().toLowerCase();
    const correct = q.correctAnswer.toLowerCase();

    if (input === correct) {
      setIsCorrect(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      let pts = BASE_SCORE;
      if (newStreak >= 3) pts += 5;
      if (["present-perfect", "past-perfect", "conditional-simple", "passive-present", "reported-past"].includes(q.tense.id)) {
        pts += 10;
      }
      setScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setIsCorrect(false);
      setStreak(0);
      setWrongCount((c) => c + 1);
      setShowTable(true);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      endGame({
        gameId: "tenseportal",
        score,
        correct: correctCount + (isCorrect ? 1 : 0),
        wrong: wrongCount + (isCorrect ? 0 : 1),
        streak: bestStreak,
        timeSpent: 0,
      });
      return;
    }
    setAnswered(false);
    setUserInput("");
    setIsCorrect(null);
    setShowTable(false);
    setCurrentIndex((i) => i + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !answered) {
      handleSubmit();
    } else if (e.key === "Enter" && answered) {
      handleNext();
    }
  };

  if (isFinished) {
    const total = correctCount + (isCorrect ? 1 : 0);
    const wrong = wrongCount + (isCorrect ? 0 : 1);
    const percentage = total + wrong > 0 ? Math.round((total / (total + wrong)) * 100) : 0;

    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Confetti active={percentage >= 60} />
        <motion.div className="glass-strong rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-2 gradient-text">ВремПортал</h2>
          <p className="text-gray-400 dark:text-white/50 mb-6">Раунд завершён</p>

          <div className="text-5xl font-bold font-mono gradient-text mb-2">{score}</div>
          <div className="text-sm text-gray-500 dark:text-white/50 mb-6">очков</div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-xl p-3">
              <div className="text-xl font-bold font-mono text-green-400">{total}</div>
              <div className="text-xs text-gray-400">Верно</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-xl font-bold font-mono text-red-400">{wrong}</div>
              <div className="text-xs text-gray-400">Ошибки</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-xl font-bold font-mono text-orange-400">{bestStreak}</div>
              <div className="text-xs text-gray-400">Серия</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setStreak(0);
                setBestStreak(0);
                setUserInput("");
                setAnswered(false);
                setIsCorrect(null);
                setShowTable(false);
                setCorrectCount(0);
                setWrongCount(0);
                setIsFinished(false);
                const qs: Question[] = [];
                for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
                  qs.push(generateQuestion(difficulty));
                }
                setQuestions(qs);
                setTensePositions([]);
              }}
              className="w-full gradient-primary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Ещё раз
            </Button>
            <Button
              variant="outline"
              onClick={() => goToLobby()}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              В лобби
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Loading questions...</p>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="ВремПортал"
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
            {/* Timeline */}
            <div className="glass-card rounded-2xl p-6">
              <div className="relative h-10 mb-3">
                <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full bg-white/10" />
                <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${q.tense.position}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 12 }}
                  />
                </div>
                <motion.div
                  className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-primary shadow-lg shadow-primary/30"
                  initial={{ left: "0%" }}
                  animate={{ left: `${q.tense.position}%` }}
                  transition={{ type: "spring", stiffness: 60, damping: 12 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 dark:text-white/50 font-mono">
                <span>← Прошлое</span>
                <span>Настоящее</span>
                <span>Будущее →</span>
              </div>
            </div>

            {/* Question display */}
            <motion.div
              className="glass-card rounded-2xl p-8 text-center"
              animate={isCorrect === true ? { borderColor: "rgba(34, 197, 94, 0.3)" } : isCorrect === false ? { x: [0, -10, 10, -10, 0] } : {}}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                  {q.tense.label}
                </span>
              </div>

              <p className="text-lg mb-1 text-gray-700 dark:text-white/90">
                {q.subject.ru} <span className="font-mono font-bold text-primary">({q.verb.base})</span> {q.complementRu}.
              </p>
              <p className="text-sm text-gray-400 dark:text-white/50 mb-4 font-mono">
                {q.subject.en} (______) {q.complementEn}
              </p>

              <p className="text-xs text-gray-400 dark:text-white/40 font-mono mb-4">
                Подсказка: {q.tense.helper}
              </p>

              {/* Input */}
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Введите форму глагола...`}
                  disabled={answered}
                  className={cn(
                    "text-xl md:text-2xl font-mono py-8 text-center bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/20",
                    answered && isCorrect && "border-green-500 bg-green-500/5",
                    answered && !isCorrect && "border-red-500 bg-red-500/5"
                  )}
                  autoFocus
                />
              </div>
            </motion.div>

            {/* Actions */}
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
                  {isCorrect ? (
                    <div className="glass-card rounded-xl p-4 border-green-500/30 text-center">
                      <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold text-lg">
                        Правильно: {q.correctAnswer}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/50 mt-1">
                        {q.subject.en} {q.correctAnswer} {q.complementEn}
                      </p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-4 border-red-500/30 text-center">
                      <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 mb-1">Неверно</p>
                      <p className="text-gray-600 dark:text-white/70">
                        Правильный ответ:{" "}
                        <span className="text-green-400 font-mono text-lg">{q.correctAnswer}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/50 mt-1">
                        {q.subject.en} {q.correctAnswer} {q.complementEn}
                      </p>
                    </div>
                  )}

                  {/* Conjugation table on wrong */}
                  {showTable && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="glass-card rounded-xl p-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">
                          Спряжение: {q.verb.base}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded-lg bg-white/5">
                          <span className="text-gray-400 dark:text-white/50">Base:</span>{" "}
                          <span className="font-mono">{q.verb.base}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                          <span className="text-gray-400 dark:text-white/50">Past:</span>{" "}
                          <span className="font-mono">{q.verb.past}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                          <span className="text-gray-400 dark:text-white/50">Participle:</span>{" "}
                          <span className="font-mono">{q.verb.participle}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                          <span className="text-gray-400 dark:text-white/50">3rd person:</span>{" "}
                          <span className="font-mono">{q.verb.thirdPerson}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 col-span-2">
                          <span className="text-gray-400 dark:text-white/50">-ing form:</span>{" "}
                          <span className="font-mono">{q.verb.ing}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button onClick={handleNext} className="w-full gradient-primary">
                    {currentIndex + 1 >= questions.length ? "Результаты" : "Далее"}
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
