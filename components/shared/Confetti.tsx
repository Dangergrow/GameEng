"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"];

export function Confetti({ active, duration = 2000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        size: 4 + Math.random() * 8,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: p.size > 6 ? "50%" : "2px",
              }}
              initial={{ y: "-10vh", opacity: 1, rotate: 0 }}
              animate={{
                y: "110vh",
                opacity: [1, 1, 0],
                rotate: p.rotation + 720,
                x: [0, (Math.random() - 0.5) * 200],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5 + Math.random() * 1.5,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
