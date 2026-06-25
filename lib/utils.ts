import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Difficulty } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VALID_DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

export function validateDifficulty(value: unknown): Difficulty {
  if (typeof value === "string" && VALID_DIFFICULTIES.includes(value as Difficulty)) {
    return value as Difficulty;
  }
  return "beginner";
}
