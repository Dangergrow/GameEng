"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Swords, Shield, Award, Zap, Target, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { getSynonymsForDifficulty, isValidSynonym, SynonymEntry } from "@/lib/synonyms";
import { cn, validateDifficulty } from "@/lib/utils";
import type { Difficulty } from "@/types";

const TURN_TIME = 10;
const OPPONENT_MIN_DELAY = 2000;
const OPPONENT_MAX_DELAY = 4000;
const MAX_STRIKES = 2;
const WIN_ROUND_SCORE = 20;
const VALID_SYNONYM_BONUS = 5;
const PERFECT_ROUND_BONUS = 15;

interface RoundState {
  word: SynonymEntry;
  playerSynonyms: string[];
  opponentSynonyms: string[];
  playerStrikes: number;
  turn: "player" | "opponent";
  timer: number;
  status: "active" | "playerWon" | "opponentWon" | "playerTimeout" | "opponentTimeout";
  roundScore: number;
  playerValidCount: number;
}

function getRoundCount(difficulty: Difficulty): number {
  if (difficulty === "beginner") return 5;
  if (difficulty === "intermediate") return 7;
  return 10;
}

function getOpponentDelay(): number {
  return OPPONENT_MIN_DELAY + Math.random() * (OPPONENT_MAX_DELAY - OPPONENT_MIN_DELAY);
}

