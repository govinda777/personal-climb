'use client';

import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Mountain, X } from "lucide-react";
import Link from "next/link";

interface UserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserTypeModal({ isOpen, onClose }: UserTypeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
        >
          {/* Close Button - Optional but good for UX */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full space-y-12 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="bg-white text-black p-2 rounded-sm">
                <Mountain className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
                Quem é você?
              </h2>
              <p className="text-zinc-500 font-bold italic uppercase tracking-widest text-sm">
                Selecione seu perfil para continuar
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Link href="/personal/govinda" onClick={onClose} className="group">
                <div className="bg-white hover:bg-zinc-200 transition-all p-12 h-full flex flex-col items-center justify-center gap-6 group-hover:scale-[1.02] active:scale-[0.98]">
                  <User className="w-16 h-16 text-black" />
                  <span className="text-3xl font-black italic uppercase text-black tracking-tighter">
                    Sou Aluno
                  </span>
                  <p className="text-zinc-600 text-xs font-bold italic uppercase tracking-widest">
                    Acessar treinos e portal
                  </p>
                </div>
              </Link>

              <Link href="/business" onClick={onClose} className="group">
                <div className="border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 transition-all p-12 h-full flex flex-col items-center justify-center gap-6 group-hover:scale-[1.02] active:scale-[0.98]">
                  <Briefcase className="w-16 h-16 text-white" />
                  <span className="text-3xl font-black italic uppercase text-white tracking-tighter">
                    Sou Personal
                  </span>
                  <p className="text-zinc-500 text-xs font-bold italic uppercase tracking-widest">
                    Gerenciar alunos e treinos
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-8"
            >
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">
                PERSONAL CLIMB // HIGH PERFORMANCE SYSTEM
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
