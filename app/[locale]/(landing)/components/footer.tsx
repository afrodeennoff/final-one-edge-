'use client'
import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm flex items-center justify-center font-bold text-black text-[10px] sm:text-xs">D</div>
          <span className="text-xs sm:text-sm font-bold tracking-tighter uppercase mono">Deltalytix</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <a href="#" className="hover:text-white transition-colors touch-target px-2 py-1">Privacy</a>
          <a href="#" className="hover:text-white transition-colors touch-target px-2 py-1">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors touch-target px-2 py-1">Security</a>
          <a href="#" className="hover:text-white transition-colors touch-target px-2 py-1">API Docs</a>
        </div>

        <div className="text-[9px] sm:text-[10px] mono text-zinc-600 text-center md:text-right">
          © {new Date().getFullYear()} Deltalytix. All rights reserved. Professional trading analytics.
        </div>
      </div>
    </footer>
  );
}
