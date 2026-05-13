'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

// Static arrays hoisted outside the component to prevent reallocation on every render
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const slots = ["08:00", "10:00", "14:00", "16:00", "18:00", "20:00"];

export function ScheduleModule() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (selectedDay && selectedSlot) {
      setIsConfirmed(true);
      // Aqui chamaria a API do backend
    }
  };

  if (isConfirmed) {
    return (
      <div className="bg-zinc-900 border border-emerald-500/30 p-8 text-center space-y-4 rounded-2xl">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold italic uppercase">Treino Confirmado!</h3>
        <p className="text-zinc-400 text-sm italic">Sua sessão está agendada para {selectedDay} às {selectedSlot}.</p>
        <Button variant="outline" onClick={() => setIsConfirmed(false)} className="mt-4">AGENDAR OUTRO</Button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl space-y-8">
      <div className="flex items-center gap-2 text-zinc-500 mb-4 font-bold uppercase tracking-widest text-xs">
        <CalendarIcon className="w-4 h-4" />
        <span>Escolha o Dia e Horário</span>
      </div>

      <div className="flex justify-between gap-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 py-3 rounded-lg text-sm font-black italic transition-all ${
              selectedDay === day ? "bg-white text-black scale-105" : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {slots.map(slot => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`py-3 rounded-lg text-xs font-bold transition-all border ${
              selectedSlot === slot ? "border-white bg-white/10 text-white" : "border-white/5 text-zinc-500 hover:border-white/20"
            }`}
          >
            <Clock className="w-3 h-3 inline mr-1 opacity-50" /> {slot}
          </button>
        ))}
      </div>

      <Button
        disabled={!selectedDay || !selectedSlot}
        onClick={handleConfirm}
        className="w-full h-14 rounded-xl font-black italic text-lg uppercase tracking-tighter"
      >
        CONFIRMAR CHECK-IN
      </Button>
    </div>
  );
}
