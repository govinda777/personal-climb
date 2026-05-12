import React from "react";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-black italic uppercase tracking-tight">Welcome Back</h1>
        <p className="text-zinc-400 text-sm">Please sign in to access your performance portal.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com"
            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <button className="w-full bg-white text-black h-12 rounded-xl font-black italic uppercase tracking-tighter hover:bg-zinc-200 transition-colors">
          Sign In
        </button>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-zinc-900 px-2 text-zinc-600">Or continue with</span></div>
        </div>
        <button className="w-full bg-zinc-800 text-white h-12 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
          <span>Privy Authentication</span>
        </button>
      </div>
    </div>
  );
}
