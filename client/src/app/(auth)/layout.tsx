import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl font-black italic tracking-tighter">
            PERSONAL<span className="text-amber-500">CLIMB</span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
            Authentication Gateway
          </p>
        </div>
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
          {children}
        </div>
        <div className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Personal Climb // High Performance
          Protocol
        </div>
      </div>
    </div>
  );
}
