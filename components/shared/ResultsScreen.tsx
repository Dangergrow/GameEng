"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Zap, Star, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionResult } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { Confetti } from "./Confetti";

interface ResultsScreenProps {
  result: SessionResult;
}

export function ResultsScreen({ result }: ResultsScreenProps) {
  const { goToLobby, startGame, stats } = useGameStore();

  const total = result.correct + result.wrong;
  const percentage = total > 0 ? Math.round((result.correct / total) * 100) : 0;

  const getGrade = () => {
    if (percentage === 100) return { label: "Идеально!", emoji: "👑", color: "text-yellow-400" };
    if (percentage >= 80) return { label: "Отлично!", emoji: "🌟", color: "text-green-400" };
    if (percentage >= 60) return { label: "Хорошо!", emoji: "👍", color: "text-blue-400" };
    if (percentage >= 40) return { label: "Продолжай!", emoji: "💪", color: "text-orange-400" };
    return { label: "Тренируйся ещё!", emoji: "📚", color: "text-red-400" };
  };

  const grade = getGrade();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 150 } },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti active={percentage >= 60} />

      <motion.div
        className="glass-strong rounded-2xl p-8 max-w-md w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <h2 className={`text-3xl font-bold ${grade.color} mb-2`}>{grade.label}</h2>
          <p className="text-gray-500 dark:text-white/50 mb-6">Раунд завершён</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="glass rounded-xl p-4">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl font-bold font-mono gradient-text">{result.score}</div>
            <div className="text-xs text-gray-500 dark:text-white/50">Очки</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass rounded-xl p-4">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-bold font-mono text-green-400">{percentage}%</div>
            <div className="text-xs text-gray-500 dark:text-white/50">Точность</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass rounded-xl p-4">
            <Zap className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <div className="text-2xl font-bold font-mono text-orange-400">{result.streak}</div>
            <div className="text-xs text-gray-500 dark:text-white/50">Лучшая серия</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass rounded-xl p-4">
            <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold font-mono text-blue-400">
              {Math.floor(result.timeSpent)}s
            </div>
            <div className="text-xs text-gray-500 dark:text-white/50">Время</div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="text-sm text-gray-500 dark:text-white/50 mb-2">
            {result.correct} правильно · {result.wrong} неправильно · {total} всего
          </div>
          {stats.coins > 0 && (
            <div className="text-sm text-amber-400 mb-4">
              Всего монет: {stats.coins}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <Button
            onClick={() => {
              if (result.gameId) startGame(result.gameId);
            }}
            className="w-full gradient-primary hover:opacity-90"
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
