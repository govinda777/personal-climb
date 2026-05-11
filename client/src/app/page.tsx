'use client';

import { personalConfig } from "@/lib/mockConfig";
import { Button } from "@/components/ui/Button";
import { ScheduleModule } from "@/components/ScheduleModule";
import { Mountain, Target, Zap, Shield, CheckCircle2, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Background Decorative Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)] -z-20" />

      {/* Header */}
      <nav className="fixed w-full z-50 flex items-center justify-between p-6 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter italic">
          <div className="bg-white text-black p-1 rounded-sm">
            <Mountain className="w-5 h-5" />
          </div>
          <span>{personalConfig.brandName.toUpperCase()}</span>
        </div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
          <a href="#metodologia" className="hover:text-white transition-colors">Protocolo</a>
          <a href="#agendamento" className="hover:text-white transition-colors">Check-in</a>
          <a href="#planos" className="hover:text-white transition-colors">Planos</a>
        </div>
        <Button variant="outline" className="border-white/10 text-[10px] font-black tracking-widest px-6 h-10 hover:bg-white hover:text-black">
          STUDENT PORTAL
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8 max-w-6xl"
        >
          <div className="flex justify-center">
            <span className="px-4 py-1 border border-white/10 rounded-full text-[10px] font-black tracking-[0.4em] uppercase text-zinc-500 bg-white/5">
              White Label Performance Platform
            </span>
          </div>
          <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter leading-[0.8] italic uppercase">
            {personalConfig.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 2 === 1 ? "text-zinc-800" : ""}>{word} </span>
            ))}
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-bold italic uppercase tracking-tight">
            {personalConfig.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-12">
            <Link href="/personal/govinda">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 h-16 px-12 rounded-none font-black italic text-xl uppercase tracking-tighter group">
                <User className="mr-2 w-5 h-5" /> Sou Aluno
              </Button>
            </Link>
            <Link href="/business">
              <Button size="lg" variant="outline" className="border-white/10 h-16 px-12 rounded-none font-black italic text-xl uppercase tracking-tighter group">
                <Briefcase className="mr-2 w-5 h-5" /> Sou Personal
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Scheduling Section */}
      <section id="agendamento" className="py-32 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Sincronize <br/><span className="text-zinc-700">Seu Treino.</span>
          </h2>
          <p className="text-zinc-500 text-lg font-bold italic uppercase">
            Sistema de check-in em tempo real. Combine seus horários com o personal e garanta sua vaga na sessão.
          </p>
          <ul className="space-y-4 pt-4">
            {["Confirmação Instantânea", "Limite de Alunos por Sessão", "Integração com Agenda Google"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-300 font-bold italic uppercase text-sm">
                <CheckCircle2 className="w-5 h-5 text-zinc-700" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-white/5 blur-3xl -z-10 rounded-full" />
          <ScheduleModule />
        </div>
      </section>

      {/* Methodology Section */}
      <section id="metodologia" className="py-32 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              Nosso <br/><span className="text-zinc-800">Protocolo.</span>
            </h2>
            <p className="text-zinc-500 max-w-md font-bold italic uppercase text-right">
              {personalConfig.philosophy}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/5 border border-white/5">
            {[
              { title: "Anamnese Digital", desc: "Coleta de dados antropométricos e histórico de lesões via interface otimizada.", icon: Shield },
              { title: "Métricas de Carga", desc: "Cálculo automatizado de volume e intensidade baseado no seu RPE.", icon: Zap },
              { title: "Evolução RPG", desc: "Transforme sua força em atributos visuais e acompanhe seu crescimento.", icon: Target },
            ].map((item, i) => (
              <div key={i} className="bg-black p-12 space-y-6 hover:bg-zinc-900 transition-colors group">
                <item.icon className="w-10 h-10 text-zinc-700 group-hover:text-white transition-colors" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{item.title}</h3>
                <p className="text-zinc-500 text-sm font-bold italic uppercase leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center">
            <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-4">Investimento</h2>
            <div className="w-24 h-2 bg-white mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {personalConfig.packages.map((pkg, i) => (
              <div key={i} className="relative group overflow-hidden border border-white/5 bg-zinc-900/30 p-12">
                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 italic select-none group-hover:text-white/10 transition-colors">
                  0{i+1}
                </div>
                <h3 className="text-4xl font-black italic uppercase mb-2">{pkg.name}</h3>
                <div className="text-6xl font-black tracking-tighter mb-12">{pkg.price}</div>
                <div className="space-y-4 mb-12">
                  {pkg.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-zinc-400 font-bold italic uppercase text-[10px] tracking-widest">
                      <div className="w-1 h-1 bg-zinc-700" /> {f}
                    </div>
                  ))}
                </div>
                <Button className="w-full h-16 rounded-none bg-white text-black font-black italic uppercase tracking-tighter text-lg hover:bg-zinc-200">
                  Join Protocol
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-12 md:p-24 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-black text-3xl tracking-tighter italic">
              <Mountain className="w-8 h-8" />
              <span>PERSONAL CLIMB</span>
            </div>
            <p className="text-zinc-600 max-w-xs font-bold italic uppercase text-xs tracking-widest">
              The ultimate high-performance operating system for climbing coaches and athletes.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Social</h4>
              <ul className="space-y-2 text-sm font-black italic uppercase">
                <li><a href="#" className="hover:text-zinc-400 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-zinc-400 transition-colors">YouTube</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Legal</h4>
              <ul className="space-y-2 text-sm font-black italic uppercase">
                <li><a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-zinc-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-12 border-t border-white/5 text-center text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">
          © 2024 {personalConfig.brandName} {"//"} Powered by Personal Climb OS
        </div>
      </footer>
    </div>
  );
}
