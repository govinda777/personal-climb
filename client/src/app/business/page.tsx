'use client';

import { Mountain, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <nav className="fixed w-full z-50 flex items-center justify-between p-6 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter italic">
          <div className="bg-white text-black p-1 rounded-sm">
            <Mountain className="w-5 h-5" />
          </div>
          <span>PERSONAL CLIMB PRO</span>
        </div>
        <Button variant="outline" className="border-white/10 text-[10px] font-black tracking-widest px-6 h-10 hover:bg-white hover:text-black">
          LOGIN / SIGNUP
        </Button>
      </nav>

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
            Escale seu <br/><span className="text-zinc-700">Negócio.</span>
          </h1>
          <p className="text-xl text-zinc-400 font-bold italic uppercase">
            A primeira plataforma white-label pensada exclusivamente para treinadores de escalada de alta performance.
          </p>
          <div className="pt-10">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 h-16 px-12 rounded-none font-black italic text-xl uppercase tracking-tighter group">
              Começar Agora <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Sua Marca, Sua URL", desc: "Tenha seu próprio hotsite profissional com seu domínio e cores." },
          { title: "Prescrição com IA", desc: "Gere treinos baseados no seu protocolo e na evolução do aluno." },
          { title: "Gestão Financeira", desc: "Pagamentos recorrentes e cobrança por aluno ativo via Stripe." },
        ].map((item, i) => (
          <div key={i} className="p-8 border border-white/5 bg-zinc-900/30 space-y-4">
            <CheckCircle2 className="text-white w-8 h-8" />
            <h3 className="text-2xl font-black italic uppercase">{item.title}</h3>
            <p className="text-zinc-500 font-bold italic uppercase text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
