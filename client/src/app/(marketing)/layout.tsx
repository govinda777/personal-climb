import Link from "next/link";
import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold tracking-tighter text-white">
            PERSONAL<span className="text-amber-500">CLIMB</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-white/70">
             <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/business" className="hover:text-white transition-colors">For Gyms</Link>
            <Link href="/p/govinda" className="hover:text-white transition-colors">Profiles</Link>
          </nav>
          <div>
            <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-white/10 bg-black py-12 text-white/50">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Personal Climb. High Performance Protocol.</p>
        </div>
      </footer>
    </div>
  );
}
