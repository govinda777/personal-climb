"use client";

import { motion } from "framer-motion";
import { Zap, Trophy } from "lucide-react";

interface GamificationStatsProps {
  xp: number;
  level: number;
}

export function GamificationStats({ xp, level }: GamificationStatsProps) {
  // XP to next level: (level)^2 * 100
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const progress =
    ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            Current Level
          </span>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-3xl font-black italic italic">
              LVL {level}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            Total XP
          </span>
          <div className="text-xl font-black italic">{xp}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <span>{xp - xpForCurrentLevel} XP</span>
          <span>{xpForNextLevel - xpForCurrentLevel} XP</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold italic text-zinc-500 uppercase">
        <Zap className="w-3 h-3 text-white animate-pulse" />
        <span>Próximo marco: Badge de Nível {level + 1}</span>
      </div>
    </div>
  );
}
