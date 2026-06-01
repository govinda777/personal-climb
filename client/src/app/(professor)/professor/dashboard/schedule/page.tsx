'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';
import { API_URL } from '@/lib/api';

const scheduleSchema = z.object({
  date: z.string().min(1, 'A data é obrigatória.'),
  startTime: z.string().min(1, 'Hora de início é obrigatória.'),
  endTime: z.string().min(1, 'Hora de término é obrigatória.'),
  maxCapacity: z.any().transform(Number).refine(val => Number.isInteger(val) && val >= 1, 'A capacidade deve ser pelo menos 1.'),
  location: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function ScheduleManagementPage() {
  const { getAccessToken } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      maxCapacity: 1,
    },
  });

  const fetchSlots = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/professor/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAccessToken]);

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}:00`).toISOString();
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`).toISOString();

      const payload = {
        startTime: startDateTime,
        endTime: endDateTime,
        maxCapacity: data.maxCapacity,
        location: data.location,
      };

      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/professor/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Falha ao criar horário');

      reset();
      fetchSlots(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Erro ao criar horário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Form Section */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <h2 className="text-xl font-bold mb-4">Novo Horário</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input type="date" {...register('date')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input type="time" {...register('startTime')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim</label>
              <input type="time" {...register('endTime')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vagas (Capacidade)</label>
            <input type="number" min="1" {...register('maxCapacity')} className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
            {errors.maxCapacity && <p className="text-red-500 text-xs mt-1">{errors.maxCapacity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Local (Opcional)</label>
            <input type="text" {...register('location')} placeholder="Ex: Muro Principal" className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Criar Horário'}
          </Button>
        </form>
      </div>

      {/* List Section */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <h2 className="text-xl font-bold mb-4">Horários Disponibilizados</h2>
        {loadingSlots ? (
          <p className="text-zinc-500">Carregando horários...</p>
        ) : slots.length === 0 ? (
          <p className="text-zinc-500 text-sm">Você ainda não possui horários cadastrados.</p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              const dateStr = start.toLocaleDateString('pt-BR');
              const timeStr = `${start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;

              return (
                <div key={slot.id} className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg bg-zinc-50">
                  <div>
                    <div className="font-semibold">{dateStr} <span className="text-zinc-500 font-normal ml-2">{timeStr}</span></div>
                    <div className="text-xs text-zinc-500 mt-1">{slot.location || 'Sem local especificado'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {slot.bookedCount} / {slot.maxCapacity} vagas
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold uppercase mt-1">
                      {slot.bookedCount >= slot.maxCapacity ? 'Lotado' : 'Disponível'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  );
}
