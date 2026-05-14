'use client';

import { Button } from "@/components/ui/Button";
import { Users, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Plan {
  id: string;
  athleteId: string;
  createdAt: string;
}

export default function ProfessorDashboard() {
  const { getAccessToken, authenticated } = usePrivy();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      if (!authenticated) return;
      try {
        const token = await getAccessToken();
        const res = await fetch(`${API_URL}/personals/me/pending-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (err) {
        console.error("Failed to fetch pending plans", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, [authenticated, getAccessToken]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <nav className="p-6 bg-white border-b border-zinc-200 flex justify-between items-center">
        <h1 className="font-bold text-xl tracking-tighter uppercase">Painel do Treinador</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-500">Área Restrita</span>
          <div className="w-10 h-10 bg-zinc-200 rounded-full" />
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Alunos", value: "42", icon: Users },
            { label: "Aguardando Aprovação", value: plans.length.toString(), icon: Clock, color: "text-amber-500" },
            { label: "Inativos (>3 dias)", value: "12", icon: AlertTriangle, color: "text-red-500" },
            { label: "Taxa de Evolução", value: "+12%", icon: TrendingUp, color: "text-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color || "text-zinc-400"}`} />
              </div>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Table */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="font-bold">Planos Pendentes de Aprovação</h2>
            <Button variant="outline" size="sm">Ver todos</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">ID do Plano</th>
                  <th className="px-6 py-4">Atleta ID</th>
                  <th className="px-6 py-4">Data de Criação</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-zinc-500">Carregando...</td></tr>
                ) : plans.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-zinc-500">Nenhum plano pendente.</td></tr>
                ) : plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{plan.id.slice(0,8)}...</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-sm">{plan.athleteId.slice(0,8)}...</td>
                    <td className="px-6 py-4 text-sm">{new Date(plan.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/professor/approval/${plan.id}`}>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600">Revisar & Aprovar</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
