"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X, ArrowRight, ArrowLeft, RotateCcw, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameHeader } from "@/components/shared/GameHeader";
import { useGameStore } from "@/store/gameStore";
import { cn, validateDifficulty } from "@/lib/utils";

const ROUNDS = 5;
const BASE_SCORE = 20;
const MAX_SPEED_BONUS = 30;

interface Phrase {
  en: string;
  ru: string;
}

const phrasesByDifficulty: Record<"beginner" | "intermediate" | "advanced", Phrase[]> = {
  beginner: [
    { en: "I like coffee", ru: "Я люблю кофе" },
    { en: "He is a teacher", ru: "Он учитель" },
    { en: "She has a cat", ru: "У неё есть кот" },
    { en: "We go to school", ru: "Мы ходим в школу" },
    { en: "They are friends", ru: "Они друзья" },
    { en: "It is very cold", ru: "Очень холодно" },
    { en: "I want some water", ru: "Я хочу воды" },
    { en: "The sun is bright", ru: "Солнце яркое" },
    { en: "My name is Anna", ru: "Меня зовут Анна" },
    { en: "This book is good", ru: "Эта книга хорошая" },
    { en: "I live in Moscow", ru: "Я живу в Москве" },
    { en: "Open the door please", ru: "Открой дверь, пожалуйста" },
  ],
  intermediate: [
    { en: "She has been working here since Monday", ru: "Она работает здесь с понедельника" },
    { en: "I would like to order a pizza", ru: "Я бы хотел заказать пиццу" },
    { en: "He enjoys playing football every weekend", ru: "Ему нравится играть в футбол каждые выходные" },
    { en: "The meeting will start in ten minutes", ru: "Собрание начнётся через десять минут" },
    { en: "Could you tell me the way to the station", ru: "Не могли бы вы подсказать дорогу до вокзала" },
    { en: "I have been studying English for three years", ru: "Я изучаю английский три года" },
    { en: "She was not at home when I called", ru: "Её не было дома, когда я позвонил" },
    { en: "You should have seen his face at that moment", ru: "Ты бы видел его лицо в тот момент" },
    { en: "They decided to move to another city last year", ru: "Они решили переехать в другой город в прошлом году" },
    { en: "The weather has been terrible all week long", ru: "Погода была ужасной всю неделю" },
    { en: "I used to play the piano when I was younger", ru: "Я раньше играл на пианино, когда был моложе" },
    { en: "We need to finish this project by Friday", ru: "Нам нужно закончить этот проект к пятнице" },
  ],
  advanced: [
    { en: "If I had known about the meeting I would have prepared", ru: "Если бы я знал о встрече, я бы подготовился" },
    { en: "Despite the heavy rain the event was a tremendous success", ru: "Несмотря на сильный дождь, мероприятие имело огромный успех" },
    { en: "The underlying issue has not been properly addressed yet", ru: "Основная проблема ещё не была должным образом решена" },
    { en: "It goes without saying that thorough preparation is paramount", ru: "Само собой разумеется, что тщательная подготовка имеет первостепенное значение" },
    { en: "Had it not been for her timely intervention the situation would have escalated", ru: "Если бы не её своевременное вмешательство, ситуация бы обострилась" },
    { en: "The phenomenon has been extensively documented in scientific literature", ru: "Это явление широко задокументировано в научной литературе" },
    { en: "Nevertheless the implications of this discovery are far reaching", ru: "Тем не менее, последствия этого открытия имеют далеко идущие последствия" },
    { en: "I would rather you had told me the truth from the beginning", ru: "Я бы предпочёл, чтобы ты сказал мне правду с самого начала" },
    { en: "The intricacies of the English language never cease to amaze me", ru: "Тонкости английского языка не перестают меня удивлять" },
    { en: "Under no circumstances should this information be disclosed to unauthorized personnel", ru: "Ни при каких обстоятельствах эта информация не должна раскрываться посторонним" },
    { en: "By the time we arrived the meeting had already been adjourned", ru: "К тому времени, как мы приехали, заседание уже было отложено" },
    { en: "The extent to which technology has reshaped modern society cannot be overstated", ru: "Степень, в которой технологии изменили современное общество, невозможно переоценить" },
  ],
};

const distractorPool = [
  "always", "never", "sometimes", "quickly", "slowly", "carefully", "suddenly", "usually",
  "maybe", "perhaps", "already", "still", "just", "only", "even", "also", "really",
  "soon", "later", "yesterday", "today", "tomorrow", "here", "there", "now", "then",
  "again", "first", "last", "next", "much", "many", "more", "most", "very", "well",
  "quite", "rather", "almost", "enough", "too", "pretty", "actually", "simply",
];

interface FallingWord {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function PhraseBlast() {
  const { difficulty: rawDiff, endGame } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [phase, setPhase] = useState<"playing" | "feedback" | "finished">("playing");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCorrect, setFeedbackCorrect] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [collectedWords, setCollectedWords] = useState<FallingWord[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pool = phrasesByDifficulty[difficulty];
    const selected = shuffleArray(pool).slice(0, ROUNDS);
    setPhrases(selected);
  }, [difficulty]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const getDistractorCount = () => {
    if (difficulty === "beginner") return 1;
    if (difficulty === "intermediate") return 2;
    return 3;
  };

