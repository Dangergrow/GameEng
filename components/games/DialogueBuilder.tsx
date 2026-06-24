"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Volume2, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getRandomScenario, type DialogueScenario, type DialogueLine } from "@/lib/dialogues";
import { cn, validateDifficulty } from "@/lib/utils";

const BASE_SCORE = 15;
const PENALTY = 2;
const PERFECT_BONUS = 5;

const topicLabels: Record<string, string> = {
  restaurant: "Ресторан",
  shopping: "Покупки",
  travel: "Путешествия",
  work: "Работа",
  doctor: "У врача",
  directions: "Ориентация",
  meeting: "Встреча",
  hotel: "Отель",
  presentation: "Презентация",
  negotiation: "Переговоры",
  interview: "Собеседование",
  conference: "Конференция",
};

const speakDialogue = (scenario: DialogueScenario, answers: string[]) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const text = scenario.lines
    .map((line, i) => {
      const answer = answers[i] || line.correctAnswer;
      return `${line.speaker}: ${line.text.replace(/___/g, answer)}`;
    })
    .join(". ");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
};

type GamePhase = "filling" | "review";

export function DialogueBuilder() {
  const { difficulty: rawDiff, endGame, goToLobby } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [scenario, setScenario] = useState<DialogueScenario | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [isCorrectList, setIsCorrectList] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>("filling");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

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

  const initGame = useCallback(() => {
    const s = getRandomScenario(difficulty);
    setScenario(s);
    setAnswers(new Array(s.lines.length).fill(null));
    setIsCorrectList(new Array(s.lines.length).fill(false));
    setCurrentLineIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setGamePhase("filling");
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleAnswer = (option: string) => {
    if (answered || !scenario) return;
    setAnswered(true);
    setSelectedOption(option);

    const line = scenario.lines[currentLineIndex];
    const correct = option === line.correctAnswer;
    setIsCorrect(correct);

    const newAnswers = [...answers];
    newAnswers[currentLineIndex] = option;
    setAnswers(newAnswers);

    const newCorrectList = [...isCorrectList];
    newCorrectList[currentLineIndex] = correct;
    setIsCorrectList(newCorrectList);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      setScore((s) => s + BASE_SCORE);
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setStreak(0);
      setScore((s) => Math.max(0, s - PENALTY));
      setWrongCount((c) => c + 1);
    }

    setTimeout(() => setShowExplanation(true), 400);
  };

  const handleNext = () => {
    if (!scenario) return;

    if (currentLineIndex + 1 >= scenario.lines.length) {
      const allCorrect = correctCount + (isCorrect ? 1 : 0) === scenario.lines.length;
      const finalScore = Math.max(0, score + (allCorrect ? PERFECT_BONUS : 0));
      setScore(finalScore);
      setGamePhase("review");
      return;
    }

    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setCurrentLineIndex((i) => i + 1);
  };

  const handleFinish = () => {
    if (!scenario) return;
    endGame({
      gameId: "dialoguebuilder",
      score,
      correct: correctCount,
      wrong: wrongCount,
      streak: bestStreak,
      timeSpent,
    });
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка диалога...</p>
      </div>
    );
  }

  const totalLines = scenario.lines.length;
  const filledCount = answers.filter((a) => a !== null).length;
  const currentLine = scenario.lines[currentLineIndex];
  const topicLabel = topicLabels[scenario.topic] || scenario.topic;

  const difficultyLabel =
    scenario.difficulty === "beginner"
      ? "Начальный"
      : scenario.difficulty === "intermediate"
      ? "Средний"
      : "Продвинутый";

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti || (gamePhase === "review" && correctCount === totalLines)} />
      <GameHeader
        title="ДиалогМастер"
        current={gamePhase === "filling" ? filledCount : totalLines}
        total={totalLines}
        streak={streak}
        score={score}
      />

      <div className="max-w-2xl mx-auto px-4 pt-8">
        {gamePhase === "filling" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Scenario info */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold gradient-text">{scenario.title}</h2>
                  <Badge variant="outline" className="text-xs">
                    {topicLabel}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs",
                      scenario.difficulty === "beginner"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : scenario.difficulty === "intermediate"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {difficultyLabel}
                  </Badge>
                </div>
              </motion.div>

              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-white/50">
                  Заполнено:{" "}
                  <span className="font-mono font-bold text-primary-400">
                    {filledCount}/{totalLines}
                  </span>
                </span>
                <div className="flex gap-1.5">
                  {scenario.lines.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all",
                        i < currentLineIndex && isCorrectList[i] && "bg-green-500",
                        i < currentLineIndex && !isCorrectList[i] && "bg-red-500",
                        i === currentLineIndex && "bg-primary-400 ring-2 ring-primary-400/30",
                        i > currentLineIndex && "bg-gray-300 dark:bg-white/20"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Dialogue */}
              <motion.div
                className="glass-card rounded-2xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-white/10">
                  <MessageSquare className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-white/50">
                    Диалог
                  </span>
                </div>
                <div className="space-y-1.5">
                  {scenario.lines.map((line, i) => {
                    const isCurrent = i === currentLineIndex;
                    const userAnswer = answers[i];
                    const isFilled = userAnswer !== null;
                    const wasCorrect = isCorrectList[i];

                    const parts = line.text.split("___");

                    return (
                      <motion.div
                        key={i}
                        className={cn(
                          "flex gap-3 py-1.5 rounded-lg px-2 -mx-2 transition-colors",
                          isCurrent && "bg-primary-500/10 border border-primary-400/30"
                        )}
                        animate={
                          isCurrent
                            ? {
                                boxShadow: [
                                  "0 0 0px rgba(99,102,241,0)",
                                  "0 0 12px rgba(99,102,241,0.3)",
                                  "0 0 0px rgba(99,102,241,0)",
                                ],
                              }
                            : {}
                        }
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <span className="font-bold text-primary-400 flex-shrink-0 w-6">
                          {line.speaker}:
                        </span>
                        <span className="text-gray-700 dark:text-white/80 text-sm md:text-base">
                          {parts.map((part, j) => {
                            if (j === parts.length - 1) {
                              return <span key={j}>{part}</span>;
                            }

                            if (isFilled) {
                              return (
                                <span key={j}>
                                  {part}
                                  <span
                                    className={cn(
                                      "font-semibold px-1.5 py-0.5 rounded mx-0.5",
                                      wasCorrect
                                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                        : "bg-red-500/20 text-red-600 dark:text-red-400 line-through"
                                    )}
                                  >
                                    {userAnswer}
                                    {wasCorrect ? (
                                      <Check className="w-3 h-3 inline ml-0.5 text-green-500" />
                                    ) : (
                                      <X className="w-3 h-3 inline ml-0.5 text-red-500" />
                                    )}
                                  </span>
                                </span>
                              );
                            }

                            return (
                              <span key={j}>
                                {part}
                                <span
                                  className={cn(
                                    "inline-block px-2 py-0.5 rounded mx-0.5 border border-dashed font-mono text-sm",
                                    isCurrent
                                      ? "border-primary-400/60 bg-primary-500/10 text-primary-400 animate-pulse"
                                      : "border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/40"
                                  )}
                                >
                                  [{i + 1}]
                                </span>
                              </span>
                            );
                          })}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Options */}
              <AnimatePresence>
                {!answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-gray-500 dark:text-white/50">
                      Выберите подходящее слово для пропуска{" "}
                      <span className="font-mono font-bold text-primary-400">
                        [{currentLineIndex + 1}]
                      </span>
                      :
                    </p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentLine.options.map((option, i) => (
                        <motion.button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={cn(
                            "p-4 rounded-xl text-left transition-all border text-sm",
                            "glass-card hover:border-primary/40 hover:bg-primary-500/5 cursor-pointer",
                            "hover:shadow-md hover:shadow-primary/5"
                          )}
                        >
                          <span className="font-mono text-xs text-gray-400 dark:text-white/40 mr-2">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feedback */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div
                      className={cn(
                        "glass-card rounded-xl p-5",
                        isCorrect ? "border-green-500/30" : "border-red-500/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <>
                            <Check className="w-5 h-5 text-green-400" />
                            <span className="font-semibold text-green-400">Правильно!</span>
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 text-red-400" />
                            <span className="font-semibold text-red-400">Неверно</span>
                          </>
                        )}
                      </div>

                      {!isCorrect && (
                        <p className="text-sm text-gray-600 dark:text-white/70 mb-2">
                          Правильный ответ:{" "}
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {currentLine.correctAnswer}
                          </span>
                        </p>
                      )}

                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-3 mt-3 border-t border-gray-200 dark:border-white/10"
                        >
                          <p className="text-sm text-gray-600 dark:text-white/70">
                            {currentLine.explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <Button onClick={handleNext} className="w-full gradient-primary">
                      {currentLineIndex + 1 >= totalLines ? "Проверить диалог" : "Далее"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}

        {gamePhase === "review" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Score banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <h2 className="text-2xl font-bold gradient-text mb-2">Диалог заполнен!</h2>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="text-center">
                  <div className="text-3xl font-bold font-mono text-primary-400">{score}</div>
                  <div className="text-xs text-gray-500 dark:text-white/50">Очки</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold font-mono text-green-400">
                    {correctCount}/{totalLines}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white/50">Правильно</div>
                </div>
                {correctCount === totalLines && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Идеально! +{PERFECT_BONUS}
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Complete dialogue */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-white/50">
                    Полный диалог
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakDialogue(scenario, answers.map((a) => a || ""))}
                  className="text-xs"
                >
                  <Volume2 className="w-3.5 h-3.5 mr-1" />
                  Прослушать
                </Button>
              </div>
              <div className="space-y-1.5">
                {scenario.lines.map((line, i) => {
                  const userAnswer = answers[i] || line.correctAnswer;
                  const wasCorrect = isCorrectList[i];
                  const parts = line.text.split("___");

                  return (
                    <div key={i} className="flex gap-3 py-1.5">
                      <span className="font-bold text-primary-400 flex-shrink-0 w-6">
                        {line.speaker}:
                      </span>
                      <span className="text-gray-700 dark:text-white/80 text-sm md:text-base">
                        {parts.map((part, j) => {
                          if (j === parts.length - 1) {
                            return <span key={j}>{part}</span>;
                          }
                          return (
                            <span key={j}>
                              {part}
                              <span
                                className={cn(
                                  "font-semibold px-1.5 py-0.5 rounded mx-0.5",
                                  wasCorrect
                                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                    : "bg-red-500/20 text-red-600 dark:text-red-400"
                                )}
                              >
                                {wasCorrect ? (
                                  userAnswer
                                ) : (
                                  <>
                                    <span className="line-through mr-1">{userAnswer}</span>
                                    <span className="text-green-600 dark:text-green-400">
                                      {line.correctAnswer}
                                    </span>
                                  </>
                                )}
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <Button onClick={handleFinish} className="w-full gradient-primary">
                Завершить
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    endGame({
                      gameId: "dialoguebuilder",
                      score,
                      correct: correctCount,
                      wrong: wrongCount,
                      streak: bestStreak,
                      timeSpent,
                    });
                    initGame();
                  }}
                  className="flex-1"
                >
                  Ещё раз
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    endGame({
                      gameId: "dialoguebuilder",
                      score,
                      correct: correctCount,
                      wrong: wrongCount,
                      streak: bestStreak,
                      timeSpent,
                    });
                    goToLobby();
                  }}
                  className="flex-1"
                >
                  В лобби
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
