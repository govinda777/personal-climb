import React from "react";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <div className="text-xl font-bold tracking-tighter">
            PERSONAL<span className="text-amber-600">CLIMB</span>
            <span className="ml-2 text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded">PRO</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/professor/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-zinc-100 rounded-lg text-zinc-900">
            Dashboard
          </a>
          <a href="/professor/students" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">
            Students
          </a>
          <a href="/professor/programs" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">
            Training Programs
          </a>
          <a href="/professor/analytics" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">
            Analytics
          </a>
        </nav>
        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">G</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Govinda</span>
              <span className="text-[10px] text-zinc-400">Head Coach</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-4 w-full max-w-xl">
             <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">🔔</button>
             <button className="hidden sm:block text-sm font-medium bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
               Add Program
             </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