  const getSpeedRange = () => {
    if (difficulty === "beginner") return [0.3, 0.6];
    if (difficulty === "intermediate") return [0.5, 1.0];
    return [0.8, 1.5];
  };

  const spawnWords = useCallback(
    (phrase: Phrase) => {
      const words = phrase.en.split(" ");
      const distractors = shuffleArray(distractorPool).slice(0, getDistractorCount());
      const allWordTexts = [...words, ...distractors];
      const shuffled = shuffleArray(allWordTexts.map((text, i) => ({ text, origIndex: i })));

      const [minSpeed, maxSpeed] = getSpeedRange();
      const newFalling: FallingWord[] = shuffled.map((w, i) => ({
        id: `w-${round}-${i}-${Date.now()}`,
        text: w.text,
        x: 5 + Math.random() * 80,
        y: -(40 + Math.random() * 100),
        speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
      }));

      setFallingWords(newFalling);
      setCollectedWords([]);
      setPhase("playing");
      setFeedbackText("");
      setRoundStartTime(Date.now());
      setShowHint(false);
    },
    [difficulty, round]
  );

  useEffect(() => {
    if (phrases.length > 0 && round < phrases.length) {
      spawnWords(phrases[round]);
    }
  }, [round, phrases]);

  useEffect(() => {
    if (phase !== "playing") return;

    let lastTime = performance.now();
    const containerHeight = gameAreaRef.current?.clientHeight ?? 500;

    const animate = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      setFallingWords((prev) => {
        const updated = prev.map((w) => {
          const newY = w.y + w.speed * (dt / 16);
          if (newY > containerHeight + 20) {
            return { ...w, y: -(40 + Math.random() * 60), x: 5 + Math.random() * 80 };
          }
          return { ...w, y: newY };
        });
        return updated;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, difficulty]);

  const handleCollectWord = (word: FallingWord) => {
    if (phase !== "playing") return;
    setFallingWords((prev) => prev.filter((w) => w.id !== word.id));
    setCollectedWords((prev) => [...prev, word]);
  };

  const handleRemoveFromCollection = (word: FallingWord) => {
    if (phase !== "playing") return;
    setCollectedWords((prev) => prev.filter((w) => w.id !== word.id));
    setFallingWords((prev) => [
      ...prev,
      { ...word, y: -(40 + Math.random() * 60), x: 5 + Math.random() * 80 },
    ]);
  };

  const handleSubmit = () => {
    if (phase !== "playing" || phrases.length === 0) return;
    const current = phrases[round];
    const playerSentence = collectedWords.map((w) => w.text).join(" ");
    const correctSentence = current.en;

    const isCorrect = playerSentence.toLowerCase().trim() === correctSentence.toLowerCase().trim();

    const roundTime = (Date.now() - roundStartTime) / 1000;
    const maxTime = difficulty === "beginner" ? 60 : difficulty === "intermediate" ? 45 : 30;
    const speedBonus = Math.max(0, Math.round(MAX_SPEED_BONUS * (1 - roundTime / maxTime)));
    const earned = isCorrect ? BASE_SCORE + speedBonus : 0;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      setScore((s) => s + earned);
      setCorrectCount((c) => c + 1);
      setFeedbackCorrect(true);
      setFeedbackText(
        `Правильно! +${earned} очков (база ${BASE_SCORE} + бонус скорости ${speedBonus})`
      );
    } else {
      setStreak(0);
      setWrongCount((c) => c + 1);
      setFeedbackCorrect(false);
      const correctWords = correctSentence.split(" ");
      const playerWords = playerSentence.split(" ").filter(Boolean);
      let correction = `Было: "${playerSentence || "(пусто)"}"\nПравильно: "${correctSentence}"`;
      if (playerWords.length > 0 && playerWords.length === correctWords.length) {
        const mistakes: string[] = [];
        for (let i = 0; i < correctWords.length; i++) {
          if (playerWords[i]?.toLowerCase() !== correctWords[i]?.toLowerCase()) {
            mistakes.push(
              `позиция ${i + 1}: "${playerWords[i]}" → "${correctWords[i]}"`
            );
          }
        }
        if (mistakes.length > 0) {
          correction += `\n\nОшибки в порядке слов:\n${mistakes.join("\n")}`;
        }
      } else if (playerWords.length !== correctWords.length) {
        correction += `\n\nПодсказка: в предложении должно быть ${correctWords.length} слов, у вас ${playerWords.length}.`;
      }
      correction += `\n\nПеревод: ${current.ru}`;
      setFeedbackText(correction);
    }

    setPhase("feedback");
  };

  const handleNextRound = () => {
    if (round + 1 >= ROUNDS) {
      endGame({
        gameId: "phraseblast",
        score,
        correct: correctCount + (feedbackCorrect ? 1 : 0),
        wrong: wrongCount + (feedbackCorrect ? 0 : 1),
        streak: bestStreak,
        timeSpent,
      });
      setPhase("finished");
      return;
    }
    setRound((r) => r + 1);
  };

  const handleResetRound = () => {
    if (phrases.length === 0 || round >= phrases.length) return;
    spawnWords(phrases[round]);
  };

  if (phrases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка...</p>
      </div>
    );
  }

