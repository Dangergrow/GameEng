"use client";

import { motion } from "framer-motion";

interface PulseWaveProps {
  active: boolean;
  className?: string;
}

export function PulseWave({ active, className = "" }: PulseWaveProps) {
  return (
    <div className={`flex items-center justify-center gap-[2px] h-16 ${className}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-primary-500 to-secondary-400"
          animate={
            active
              ? {
                  height: [4, 20 + Math.sin(i * 0.8) * 16, 4],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={{
            duration: 0.8,
            repeat: active ? Infinity : 0,
            delay: i * 0.07,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
