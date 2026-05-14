'use client';

import { useState, use } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ChevronLeft, Bot } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ApprovalPage({ params }: { params: Promise<{ planId: string }> }) {
  const resolvedParams = use(params);
  const { planId } = resolvedParams;
  const { getAccessToken, authenticated } = usePrivy();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Mock JSON representing what the AI generated
  const aiGeneratedPlan = {
    analise_perfil: "Atleta com boa força de dedos, mas falhando em rotas longas. Histórico recente sem lesões.",
    objetivo_mesociclo: "Resistência de Força (Power Endurance)",
    planejamento_semanal: [
      {
        dia: "Terça-feira",
        foco: "Blocos Intensos",
        exercicios: [
          { nome: "Campus Board - Ladders", series: 3, reps: "1-4-7", descanso: "3min" },
          { nome: "Moonboard - V5", series: 4, reps: "1", descanso: "4min" }
        ]
      },
      {
        dia: "Quinta-feira",
        foco: "Volume/Resistência",
        exercicios: [
          { nome: "4x4 em V3", series: 4, reps: "4", descanso: "2min" },
          { nome: "Suspensão 20mm", series: 5, reps: "10s", carga: "+5kg", descanso: "2min" }
        ]
      }
    ]
  };

  const handleApprove = async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/personals/me/approve-plan/${planId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Plano aprovado com sucesso!");
        router.push('/professor/dashboard');
      } else {
        alert("Erro ao aprovar plano.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      <nav className="p-6 bg-white border-b border-zinc-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/professor/dashboard" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-xl tracking-tighter uppercase">Revisão de Protocolo AI</h1>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-amber-500 font-bold uppercase tracking-widest text-sm mb-8">
            <Bot className="w-5 h-5" /> Sugestão da IA
          </div>

          <div className="space-y-2">
            <h3 className="font-black italic uppercase text-zinc-400 text-xs tracking-widest">Análise de Perfil</h3>
            <p className="text-lg font-medium">{aiGeneratedPlan.analise_perfil}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-black italic uppercase text-zinc-400 text-xs tracking-widest">Objetivo do Mesociclo</h3>
            <p className="text-2xl font-black italic uppercase tracking-tighter">{aiGeneratedPlan.objetivo_mesociclo}</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-100">
            <h3 className="font-black italic uppercase text-zinc-400 text-xs tracking-widest mb-4">Estrutura Semanal</h3>
            {aiGeneratedPlan.planejamento_semanal.map((dia, idx) => (
              <div key={idx} className="bg-zinc-50 p-6 rounded-xl border border-zinc-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">{dia.dia}</h4>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400 bg-white px-3 py-1 rounded-full shadow-sm">{dia.foco}</span>
                </div>
                <div className="space-y-3">
                  {dia.exercicios.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-zinc-100 text-sm">
                      <span className="font-medium">{ex.nome}</span>
                      <div className="flex gap-4 text-zinc-500 font-mono text-xs">
                        <span>{ex.series}x {ex.reps}</span>
                        {ex.carga && <span>{ex.carga}</span>}
                        <span>Rest: {ex.descanso}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" className="h-14 flex-1">
            Rejeitar / Refazer
          </Button>
          <Button onClick={handleApprove} disabled={loading} className="h-14 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black italic uppercase tracking-tighter">
            {loading ? "Aprovando..." : <><CheckCircle2 className="w-5 h-5 mr-2" /> Aprovar Protocolo</>}
          </Button>
        </div>
      </main>
    </div>
  );
}