  const currentPhrase = phrases[round];
  const hintPieces = currentPhrase.en.split(" ");

  return (
    <div className="min-h-screen pb-4 flex flex-col">
      <GameHeader
        title="ФразоБум"
        current={round + 1}
        total={ROUNDS}
        streak={streak}
        score={score}
      />

      <div className="flex-1 max-w-4xl mx-auto px-4 pt-4 w-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-white/50 font-mono">
              Раунд {round + 1}/{ROUNDS}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="text-gray-500 dark:text-white/50"
            >
              <Languages className="w-4 h-4 mr-1" />
              {showHint ? "Скрыть перевод" : "Показать перевод"}
            </Button>
          </div>
          {phase === "playing" && (
            <Button variant="ghost" size="sm" onClick={handleResetRound}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Сбросить
            </Button>
          )}
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-3 mb-3 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-white/50">
              Перевод: <span className="text-primary-400">{currentPhrase.ru}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              Слов: {hintPieces.length} | Порядок: {hintPieces.map((_, i) => i + 1).join(" → ")}
            </p>
          </motion.div>
        )}

        {/* Game area with falling words */}
        <div
          ref={gameAreaRef}
          className="relative flex-1 glass-card rounded-xl overflow-hidden mb-3"
          style={{ minHeight: "380px" }}
        >
          {phase === "playing" &&
            fallingWords.map((w) => (
              <motion.button
                key={w.id}
                onClick={() => handleCollectWord(w)}
                className={cn(
                  "absolute px-3 py-2 rounded-lg font-mono text-sm font-semibold cursor-pointer",
                  "bg-white dark:bg-white/15 border border-gray-200 dark:border-white/20",
                  "hover:bg-primary-500/20 hover:border-primary-400/50 hover:text-primary-400",
                  "shadow-md dark:shadow-lg transition-colors",
                  "text-gray-800 dark:text-white/90"
                )}
                style={{
                  left: `${w.x}%`,
                  top: `${w.y}px`,
                  transform: "translateX(-50%)",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {w.text}
              </motion.button>
            ))}

          {phase === "playing" && fallingWords.length === 0 && collectedWords.length > 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 dark:text-white/40">
                Все слова собраны! Нажмите &quot;Готово&quot;
              </p>
            </div>
          )}
          {phase === "playing" && fallingWords.length === 0 && collectedWords.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 dark:text-white/40">Загрузка слов...</p>
            </div>
          )}

          {phase === "feedback" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "h-full flex flex-col items-center justify-center p-6",
                feedbackCorrect ? "text-green-400" : "text-red-400"
              )}
            >
              <p className="text-2xl font-bold mb-3">
                {feedbackCorrect ? "Отлично!" : "Не совсем!"}
              </p>
              <div className="whitespace-pre-line text-center text-sm text-gray-600 dark:text-white/70 max-w-md">
                {feedbackText}
              </div>
            </motion.div>
          )}
        </div>

        {/* Collected words bar */}
        <AnimatePresence>
          {phase === "playing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-3"
            >
              <div className="glass-strong rounded-xl p-3 min-h-[60px]">
                <p className="text-xs text-gray-500 dark:text-white/50 mb-2 font-mono">
                  Собрано ({collectedWords.length}/{hintPieces.length}):
                </p>
                <div className="flex flex-wrap gap-2 min-h-[28px] items-center">
                  {collectedWords.map((w) => (
                    <motion.button
                      key={w.id}
                      onClick={() => handleRemoveFromCollection(w)}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1.5 rounded-lg bg-primary-500/20 border border-primary-400/30 text-primary-400 font-mono text-sm font-semibold hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-400 transition-colors cursor-pointer"
                      title="Нажмите, чтобы убрать"
                    >
                      {w.text}
                    </motion.button>
                  ))}
                  {collectedWords.length === 0 && (
                    <span className="text-gray-400 dark:text-white/40 text-sm font-mono">
                      Кликайте на падающие слова, чтобы собрать предложение
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-3 mb-2">
          {phase === "playing" && (
            <Button
              onClick={handleSubmit}
              className="flex-1 gradient-primary"
              disabled={collectedWords.length === 0}
            >
              Готово
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {phase === "feedback" && (
            <Button onClick={handleNextRound} className="flex-1 gradient-primary">
              {round + 1 >= ROUNDS ? "Результаты" : "Далее"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Word bank hint */}
        {phase === "playing" && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 dark:text-white/40 text-center font-mono">
              Нужные слова:{" "}
              {hintPieces.map((w, i) => (
                <span
                  key={i}
                  className={cn(
                    "mx-0.5",
                    collectedWords.some((c) => c.text.toLowerCase() === w.toLowerCase())
                      ? "text-primary-400"
                      : "text-gray-500 dark:text-white/30"
                  )}
                >
                  {w}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
