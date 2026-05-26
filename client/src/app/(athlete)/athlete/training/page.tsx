"use client";

import { useNFC } from "@/hooks/useNFC";
import { Button } from "@/components/ui/Button";
import { Play, Pause, RotateCcw, Nfc, ChevronLeft } from "lucide-react";
import { GamificationStats } from "@/components/GamificationStats";
import { useGamification } from "@/hooks/useGamification";
import Link from "next/link";

export default function TrainingPlayer() {
  const { isReading, startScan, lastMessage } = useNFC();
  const { profile, awardXP } = useGamification();

  const handleFinishSession = async () => {
    const updated = await awardXP("workout-complete");
    if (updated?.message) {
      alert(updated.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <header className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <Link
            href="/p/govinda"
            className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <Button
            variant={isReading ? "primary" : "outline"}
            className={isReading ? "animate-pulse" : ""}
            onClick={startScan}
          >
            <Nfc className="w-4 h-4 mr-2" />
            {isReading ? "Aguardando Tag..." : "Scan Equipment"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Treino de Força
            </h1>
            <p className="text-zinc-500 font-bold italic uppercase text-sm">
              Sessão A1 - Ciclo de Potência
            </p>
          </div>
          {profile && (
            <div className="w-full md:w-80">
              <GamificationStats xp={profile.xp} level={profile.level} />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {/* Active Exercise Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center gap-6 border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
          <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">
            Próximo Exercício
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-center italic uppercase tracking-tighter">
            SUSPENSÃO EM REGLETE (20MM)
          </h2>

          <div className="flex gap-8 md:gap-16 my-4">
            <div className="text-center">
              <span className="block text-4xl md:text-6xl font-black italic tracking-tighter">
                7s
              </span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Tempo
              </span>
            </div>
            <div className="text-center">
              <span className="block text-4xl md:text-6xl font-black italic tracking-tighter">
                6
              </span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Reps
              </span>
            </div>
            <div className="text-center">
              <span className="block text-4xl md:text-6xl font-black italic tracking-tighter">
                +10kg
              </span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Carga
              </span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <Button
              size="lg"
              className="flex-1 h-20 rounded-2xl text-xl font-black italic uppercase tracking-tighter bg-white text-black hover:bg-zinc-200"
            >
              <Play className="w-6 h-6 mr-2 fill-current" /> INICIAR SÉRIE
            </Button>
          </div>
        </div>

        {/* Timer UI (Simplified) */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-800 rounded-xl">
              <RotateCcw className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">
                Descanso
              </span>
              <div className="text-3xl font-black italic tracking-tighter">
                02:00
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-14 w-14 rounded-xl border-white/10"
            >
              <Pause className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {lastMessage && (
          <div className="bg-emerald-900/20 text-emerald-400 p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest border border-emerald-900/30">
            {lastMessage}
          </div>
        )}
      </main>

      <footer className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-16 border-white/5 bg-zinc-900/50 text-zinc-400 font-black italic uppercase tracking-tighter hover:bg-zinc-900"
        >
          LOG SENTIMENTO (RPE)
        </Button>
        <Button
          onClick={handleFinishSession}
          className="h-16 bg-white text-black font-black italic uppercase tracking-tighter hover:bg-zinc-200"
        >
          FINALIZAR SESSÃO
        </Button>
      </footer>
    </div>
  );
}
