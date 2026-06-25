"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Check,
  Trash2,
  Search,
  RotateCcw,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGameStore } from "@/store/gameStore";
import { commonWords, COMMON_WORDS_TOTAL } from "@/lib/commonWords";
import { cn } from "@/lib/utils";

const WORDS_PER_PAGE = 10;

export function DictionaryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    learnedWords,
    addLearnedWord,
    removeLearnedWord,
    isWordLearned,
    resetLearnedWords,
  } = useGameStore();

  const [studyPage, setStudyPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [studyWords, setStudyWords] = useState<typeof commonWords>([]);

  const learnedCount = learnedWords.length;
  const progressPercent = COMMON_WORDS_TOTAL > 0
    ? (learnedCount / COMMON_WORDS_TOTAL) * 100
    : 0;

  const unlearnedWords = useMemo(
    () =>
      commonWords.filter((w) => !learnedWords.some((l) => l.word === w.en)),
    [learnedWords]
  );

  const refreshStudyWords = () => {
    const shuffled = [...unlearnedWords].sort(() => Math.random() - 0.5);
    setStudyWords(shuffled.slice(0, WORDS_PER_PAGE));
    setStudyPage(0);
  };

  useEffect(() => {
    refreshStudyWords();
  }, [learnedWords.length]);

  const handleLearn = (word: { en: string; ru: string }) => {
    addLearnedWord(word.en, word.ru);
  };

  const handleRemove = (word: string) => {
    removeLearnedWord(word);
  };

  const filteredLearned = useMemo(() => {
    if (!searchQuery.trim()) return learnedWords;
    const q = searchQuery.toLowerCase();
    return learnedWords.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.translation.toLowerCase().includes(q)
    );
  }, [learnedWords, searchQuery]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-strong max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 gradient-text">
              <BookOpen className="w-5 h-5" />
              Мой словарь
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-white/50">
              Выучено: {learnedCount} / {COMMON_WORDS_TOTAL}
            </DialogDescription>
          </DialogHeader>

          <Progress value={progressPercent} className="h-2" />

          <Tabs defaultValue="learn" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full">
              <TabsTrigger value="learn" className="flex-1">
                Изучение
              </TabsTrigger>
              <TabsTrigger value="mywords" className="flex-1">
                Мои слова ({learnedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="learn" className="flex-1 flex flex-col min-h-0 mt-4">
              {unlearnedWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-12">
                  <BookOpen className="w-12 h-12 text-primary-400" />
                  <p className="text-gray-500 dark:text-white/50 text-lg">
                    Все слова выучены!
                  </p>
                  <p className="text-gray-400 dark:text-white/40 text-sm">
                    Ты освоил все {COMMON_WORDS_TOTAL} слов.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmReset(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Сбросить и начать заново
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-white/50">
                      Осталось: {unlearnedWords.length} слов
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshStudyWords}
                      disabled={unlearnedWords.length === 0}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Обновить
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-2">
                      {studyWords.map((word, i) => (
                        <motion.div
                          key={word.en}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg transition-colors",
                            i % 2 === 0
                              ? "bg-gray-50 dark:bg-white/5"
                              : "bg-white dark:bg-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono font-semibold text-gray-900 dark:text-white truncate">
                              {word.en}
                            </span>
                            <span className="text-gray-500 dark:text-white/50 truncate">
                              — {word.ru}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLearn(word)}
                            className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 flex-shrink-0 ml-2"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Выучил
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>

            <TabsContent value="mywords" className="flex-1 flex flex-col min-h-0 mt-4">
              {learnedWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 dark:text-white/30" />
                  <p className="text-gray-500 dark:text-white/50 text-lg">
                    Пока нет выученных слов
                  </p>
                  <p className="text-gray-400 dark:text-white/40 text-sm">
                    Перейди во вкладку «Изучение» и начни учить!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/50" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по словам..."
                        className="pl-9"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-4 h-4 text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white" />
                        </button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmReset(true)}
                      className="flex-shrink-0 text-red-500 border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Сбросить
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 min-h-0 border rounded-lg border-gray-200 dark:border-white/10">
                      <div className="space-y-1 pr-2">
                        <AnimatePresence>
                          {filteredLearned.map((item, i) => (
                          <motion.div
                            key={item.word}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg transition-colors",
                              i % 2 === 0
                                ? "bg-gray-50 dark:bg-white/5"
                                : "bg-white dark:bg-transparent"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono font-semibold text-gray-900 dark:text-white truncate">
                                {item.word}
                              </span>
                              <span className="text-gray-500 dark:text-white/50 truncate">
                                — {item.translation}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(item.word)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {filteredLearned.length === 0 && searchQuery && (
                        <div className="text-center py-8 text-gray-500 dark:text-white/50">
                          Ничего не найдено по запросу «{searchQuery}»
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="glass-strong max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Сбросить словарь?
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-white/50">
              Все {learnedCount} выученных слов будут удалены. Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetLearnedWords();
                setConfirmReset(false);
                setSearchQuery("");
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Сбросить всё
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
