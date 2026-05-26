import React from "react";

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <main className="flex-1 pb-20 p-4 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-6 py-3 md:hidden">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 opacity-100">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
            </div>
            <span className="text-[10px] font-medium text-amber-500">
              Training
            </span>
          </button>
          <button className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-zinc-400 rounded-sm" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">
              History
            </span>
          </button>
          <button className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-zinc-400 rounded-full" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">
              Profile
            </span>
          </button>
        </div>
      </nav>

      {/* Desktop sidebar placeholder or top bar for athletes */}
      <div className="hidden md:flex border-b border-white/5 bg-zinc-900 p-4 justify-between items-center">
        <div className="font-bold text-amber-500">ATHLETE PORTAL</div>
        <div className="flex gap-4">
          <a href="/athlete/training" className="text-sm">
            Training
          </a>
          <a href="/athlete/history" className="text-sm text-zinc-400">
            History
          </a>
        </div>
      </div>
    </div>
  );
}
