'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';

const rpeSchema = z.object({
  sessionId: z.string().uuid('Sessão inválida.'), // Na prática isso viria da rota/contexto
  rpe: z.coerce.number().int().min(1).max(10, 'RPE deve ser entre 1 e 10'),
  feeling: z.string().optional(),
});

type RpeFormValues = z.infer<typeof rpeSchema>;

export default function WorkoutExecutionPage() {
  const { getAccessToken } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Exemplo estático: normalmente a sessionId viria de um fetch da sessão atual.
  const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RpeFormValues>({
    resolver: zodResolver(rpeSchema),
    defaultValues: {
      sessionId: mockSessionId,
      rpe: 5
    }
  });

  const onSubmit = async (data: RpeFormValues) => {
    setIsSubmitting(true);
    try {
      const token = await getAccessToken();

      // 1. Enviar o Log do Treino
      const logResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/athlete/workout-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!logResponse.ok) throw new Error('Falha ao registrar treino');

      // 2. Acionar Gamificação
      const gamificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/actions/workout-complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!gamificationResponse.ok) {
         // Ignora erro de gamificação por enquanto ou loga
      }
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar finalização do treino.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center mt-12 bg-white rounded-xl shadow-sm border border-zinc-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💪</div>
        <h2 className="text-2xl font-bold mb-2">Treino Concluído!</h2>
        <p className="text-zinc-600 mb-6">Seu RPE foi registrado e a IA já está analisando para o próximo ciclo. Você ganhou XP!</p>
        <Button onClick={() => window.location.href = '/athlete/profile'}>Ver meu Perfil de XP</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold mb-2">Treino do Dia</h1>

      {/* Resumo Fake do Treino para contexto visual */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mb-8">
        <h3 className="font-bold text-lg border-b pb-2 mb-4">Sessão: Resistência (Mock)</h3>
        <ul className="space-y-3 text-sm text-zinc-700">
          <li className="flex justify-between items-center bg-zinc-50 p-2 rounded">
            <span>Aquecimento Específico</span> <span className="font-mono text-xs">15 min</span>
          </li>
          <li className="flex justify-between items-center bg-zinc-50 p-2 rounded">
            <span>Blocos (Volume)</span> <span className="font-mono text-xs">4x 4 boulders V3</span>
          </li>
          <li className="flex justify-between items-center bg-zinc-50 p-2 rounded">
            <span>Trabalho Core</span> <span className="font-mono text-xs">3x 1min Prancha</span>
          </li>
        </ul>
      </div>

      <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-2">Finalizar Sessão</h2>
        <p className="text-zinc-400 text-sm mb-6">Informe como foi o treino de hoje para que a IA possa ajustar a intensidade da sua próxima semana.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register('sessionId')} />

          <div>
            <label className="block text-sm font-medium mb-3">
              Percepção Subjetiva de Esforço (RPE)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-xs">Fácil (1)</span>
              <input
                type="range"
                min="1"
                max="10"
                {...register('rpe')}
                className="w-full accent-white"
              />
              <span className="text-zinc-400 text-xs">Máximo (10)</span>
            </div>
            {errors.rpe && <p className="text-red-400 text-xs mt-1">{errors.rpe.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comentários / Sensações</label>
            <textarea
              {...register('feeling')}
              rows={3}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:ring-2 focus:ring-zinc-500 outline-none placeholder:text-zinc-500"
              placeholder="Senti o ombro esquerdo um pouco fadigado no último boulder..."
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 text-lg font-bold" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Concluir Treino e Ganhar XP'}
          </Button>
        </form>
      </div>
    </div>
  );
}
