"use client";

import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 glass rounded-full p-2 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5 text-primary-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        )}
      </motion.div>
    </motion.button>
  );
}
