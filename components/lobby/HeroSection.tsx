"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const floatingLetters = [
  { char: "a", x: 10, y: 20, delay: 0, size: "text-2xl" },
  { char: "e", x: 80, y: 15, delay: 1.5, size: "text-3xl" },
  { char: "n", x: 25, y: 65, delay: 0.8, size: "text-xl" },
  { char: "g", x: 70, y: 70, delay: 2, size: "text-2xl" },
  { char: "l", x: 45, y: 40, delay: 1.2, size: "text-4xl" },
  { char: "i", x: 60, y: 30, delay: 0.5, size: "text-xl" },
  { char: "s", x: 15, y: 80, delay: 2.5, size: "text-3xl" },
  { char: "h", x: 85, y: 55, delay: 1.8, size: "text-2xl" },
];

export function HeroSection() {
  return (
    <div className="relative text-center py-16 md:py-24 overflow-hidden">
      {floatingLetters.map((letter, i) => (
        <motion.span
          key={i}
          className={`absolute font-bold text-primary-400/20 ${letter.size}`}
          style={{ left: `${letter.x}%`, top: `${letter.y}%` }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: letter.delay,
            ease: "easeInOut",
          }}
        >
          {letter.char}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary-500 dark:text-primary-400" />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
            <span className="gradient-text">Учи английский играючи</span>
          </h1>
        </div>
        <p className="text-lg md:text-xl text-gray-500 dark:text-white/60 max-w-2xl mx-auto font-light">
          Коллекция игр для прокачки словарного запаса, грамматики, аудирования и правописания. Играй и учись!
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-primary-400/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </div>
  );
}
