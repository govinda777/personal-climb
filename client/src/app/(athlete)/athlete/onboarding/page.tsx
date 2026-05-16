'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';

const anamnesisSchema = z.object({
  medicalRestrictions: z.string().optional(),
  goals: z.string().min(10, 'Descreva melhor seus objetivos (mínimo 10 caracteres).'),
  weight: z.any().transform(Number).refine(val => val >= 30, 'Peso inválido.'),
  height: z.any().transform(Number).refine(val => val >= 100, 'Altura inválida (em cm).'),
  sleepHours: z.any().transform(Number).refine(val => val >= 2 && val <= 15, 'Entre 2 e 15 horas.'),
  consentTermsSigned: z.boolean().refine(val => val === true, { message: 'Você precisa aceitar os termos.' }),
});

type AnamnesisFormValues = z.infer<typeof anamnesisSchema>;

export default function AnamnesisPage() {
  const { getAccessToken } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnamnesisFormValues>({
    resolver: zodResolver(anamnesisSchema),
  });

  const onSubmit = async (data: AnamnesisFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        medicalRestrictions: data.medicalRestrictions,
        goals: data.goals,
        anthropometricData: {
          weight: data.weight,
          height: data.height,
        },
        lifestyleInfo: {
          sleepHours: data.sleepHours,
        },
        consentTermsSigned: data.consentTermsSigned,
      };

      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/athlete/anamnesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Falha ao salvar anamnese');

      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar anamnese.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center mt-12 bg-white rounded-xl shadow-sm border border-zinc-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
        <h2 className="text-2xl font-bold mb-2">Anamnese Concluída!</h2>
        <p className="text-zinc-600 mb-6">Seus dados foram enviados para o treinador. Agora você já pode acessar a plataforma completa e marcar seus treinos.</p>
        <Button onClick={() => window.location.href = '/athlete/dashboard'}>Ir para o Painel</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-zinc-200">
      <h1 className="text-2xl font-bold mb-2">Onboarding Clínico</h1>
      <p className="text-zinc-500 mb-6">Para gerar treinos seguros e personalizados, precisamos conhecer um pouco mais sobre você.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="space-y-4 p-4 border border-zinc-100 rounded-lg bg-zinc-50">
          <h3 className="font-semibold text-zinc-900">1. Dados Antropométricos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Peso (kg)</label>
              <input type="number" step="0.1" {...register('weight')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Altura (cm)</label>
              <input type="number" {...register('height')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
              {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 border border-zinc-100 rounded-lg bg-zinc-50">
          <h3 className="font-semibold text-zinc-900">2. Histórico e Objetivos</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Lesões Prévias ou Restrições Médicas</label>
            <textarea {...register('medicalRestrictions')} rows={3} placeholder="Descreva qualquer cirurgia, lesão crônica ou recomendação médica..." className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Objetivos na Escalada</label>
            <textarea {...register('goals')} rows={3} placeholder="Quero mandar meu primeiro V5, melhorar resistência para vias longas, etc..." className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
            {errors.goals && <p className="text-red-500 text-xs mt-1">{errors.goals.message}</p>}
          </div>
        </div>

        <div className="space-y-4 p-4 border border-zinc-100 rounded-lg bg-zinc-50">
          <h3 className="font-semibold text-zinc-900">3. Estilo de Vida</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Média de Sono (horas/noite)</label>
            <input type="number" {...register('sleepHours')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
            {errors.sleepHours && <p className="text-red-500 text-xs mt-1">{errors.sleepHours.message}</p>}
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-4 border-t border-zinc-200">
          <input type="checkbox" id="terms" {...register('consentTermsSigned')} className="mt-1 h-4 w-4 rounded text-black focus:ring-black" />
          <label htmlFor="terms" className="text-sm text-zinc-600">
            Declaro que as informações acima são verdadeiras e estou apto(a) à prática de atividades físicas. Autorizo o uso destes dados pela IA para prescrição de treinos.
          </label>
        </div>
        {errors.consentTermsSigned && <p className="text-red-500 text-sm">{errors.consentTermsSigned.message}</p>}

        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Finalizar Anamnese e Iniciar Treinos'}
        </Button>
      </form>
    </div>
  );
}
