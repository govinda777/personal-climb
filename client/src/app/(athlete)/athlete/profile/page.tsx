'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/Button";

export default function AthleteProfilePage() {
  const { authenticated, getAccessToken, user } = usePrivy();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!authenticated) return;
      try {
        const token = await getAccessToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/athlete/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [authenticated, getAccessToken]);

  if (loading) return <div className="p-12 text-center">Carregando Perfil RPG...</div>;

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const nextLevelXp = Math.pow(level, 2) * 100; // Baseado na formula GAMIFICATION_CONFIG.LEVEL_FORMULA aproximada
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <div className="bg-zinc-900 text-white rounded-2xl overflow-hidden shadow-xl border border-zinc-800">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-800 opacity-80" />

        <div className="px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-zinc-800 border-4 border-zinc-900 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg">
              🧗
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Status</p>
              <h2 className="text-3xl font-black italic">Level {level}</h2>
            </div>
          </div>

          <div className="mb-2">
            <h1 className="text-xl font-bold">Aventureiro DID</h1>
            <p className="text-zinc-500 text-sm font-mono truncate">{user?.id}</p>
          </div>

          <div className="mt-8 mb-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Experiência (XP)</span>
              <span className="text-sm font-mono">
                <strong className="text-emerald-400">{xp}</strong> / {nextLevelXp}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Skills</h3>
              <p className="text-sm text-zinc-300">Em breve: Distribuição de pontos em Resistência, Força e Técnica.</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Web3</h3>
                <p className="text-sm text-zinc-300 mb-4">Seu XP pode ser atestado na Blockchain.</p>
              </div>
              <Button variant="outline" className="w-full text-xs border-zinc-600 hover:bg-zinc-700 hover:text-white" onClick={async () => {
    try {
      const token = await getAccessToken();
      // Em produção usariamos o endereço real da wallet conectada (farcaster/solana/etc)
      const targetAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/athlete/verify-xp/${targetAddress}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Atestação Gerada! Signature: ${data.signature.substring(0, 15)}...`);
      } else {
        alert("Falha ao gerar atestação.");
      }
    } catch (err) {
      alert("Erro ao conectar com Web3.");
    }
  }}>
                Gerar Atestado (EIP-712)
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
