"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { GameConfig } from "@/types";

interface GameCardProps {
  game: GameConfig;
  index: number;
  onPlay: () => void;
}

export function GameCard({ game, index, onPlay }: GameCardProps) {
  const IconComponent = game.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-card rounded-2xl p-6 cursor-pointer group gradient-border"
      onClick={onPlay}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${game.color} bg-opacity-20`}
        >
          {typeof IconComponent === "string" ? (
            <span className="text-2xl">{IconComponent}</span>
          ) : null}
        </div>
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <Button size="sm" className="gradient-primary rounded-full">
            <Play className="w-3 h-3 mr-1" />
            Play
          </Button>
        </motion.div>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all duration-300">
        {game.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed">
        {game.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {game.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}
