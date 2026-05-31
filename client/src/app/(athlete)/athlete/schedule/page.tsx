'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';
import { API_URL } from '@/lib/api';

export default function AthleteSchedulePage() {
  const { getAccessToken } = usePrivy();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/athlete/slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAccessToken]);

  const handleCheckin = async (slotId: string) => {
    setCheckingIn(slotId);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/athlete/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(()=>({}));
        throw new Error(err.error || 'Falha ao fazer check-in');
      }

      alert('Check-in realizado com sucesso!');
      fetchSlots(); // refresh state
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6">Agenda de Treinos</h1>

      {loading ? (
        <p>Carregando horários...</p>
      ) : slots.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 text-center">
          <p className="text-zinc-500">Nenhum horário disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);
            const dateStr = start.toLocaleDateString('pt-BR');
            const timeStr = `${start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;

            const isFull = slot.bookedCount >= slot.maxCapacity;

            return (
              <div key={slot.id} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-bold text-lg">{dateStr} <span className="text-zinc-500 font-normal text-base ml-2">{timeStr}</span></h3>
                  <p className="text-sm text-zinc-500 mt-1">{slot.location || 'Sem local especificado'}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                  <div className="text-sm">
                    <span className="font-semibold">{slot.bookedCount}</span> / {slot.maxCapacity} vagas
                  </div>

                  {slot.hasBooked ? (
                    <span className="text-emerald-600 font-bold uppercase text-sm">✅ Confirmado</span>
                  ) : isFull ? (
                    <span className="text-red-500 font-bold uppercase text-sm">Lotado</span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleCheckin(slot.id)}
                      disabled={checkingIn === slot.id}
                    >
                      {checkingIn === slot.id ? 'Marcando...' : 'Fazer Check-in'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