export function SynonymClash() {
  const { difficulty: rawDiff, endGame } = useGameStore();
  const difficulty = validateDifficulty(rawDiff);
  const [words, setWords] = useState<SynonymEntry[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [roundStates, setRoundStates] = useState<RoundState[]>([]);
  const [roundState, setRoundState] = useState<RoundState | null>(null);
  const [playerInput, setPlayerInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [opponentThinking, setOpponentThinking] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roundCount = getRoundCount(difficulty);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const selected = getSynonymsForDifficulty(difficulty, roundCount);
    setWords(selected);
  }, [difficulty]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
  }, []);

  const initRound = useCallback(
    (word: SynonymEntry) => {
      clearTimers();
      const rs: RoundState = {
        word,
        playerSynonyms: [],
        opponentSynonyms: [],
        playerStrikes: 0,
        turn: "player",
        timer: TURN_TIME,
        status: "active",
        roundScore: 0,
        playerValidCount: 0,
      };
      setRoundState(rs);
      setPlayerInput("");
      setInputError("");
      setOpponentThinking(false);

      timerRef.current = setInterval(() => {
        setRoundState((s) => {
          if (!s || s.status !== "active") return s;
          const newTimer = s.timer - 1;
          if (newTimer <= 0) {
            const loser = s.turn === "player" ? "playerTimeout" : "opponentTimeout";
            return { ...s, status: loser, timer: 0 };
          }
          return { ...s, timer: newTimer };
        });
      }, 1000);

      inputRef.current?.focus();
    },
    [clearTimers]
  );

  useEffect(() => {
    if (words.length > 0 && currentRound < words.length) {
      initRound(words[currentRound]);
    }
  }, [currentRound, words]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const opponentMove = useCallback(() => {
    if (!roundState || roundState.status !== "active") return;
    setOpponentThinking(true);
    const delay = getOpponentDelay();

    opponentTimerRef.current = setTimeout(() => {
      setRoundState((s) => {
        if (!s || s.status !== "active") return s;
        const available = s.word.synonyms.filter(
          (syn) =>
            !s.playerSynonyms.includes(syn) && !s.opponentSynonyms.includes(syn)
        );
        if (available.length === 0) {
          return { ...s, status: "playerWon" };
        }
        const picked = available[Math.floor(Math.random() * available.length)];
        setOpponentThinking(false);
        return {
          ...s,
          opponentSynonyms: [...s.opponentSynonyms, picked],
          turn: "player",
          timer: TURN_TIME,
        };
      });
    }, delay);
  }, [roundState]);

  const handlePlayerSubmit = () => {
    if (!roundState || roundState.status !== "active" || roundState.turn !== "player") return;
    const input = playerInput.trim();
    if (!input) return;

    if (roundState.playerSynonyms.some((s) => s.toLowerCase() === input.toLowerCase())) {
      setInputError("Этот синоним уже использован!");
      return;
    }
    if (roundState.opponentSynonyms.some((s) => s.toLowerCase() === input.toLowerCase())) {
      setInputError("Противник уже назвал этот синоним!");
      return;
    }
    if (input.toLowerCase() === roundState.word.word.toLowerCase()) {
      setInputError("Нельзя использовать само слово!");
      return;
    }

    const valid = isValidSynonym(roundState.word, input);

    if (valid) {
      setInputError("");
      setPlayerInput("");
      const newPlayerSynonyms = [...roundState.playerSynonyms, input.toLowerCase()];
      const newValidCount = roundState.playerValidCount + 1;
      const newRoundScore = roundState.roundScore + VALID_SYNONYM_BONUS;

      setRoundState((s) => {
        if (!s) return s;
        return {
          ...s,
          playerSynonyms: newPlayerSynonyms,
          playerValidCount: newValidCount,
          roundScore: newRoundScore,
          turn: "opponent",
          timer: TURN_TIME,
        };
      });
    } else {
      const newStrikes = roundState.playerStrikes + 1;
      setInputError(
        `"${input}" не является синонимом! Штраф ${newStrikes}/${MAX_STRIKES}`
      );
      setPlayerInput("");

      if (newStrikes >= MAX_STRIKES) {
        setRoundState((s) => {
          if (!s) return s;
          return { ...s, playerStrikes: newStrikes, status: "opponentWon" };
        });
      } else {
        setRoundState((s) => {
          if (!s) return s;
          return { ...s, playerStrikes: newStrikes };
        });
      }
    }
  };

  useEffect(() => {
    if (roundState?.turn === "opponent" && roundState.status === "active") {
      opponentMove();
    }
  }, [roundState?.turn, roundState?.status]);

  useEffect(() => {
    if (roundState?.status && roundState.status !== "active") {
      clearTimers();
      const rs = roundState;
      const won = rs.status === "playerWon" || rs.status === "opponentTimeout";

      let roundScore = rs.roundScore;
      if (won) {
        roundScore += WIN_ROUND_SCORE;
        const allSynonyms = rs.word.synonyms;
        const usedAll = allSynonyms.every(
          (s) =>
            rs.playerSynonyms.includes(s) || rs.opponentSynonyms.includes(s)
        );
        if (usedAll) {
          roundScore += PERFECT_ROUND_BONUS;
        }
      }

      setRoundStates((prev) => [...prev, { ...rs, roundScore }]);

      if (won) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setBestStreak(Math.max(bestStreak, newStreak));
        setScore((s) => s + roundScore);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setStreak(0);
        setScore((s) => s + rs.roundScore);
      }
    }
  }, [roundState?.status]);

  const handleNextRound = () => {
    if (currentRound + 1 >= words.length) {
      endGame({
        gameId: "synonymclash",
        score,
        correct: roundStates.filter((r) => r.status === "playerWon" || r.status === "opponentTimeout").length,
        wrong: roundStates.filter((r) => r.status === "opponentWon" || r.status === "playerTimeout").length,
        streak: bestStreak,
        timeSpent,
      });
      setGameOver(true);
      return;
    }
    setCurrentRound((r) => r + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePlayerSubmit();
    }
  };

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Загрузка...</p>
      </div>
    );
  }

  if (!roundState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/50">Подготовка раунда...</p>
      </div>
    );
  }

  const totalSynonyms = roundState.word.synonyms;
  const allUsedSynonyms = [
    ...roundState.playerSynonyms,
    ...roundState.opponentSynonyms,
  ];
  const remainingSynonyms = totalSynonyms.filter(
    (s) => !allUsedSynonyms.includes(s)
  );

  const roundWon =
    roundState.status === "playerWon" || roundState.status === "opponentTimeout";
  const roundLost =
    roundState.status === "opponentWon" || roundState.status === "playerTimeout";

  if (gameOver) {
    const playerWins = roundStates.filter(
      (r) => r.status === "playerWon" || r.status === "opponentTimeout"
    ).length;
    const opponentWins = roundStates.filter(
      (r) => r.status === "opponentWon" || r.status === "playerTimeout"
    ).length;
    const totalPlayerSynonyms = roundStates.reduce(
      (acc, r) => acc + r.playerValidCount,
      0
    );
    const totalAvailable = roundStates.reduce(
      (acc, r) => acc + r.word.synonyms.length,
      0
    );
    const bestRound = roundStates.reduce(
      (max, r) => Math.max(max, r.playerValidCount),
      0
    );
    const worstRound = roundStates.reduce(
      (min, r) => (r.playerValidCount < min ? r.playerValidCount : min),
      Infinity
    );

    return (
      <div className="min-h-screen pb-8">
        <GameHeader
          title="СинонимБой"
          current={words.length}
          total={words.length}
          streak={bestStreak}
          score={score}
        />
        <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 text-center"
          >
            <Swords className="w-16 h-16 mx-auto mb-4 text-primary-400" />
            <h2 className="text-3xl font-bold gradient-text mb-2">Дуэль окончена!</h2>
            <p className="text-2xl font-mono font-bold text-primary-400 mb-6">
              {playerWins > opponentWins
                ? "Победа!"
                : playerWins < opponentWins
                  ? "Поражение..."
                  : "Ничья!"}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Победы игрока</p>
                <p className="text-2xl font-bold text-green-400">{playerWins}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Победы соперника</p>
                <p className="text-2xl font-bold text-red-400">{opponentWins}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Синонимов названо</p>
                <p className="text-2xl font-bold text-primary-400">
                  {totalPlayerSynonyms}/{totalAvailable}
                </p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-gray-400 dark:text-white/40 mb-1">Итоговый счёт</p>
                <p className="text-2xl font-bold text-amber-400">{score}</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 dark:text-white/40 mb-2">Статистика раундов</p>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40">Лучший раунд</p>
                  <p className="text-lg font-bold text-green-400">
                    {bestRound === Infinity ? 0 : bestRound} синонимов
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40">Худший раунд</p>
                  <p className="text-lg font-bold text-red-400">
                    {worstRound === Infinity ? 0 : worstRound} синонимов
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader
        title="СинонимБой"
        current={currentRound + 1}
        total={words.length}
        streak={streak}
        score={score}
        timer={roundState.turn === "player" ? roundState.timer : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Word display */}
            <motion.div
              className="text-center glass-strong rounded-2xl p-8"
              animate={
                roundState.status === "opponentWon" || roundState.status === "playerTimeout"
                  ? { x: [0, -10, 10, -10, 0] }
                  : {}
              }
            >
              <h2 className="text-4xl md:text-5xl font-bold font-mono gradient-text mb-3">
                {roundState.word.word}
              </h2>
              <p className="text-xl text-gray-500 dark:text-white/40 font-mono">
                {roundState.word.translation}
              </p>
              <p className="text-sm text-gray-400 dark:text-white/30 mt-2">
                Доступно синонимов: {totalSynonyms.length} | Осталось: {remainingSynonyms.length}
              </p>

              {/* Strikes */}
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                  <Zap
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < roundState.playerStrikes
                        ? "text-red-400"
                        : "text-gray-300 dark:text-white/20"
                    )}
                  />
                ))}
              </div>
            </motion.div>

            {/* Turn indicator + Timer */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-mono",
                    roundState.turn === "player"
                      ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                      : "bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10"
                  )}
                >
                  {roundState.turn === "player" ? "Ваш ход" : "Ход соперника"}
                </div>
                {roundState.turn === "player" && (
                  <motion.div
                    className={cn(
                      "flex items-center gap-1 text-sm font-mono",
                      roundState.timer <= 3 ? "text-red-400" : "text-gray-500 dark:text-white/50"
                    )}
                    animate={roundState.timer <= 3 ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Timer className="w-4 h-4" />
                    <span>{roundState.timer}с</span>
                  </motion.div>
                )}
                {opponentThinking && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <span className="animate-pulse">Противник думает...</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400 dark:text-white/50">Очки раунда</p>
                <p className="font-mono font-bold text-amber-400">{roundState.roundScore}</p>
              </div>
            </div>

            {/* Player vs Opponent columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Player */}
              <motion.div
                className="glass-card rounded-xl p-4 min-h-[120px] border-green-500/20"
                animate={roundWon ? { scale: [1, 1.02, 1] } : {}}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  <p className="text-sm font-semibold text-green-400">Вы</p>
                </div>
                <div className="space-y-1.5">
                  {roundState.playerSynonyms.map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-sm"
                    >
                      {s}
                    </motion.div>
                  ))}
                  {roundState.playerSynonyms.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-white/30 italic">
                      Ждём синонимы...
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Opponent */}
              <motion.div
                className="glass-card rounded-xl p-4 min-h-[120px] border-red-500/20"
                animate={roundLost ? { scale: [1, 1.02, 1] } : {}}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Swords className="w-4 h-4 text-red-400" />
                  <p className="text-sm font-semibold text-red-400">Противник</p>
                </div>
                <div className="space-y-1.5">
                  {roundState.opponentSynonyms.map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-sm"
                    >
                      {s}
                    </motion.div>
                  ))}
                  {roundState.opponentSynonyms.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-white/30 italic">
                      Ожидание...
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Input area */}
            {roundState.status === "active" && roundState.turn === "player" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={playerInput}
                    onChange={(e) => {
                      setPlayerInput(e.target.value);
                      setInputError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите синоним..."
                    className={cn(
                      "flex-1 text-lg font-mono bg-gray-50 dark:bg-white/5",
                      inputError && "border-red-500"
                    )}
                    disabled={roundState.status !== "active"}
                  />
                  <Button onClick={handlePlayerSubmit} disabled={!playerInput.trim()}>
                    <Target className="w-4 h-4 mr-1" />
                    Ответ
                  </Button>
                </div>
                {inputError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-400 font-mono"
                  >
                    {inputError}
                  </motion.p>
                )}
              </div>
            )}

            {/* Round result */}
            <AnimatePresence>
              {roundState.status !== "active" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div
                    className={cn(
                      "glass-card rounded-xl p-6 text-center",
                      roundWon ? "border-green-500/30" : "border-red-500/30"
                    )}
                  >
                    {roundWon ? (
                      <div className="space-y-2">
                        <Award className="w-10 h-10 mx-auto text-amber-400" />
                        <p className="text-xl font-bold text-green-400">Раунд выигран!</p>
                        <p className="text-sm text-gray-500 dark:text-white/50">
                          +{WIN_ROUND_SCORE} за победу{" "}
                          {roundState.roundScore - WIN_ROUND_SCORE > 0 &&
                            `+${roundState.roundScore - WIN_ROUND_SCORE} за синонимы`}
                        </p>
                        {roundState.playerSynonyms.length + roundState.opponentSynonyms.length ===
                          totalSynonyms.length && (
                          <p className="text-amber-400 text-sm">
                            Идеальный раунд! +{PERFECT_ROUND_BONUS} бонус
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Swords className="w-10 h-10 mx-auto text-red-400" />
                        <p className="text-xl font-bold text-red-400">Раунд проигран</p>
                        <p className="text-sm text-gray-500 dark:text-white/50">
                          {roundState.status === "playerTimeout"
                            ? "Время вышло!"
                            : "Слишком много ошибок!"}
                        </p>
                        {remainingSynonyms.length > 0 && (
                          <p className="text-sm text-gray-400 dark:text-white/40 mt-3">
                            Оставшиеся синонимы:{" "}
                            <span className="text-primary-400">
                              {remainingSynonyms.join(", ")}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button onClick={handleNextRound} className="w-full gradient-primary">
                    {currentRound + 1 >= words.length ? "Результаты" : "Следующий раунд"}
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
