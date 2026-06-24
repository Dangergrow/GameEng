"use client";

import { ArrowLeft, Coins, Flame, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGameStore } from "@/store/gameStore";

interface GameHeaderProps {
  title: string;
  current: number;
  total: number;
  streak: number;
  score: number;
  timer?: number;
}

export function GameHeader({ title, current, total, streak, score, timer }: GameHeaderProps) {
  const { goToLobby, stats } = useGameStore();
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="sticky top-0 z-30 glass border-b border-gray-200 dark:border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => goToLobby()}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">В лобби</span>
          </button>

          <h2 className="text-lg font-bold font-mono gradient-text">{title}</h2>

          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span className="font-mono font-bold">{stats.coins}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Всего монет заработано</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm">
                  <Flame className={`w-4 h-4 ${streak >= 3 ? "text-orange-500" : "text-gray-400 dark:text-white/40"}`} />
                  <span className="font-mono font-bold">{score}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Счёт · Серия: {streak}</p>
              </TooltipContent>
            </Tooltip>

            {timer !== undefined && (
              <motion.div
                className={`flex items-center gap-1 text-sm font-mono ${
                  timer <= 10 ? "text-red-400" : "text-gray-600 dark:text-white/70"
                }`}
                animate={timer <= 10 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Timer className="w-4 h-4" />
                <span>{timer}s</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs text-gray-500 dark:text-white/50 font-mono">
            {current}/{total}
          </span>
        </div>
      </div>
    </div>
  );
}
