'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';
import { Mountain, ChevronRight, Activity, Target, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function OnboardingPage() {
  const { getAccessToken, authenticated } = usePrivy();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vGradeLevel: 'V0',
    weight: '',
    height: '',
    goals: '',
    medicalRestrictions: '',
    equipmentAccess: [] as string[],
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const toggleEquipment = (eq: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.includes(eq) 
        ? prev.equipmentAccess.filter(e => e !== eq)
        : [...prev.equipmentAccess, eq]
    }));
  };

  const handleSubmit = async () => {
    if (!authenticated) return;
    setLoading(true);
    
    try {
      const token = await getAccessToken();
      const payload = {
        vGradeLevel: formData.vGradeLevel,
        physicalStats: { weight: formData.weight, height: formData.height },
        anthropometricData: { weight: formData.weight, height: formData.height },
        equipmentAccess: formData.equipmentAccess,
        goals: formData.goals,
        medicalRestrictions: formData.medicalRestrictions
      };

      const res = await fetch(`${API_URL}/athletes/me/anamnesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save anamnesis');
      
      // Award XP for onboarding via gamification endpoint
      await fetch(`${API_URL}/actions/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push('/athlete/training');
    } catch (err) {
      console.error(err);
      alert('Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-white selection:text-black">
      <nav className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">
          <div className="bg-white text-black p-1 rounded-sm"><Mountain className="w-4 h-4" /></div>
          <span>ATHLETE PROTOCOL</span>
        </div>
        <div className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
          Step {step} of 3
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-zinc-900/50 border border-white/5 p-8 md:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-white transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Activity className="w-8 h-8 text-zinc-400 mb-4" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Physical Stats</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Help the AI understand your current state.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weight (kg)</label>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-zinc-950 border border-white/10 p-4 font-bold text-xl focus:border-white focus:outline-none transition-colors" placeholder="70" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Height (cm)</label>
                  <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-zinc-950 border border-white/10 p-4 font-bold text-xl focus:border-white focus:outline-none transition-colors" placeholder="175" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Max V-Grade</label>
                  <select value={formData.vGradeLevel} onChange={e => setFormData({...formData, vGradeLevel: e.target.value})} className="w-full bg-zinc-950 border border-white/10 p-4 font-bold text-xl focus:border-white focus:outline-none transition-colors appearance-none">
                    {Array.from({length: 18}, (_, i) => <option key={i} value={`V${i}`}>V{i}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Target className="w-8 h-8 text-zinc-400 mb-4" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Goals & Gear</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">What do you want to achieve and what can you use?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Primary Goal</label>
                  <textarea value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} className="w-full bg-zinc-950 border border-white/10 p-4 font-bold focus:border-white focus:outline-none transition-colors min-h-32" placeholder="Ex: Crush V7 outdoors this season, improve finger strength..." />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Available Equipment</label>
                  <div className="flex flex-wrap gap-3">
                    {['Moonboard', 'Kilterboard', 'Hangboard', 'Campus Board', 'Weights', 'TRX'].map(eq => (
                      <button 
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-4 py-2 border font-bold text-sm transition-colors ${formData.equipmentAccess.includes(eq) ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30'}`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <ShieldAlert className="w-8 h-8 text-zinc-400 mb-4" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Medical & Safety</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Protect your progress. Be honest.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Injuries or Restrictions</label>
                <textarea value={formData.medicalRestrictions} onChange={e => setFormData({...formData, medicalRestrictions: e.target.value})} className="w-full bg-zinc-950 border border-white/10 p-4 font-bold focus:border-white focus:outline-none transition-colors min-h-32" placeholder="Ex: Tweaked A2 pulley on right ring finger 2 months ago, avoiding full crimps." />
              </div>
              
              <div className="p-4 bg-zinc-950 border border-white/5 text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
                By submitting this protocol, you agree to follow the AI-generated training plan at your own risk. Always prioritize safety and listen to your body.
              </div>
            </div>
          )}

          <div className="pt-8 flex justify-between border-t border-white/5 mt-8">
            <Button variant="outline" onClick={handlePrev} disabled={step === 1 || loading} className="border-white/10 text-zinc-400 hover:text-white">
              Back
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-white text-black font-black italic uppercase tracking-tighter hover:bg-zinc-200 px-8">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-white text-black font-black italic uppercase tracking-tighter hover:bg-zinc-200 px-8">
                {loading ? 'Processing...' : 'Complete Protocol'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
