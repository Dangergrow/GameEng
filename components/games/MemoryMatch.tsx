"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameHeader } from "@/components/shared/GameHeader";
import { Confetti } from "@/components/shared/Confetti";
import { useGameStore } from "@/store/gameStore";
import { wordBanks } from "@/lib/words";
import { cn } from "@/lib/utils";

const PAIRS_COUNT = 8;
const FLIP_DELAY = 600;

interface Card {
  id: number;
  pairId: number;
  type: "en" | "ru";
  text: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryMatch() {
  const { endGame } = useGameStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(3);
  const [lockBoard, setLockBoard] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const initRound = useCallback(() => {
    const words = shuffle(wordBanks.intermediate).slice(0, PAIRS_COUNT);
    const newCards: Card[] = [];
    words.forEach((w, i) => {
      newCards.push({ id: i * 2, pairId: i, type: "en", text: w.word, flipped: false, matched: false });
      newCards.push({ id: i * 2 + 1, pairId: i, type: "ru", text: w.translation, flipped: false, matched: false });
    });
    setCards(shuffle(newCards));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStreak(0);
    setLockBoard(false);
  }, []);

  useEffect(() => {
    initRound();
  }, [initRound]);

  const handleCardClick = (card: Card) => {
    if (lockBoard || gameOver) return;
    if (flipped.includes(card.id) || matched.includes(card.pairId)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLockBoard(true);

      const first = cards.find((c) => c.id === newFlipped[0])!;
      const second = cards.find((c) => c.id === newFlipped[1])!;

      if (first.pairId === second.pairId) {
        const newMatched = [...matched, first.pairId];
        setMatched(newMatched);
        setScore((s) => s + 20);
        setStreak((st) => {
          const ns = st + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
        setFlipped([]);
        setLockBoard(false);

        if (newMatched.length === PAIRS_COUNT) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }
      } else {
        setStreak(0);
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, FLIP_DELAY);
      }
    }
  };

  const handleNext = () => {
    if (round + 1 >= totalRounds) {
      setGameOver(true);
      endGame({
        gameId: "memorymatch",
        score,
        correct: matched.length,
        wrong: moves - matched.length,
        streak: bestStreak,
        timeSpent,
      });
      return;
    }
    setRound((r) => r + 1);
    initRound();
  };

  const isCardFlipped = (card: Card) => flipped.includes(card.id) || matched.includes(card.pairId);

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} />
      <GameHeader title="Найди Пару" current={round + 1} total={totalRounds} streak={matched.length} score={score} />

      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div key={round} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline">Раунд {round + 1}/{totalRounds}</Badge>
            <span className="text-gray-500 dark:text-white/50">Ходы: {moves}</span>
            <span className="text-gray-500 dark:text-white/50">Пары: {matched.length}/{PAIRS_COUNT}</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-3">
            <AnimatePresence>
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: isCardFlipped(card) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center p-1 text-center transition-all border-2",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isCardFlipped(card)
                      ? matched.includes(card.pairId)
                        ? "bg-green-500/20 border-green-500"
                        : "bg-primary-500/20 border-primary-400"
                      : "glass-card hover:border-primary/30 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-mono font-semibold break-words leading-tight",
                      "transition-all duration-300",
                      isCardFlipped(card) ? "scale-x-[-1]" : "",
                      matched.includes(card.pairId) ? "text-green-400" : "text-primary-300",
                      !isCardFlipped(card) && "text-gray-400 dark:text-white/40"
                    )}
                    style={isCardFlipped(card) ? { transform: "scaleX(-1)" } : {}}
                  >
                    {isCardFlipped(card) ? card.text : "?"}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {matched.length === PAIRS_COUNT && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-xl p-4 text-center mb-3">
                <Zap className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-400">Все пары найдены!</p>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {moves} ходов · +{score} очков
                </p>
              </div>
              <Button onClick={handleNext} className="w-full gradient-primary">
                {round + 1 >= totalRounds ? "Результаты" : "Следующий раунд"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
