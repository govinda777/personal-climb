'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';

const protocolSchema = z.object({
  trainingPhilosophy: z.string().min(10, 'A metodologia deve ter pelo menos 10 caracteres.'),
  evaluationMetrics: z.object({
    focusOnEndurance: z.boolean().default(false),
    focusOnPower: z.boolean().default(false),
    focusOnMobility: z.boolean().default(false),
    allowedEquipment: z.array(z.string()).default([]),
  }),
});

type ProtocolFormValues = z.infer<typeof protocolSchema>;

const EQUIPMENT_OPTIONS = ['MoonBoard', 'Hangboard', 'Muro Comercial', 'Campus Board', 'Spray Wall'];

export default function ProtocolConfigPage() {
  const { getAccessToken } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      trainingPhilosophy: '',
      evaluationMetrics: {
        focusOnEndurance: false,
        focusOnPower: false,
        focusOnMobility: false,
        allowedEquipment: [],
      },
    },
  });

  const onSubmit = async (data: ProtocolFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/professor/protocol`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao atualizar protocolo');
      }

      setSuccessMessage('Protocolo de IA atualizado com sucesso!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-zinc-200 mt-8">
      <h1 className="text-2xl font-bold mb-2">Setup da IA (Protocolo de Treino)</h1>
      <p className="text-zinc-500 mb-6">Defina as regras de ouro e limitações que a IA usará para gerar os treinos dos seus atletas.</p>

      {successMessage && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">{successMessage}</div>}
      {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{errorMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">Filosofia de Treino (Prompt Customizado)</label>
          <p className="text-xs text-zinc-500 mb-2">Instruções explícitas de como a IA deve montar os treinos. Ex: "Priorizar sempre mobilidade no aquecimento. Não receitar exercícios de força máxima se o aluno relatar dor articular."</p>
          <textarea
            {...register('trainingPhilosophy')}
            rows={6}
            className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-black outline-none"
            placeholder="Minhas regras de ouro são..."
          />
          {errors.trainingPhilosophy && <p className="text-red-500 text-sm mt-1">{errors.trainingPhilosophy.message}</p>}
        </div>

        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <h3 className="font-semibold mb-4">Métricas de Avaliação Padrão</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-zinc-200 cursor-pointer hover:bg-zinc-50">
              <input type="checkbox" {...register('evaluationMetrics.focusOnEndurance')} className="rounded text-black focus:ring-black h-4 w-4" />
              <span className="text-sm font-medium">Foco em Resistência</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-zinc-200 cursor-pointer hover:bg-zinc-50">
              <input type="checkbox" {...register('evaluationMetrics.focusOnPower')} className="rounded text-black focus:ring-black h-4 w-4" />
              <span className="text-sm font-medium">Foco em Potência</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-zinc-200 cursor-pointer hover:bg-zinc-50">
              <input type="checkbox" {...register('evaluationMetrics.focusOnMobility')} className="rounded text-black focus:ring-black h-4 w-4" />
              <span className="text-sm font-medium">Foco em Mobilidade</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">Equipamentos Permitidos</label>
            <div className="flex flex-wrap gap-3">
              <Controller
                name="evaluationMetrics.allowedEquipment"
                control={control}
                render={({ field }) => (
                  <>
                    {EQUIPMENT_OPTIONS.map((equip) => {
                      const isChecked = field.value.includes(equip);
                      return (
                        <label key={equip} className={`flex items-center space-x-2 p-2 px-3 rounded-full border cursor-pointer text-sm transition-colors ${isChecked ? 'bg-black text-white border-black' : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-500'}`}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, equip]);
                              } else {
                                field.onChange(field.value.filter((v: string) => v !== equip));
                              }
                            }}
                          />
                          <span>{equip}</span>
                        </label>
                      );
                    })}
                  </>
                )}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando Protocolo...' : 'Salvar Protocolo da IA'}
        </Button>
      </form>
    </div>
  );
}
