'use client';

import { useNFC } from "@/hooks/useNFC";
import { Button } from "@/components/ui/Button";
import { Play, Pause, RotateCcw, Nfc } from "lucide-react";

export default function TrainingPlayer() {
  const { isSupported, isReading, startScan, lastMessage } = useNFC();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Treino de Força</h1>
          <p className="text-zinc-400">Sessão A1 - Ciclo de Potência</p>
        </div>
        <Button
          variant={isReading ? "primary" : "outline"}
          className={isReading ? "animate-pulse" : ""}
          onClick={startScan}
        >
          <Nfc className="w-4 h-4 mr-2" />
          {isReading ? "Aguardando Tag..." : "Scan Equipment"}
        </Button>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {/* Active Exercise Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center gap-6 border border-zinc-800">
          <span className="text-zinc-500 font-medium uppercase tracking-widest text-sm">Próximo Exercício</span>
          <h2 className="text-4xl font-black text-center">SUSPENSÃO EM REGLETE (20MM)</h2>

          <div className="flex gap-12 my-4">
            <div className="text-center">
              <span className="block text-4xl font-bold">7s</span>
              <span className="text-zinc-500 text-sm">Tempo</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold">6</span>
              <span className="text-zinc-500 text-sm">Reps</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold">+10kg</span>
              <span className="text-zinc-500 text-sm">Carga</span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <Button size="lg" className="flex-1 h-20 rounded-2xl text-xl">
              <Play className="w-6 h-6 mr-2 fill-current" /> INICIAR
            </Button>
          </div>
        </div>

        {/* Timer UI (Simplified) */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 flex justify-between items-center">
          <div>
            <span className="text-zinc-500 text-xs uppercase font-bold">Descanso</span>
            <div className="text-3xl font-mono">02:00</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><RotateCcw className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm"><Pause className="w-4 h-4" /></Button>
          </div>
        </div>

        {lastMessage && (
          <div className="bg-blue-900/20 text-blue-400 p-3 rounded-lg text-center text-sm border border-blue-900/30">
            {lastMessage}
          </div>
        )}
      </main>

      <footer className="mt-auto grid grid-cols-2 gap-4">
        <Button variant="secondary" className="h-14">LOG SENTIMENTO (RPE)</Button>
        <Button variant="secondary" className="h-14">FINALIZAR SESSÃO</Button>
      </footer>
    </div>
  );
}
