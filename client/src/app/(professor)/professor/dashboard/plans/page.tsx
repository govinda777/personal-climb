'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';

export default function PlansApprovalPage() {
  const { getAccessToken } = usePrivy();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { register, handleSubmit, setValue, reset } = useForm<{ rationale: string }>({
    defaultValues: {
      rationale: ''
    }
  });

  const fetchPlans = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/professor/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAccessToken]);

  const handleApproval = async (planId: string, status: 'approved' | 'rejected', customRationale?: string) => {
    setActioning(planId);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/professor/plans/${planId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ...(customRationale && { aiRationale: customRationale }) }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar plano');

      if (status === 'approved') {
        setEditingPlan(null);
      }
      fetchPlans();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setActioning(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditClick = (plan: any) => {
    setEditingPlan(plan.id);
    setValue('rationale', plan.aiRationale || '');
  };

  const pendingPlans = plans.filter(p => p.status === 'draft');
  const otherPlans = plans.filter(p => p.status !== 'draft');

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold mb-2">Revisão de Treinos (IA)</h1>
      <p className="text-zinc-500 mb-8">Aprove, edite ou rejeite os treinos gerados pelo motor de Inteligência Artificial para seus alunos.</p>

      {loading ? (
        <p>Carregando planos...</p>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              Aguardando Aprovação
              <span className="bg-amber-100 text-amber-800 text-xs py-1 px-2 rounded-full font-bold">{pendingPlans.length}</span>
            </h2>

            {pendingPlans.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-zinc-200 text-center">
                <p className="text-zinc-500">Nenhum treino aguardando aprovação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPlans.map(plan => (
                  <div key={plan.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">Aluno(a): {plan.athleteName}</h3>
                        <p className="text-sm text-zinc-500">Criado em: {new Date(plan.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                      <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Racional da IA</h4>
                      {editingPlan === plan.id ? (
                        <textarea
                           {...register('rationale')}
                           className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none text-sm"
                           rows={4}
                        />
                      ) : (
                        <p className="text-sm font-medium">{plan.aiRationale || 'Sem racional especificado pela IA.'}</p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                      {editingPlan === plan.id ? (
                         <Button onClick={handleSubmit((data) => handleApproval(plan.id, 'approved', data.rationale))} disabled={actioning === plan.id}>Aprovar com Edição</Button>
                      ) : (
                         <Button variant="outline" onClick={() => handleEditClick(plan)}>Editar Racional</Button>
                      )}
                      <Button variant="outline" onClick={() => handleApproval(plan.id, 'rejected')} disabled={actioning === plan.id}>Rejeitar</Button>
                      <Button onClick={() => handleApproval(plan.id, 'approved')} disabled={actioning === plan.id}>Aprovar Treino</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Histórico Recente</h2>
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Aluno</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {otherPlans.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-zinc-500">Nenhum histórico disponível.</td>
                    </tr>
                  ) : (
                    otherPlans.map(plan => (
                      <tr key={plan.id}>
                        <td className="px-6 py-4 font-medium">{plan.athleteName}</td>
                        <td className="px-6 py-4">
                          {plan.status === 'approved' ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">APROVADO</span>
                          ) : (
                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">REJEITADO</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(plan.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
