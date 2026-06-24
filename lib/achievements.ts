import { GameStats, Achievement } from "@/types";

export const achievements: Achievement[] = [
  {
    id: "first-game",
    title: "First Steps",
    description: "Complete your first game",
    icon: "🎮",
    condition: (stats) => stats.totalGamesPlayed >= 1,
  },
  {
    id: "ten-games",
    title: "Getting Serious",
    description: "Complete 10 games",
    icon: "🎯",
    condition: (stats) => stats.totalGamesPlayed >= 10,
  },
  {
    id: "fifty-games",
    title: "Dedicated Learner",
    description: "Complete 50 games",
    icon: "🏆",
    condition: (stats) => stats.totalGamesPlayed >= 50,
  },
  {
    id: "hundred-games",
    title: "Centurion",
    description: "Complete 100 games",
    icon: "👑",
    condition: (stats) => stats.totalGamesPlayed >= 100,
  },
  {
    id: "streak-5",
    title: "On Fire",
    description: "Get a streak of 5 correct answers",
    icon: "🔥",
    condition: (stats) => stats.bestStreak >= 5,
  },
  {
    id: "streak-10",
    title: "Unstoppable",
    description: "Get a streak of 10 correct answers",
    icon: "⚡",
    condition: (stats) => stats.bestStreak >= 10,
  },
  {
    id: "streak-20",
    title: "Perfect Flow",
    description: "Get a streak of 20 correct answers",
    icon: "💎",
    condition: (stats) => stats.bestStreak >= 20,
  },
  {
    id: "words-10",
    title: "Word Collector",
    description: "Collect 10 words in Word Vault",
    icon: "📚",
    condition: (stats) => stats.wordsCollected >= 10,
  },
  {
    id: "words-50",
    title: "Lexicon Builder",
    description: "Collect 50 words in Word Vault",
    icon: "📖",
    condition: (stats) => stats.wordsCollected >= 50,
  },
  {
    id: "words-100",
    title: "Walking Dictionary",
    description: "Collect 100 words in Word Vault",
    icon: "🧠",
    condition: (stats) => stats.wordsCollected >= 100,
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Play a game after 10 PM",
    icon: "🦉",
    condition: (stats) => {
      const hour = new Date().getHours();
      return hour >= 22 || hour < 5;
    },
  },
  {
    id: "morning-bird",
    title: "Early Bird",
    description: "Play a game before 8 AM",
    icon: "🌅",
    condition: (stats) => {
      const hour = new Date().getHours();
      return hour >= 5 && hour < 8;
    },
  },
  {
    id: "coins-100",
    title: "Coin Hoarder",
    description: "Earn 100 coins",
    icon: "🪙",
    condition: (stats) => stats.coins >= 100,
  },
  {
    id: "coins-500",
    title: "Treasure Hunter",
    description: "Earn 500 coins",
    icon: "💎",
    condition: (stats) => stats.coins >= 500,
  },
  {
    id: "coins-1000",
    title: "Millionaire Mind",
    description: "Earn 1000 coins",
    icon: "💰",
    condition: (stats) => stats.coins >= 1000,
  },
  {
    id: "all-games",
    title: "Jack of All Trades",
    description: "Play every game type at least once",
    icon: "🎪",
    condition: (stats) => {
      const types = ["wordvault", "grammarforge", "echochamber", "spellstorm", "idiomlab"];
      return types.every((t) => (stats.gamesByType[t as keyof typeof stats.gamesByType]?.played ?? 0) > 0);
    },
  },
  {
    id: "perfect-game",
    title: "Flawless Victory",
    description: "Get 100% correct in any game",
    icon: "✨",
    condition: () => false,
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a game in under 60 seconds",
    icon: "⚡",
    condition: () => false,
  },
];

export function checkAchievements(stats: GameStats): Achievement[] {
  return achievements.filter((a) => !stats.achievements.includes(a.id) && a.condition(stats));
}

export function checkSpecialAchievements(
  stats: GameStats,
  sessionCorrect: number,
  sessionTotal: number,
  sessionTime: number
): Achievement[] {
  const newAchievements: Achievement[] = [];
  const perfectGame = achievements.find((a) => a.id === "perfect-game");
  const speedDemon = achievements.find((a) => a.id === "speed-demon");

  if (perfectGame && !stats.achievements.includes("perfect-game") && sessionCorrect === sessionTotal && sessionTotal > 0) {
    newAchievements.push(perfectGame);
  }

  if (speedDemon && !stats.achievements.includes("speed-demon") && sessionTime < 60) {
    newAchievements.push(speedDemon);
  }

  return newAchievements;
}
