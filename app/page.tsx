"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, RotateCcw } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { HeroSection } from "@/components/lobby/HeroSection";
import { GameCard } from "@/components/lobby/GameCard";
import { ThemeToggle } from "@/components/lobby/ThemeToggle";
import { ResultsScreen } from "@/components/shared/ResultsScreen";
import { DictionaryDialog } from "@/components/dictionary/DictionaryDialog";
import { WordVault } from "@/components/games/WordVault";
import { GrammarForge } from "@/components/games/GrammarForge";
import { EchoChamber } from "@/components/games/EchoChamber";
import { Spellstorm } from "@/components/games/Spellstorm";
import { IdiomLab } from "@/components/games/IdiomLab";
import { WordHunt } from "@/components/games/WordHunt";
import { TensePortal } from "@/components/games/TensePortal";
import { PhraseBlast } from "@/components/games/PhraseBlast";
import { SynonymClash } from "@/components/games/SynonymClash";
import { DialogueBuilder } from "@/components/games/DialogueBuilder";
import { ColorsNumbers } from "@/components/games/ColorsNumbers";
import { gameConfigs } from "@/lib/gameConfigs";
import { useGameStore } from "@/store/gameStore";

const gameComponents = {
  wordvault: WordVault,
  grammarforge: GrammarForge,
  echochamber: EchoChamber,
  spellstorm: Spellstorm,
  idiomlab: IdiomLab,
  wordhunt: WordHunt,
  tenseportal: TensePortal,
  phraseblast: PhraseBlast,
  synonymclash: SynonymClash,
  dialoguebuilder: DialogueBuilder,
  colorsnumbers: ColorsNumbers,
};

export default function Home() {
  const { screen, currentGame, sessionResult, gameSession, startGame, loadStats } = useGameStore();
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (screen === "lobby") {
      window.speechSynthesis?.cancel();
    }
  }, [screen]);

  const GameComponent = currentGame ? gameComponents[currentGame] : null;

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <ThemeToggle />

      <button
        onClick={() => window.location.reload()}
        className="fixed top-4 left-4 z-50 glass rounded-full p-2 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
        aria-label="Перезапустить приложение"
        title="Перезапустить приложение"
      >
        <RotateCcw className="w-5 h-5 text-gray-500 dark:text-primary-400" />
      </button>

      <AnimatePresence mode="wait">
        {screen === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection />

            <div className="max-w-5xl mx-auto px-4 pb-8">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {/* Dictionary card — first */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card rounded-2xl p-6 cursor-pointer group gradient-border"
                  onClick={() => setDictionaryOpen(true)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-600 to-indigo-600">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all duration-300">
                    Мой словарь
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed">
                    Учи самые частотные слова английского языка. Отмечай выученные и отслеживай прогресс.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/20 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Словарь
                    </span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/20 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Прогресс
                    </span>
                  </div>
                </motion.div>

                {gameConfigs.map((game, i) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    index={i + 1}
                    onPlay={() => startGame(game.id)}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 text-center"
              >
                <p className="text-gray-300 dark:text-white/20 text-sm">
                  Все игры работают без интернета. Прогресс сохраняется локально.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === "playing" && GameComponent && (
          <motion.div
            key={`${currentGame}-${gameSession}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <GameComponent />
          </motion.div>
        )}

        {screen === "results" && sessionResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsScreen result={sessionResult} />
          </motion.div>
        )}
      </AnimatePresence>

      <DictionaryDialog open={dictionaryOpen} onOpenChange={setDictionaryOpen} />
    </main>
  );
}
