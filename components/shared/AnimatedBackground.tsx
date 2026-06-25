"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-500/20 dark:bg-primary-500/10 blur-[120px] animate-blob1"
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-secondary-500/20 dark:bg-secondary-500/10 blur-[120px] animate-blob2"
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/10 blur-[100px] animate-blob3"
      />
    </div>
  );
}
