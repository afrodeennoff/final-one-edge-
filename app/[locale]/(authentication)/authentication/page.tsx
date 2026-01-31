'use client'

import React from 'react';
import Link from "next/link"
import { motion } from 'framer-motion';
import { TerminalAuthForm } from "../components/terminal-auth-form"
import { Logo } from "@/components/logo"
import { useI18n } from '@/locales/client'

export default function AuthenticationPage() {
  const t = useI18n()

  return (
    <div className="min-h-screen bg-[#030303] flex font-sans overflow-hidden relative selection:bg-teal-500/30">
      {/* Background Architectural Layer */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.05)_0%,transparent_50%)] pointer-events-none"></div>

      {/* Left Panel - Visual Branding */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-20 relative z-10 border-r border-white/[0.02]"
      >
        <Link href="/" className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all w-fit">
          <div className="relative p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 transition-colors group-hover:border-zinc-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-1">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Return to Base</span>
        </Link>

        <div>
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Node Alpha Live</span>
          </div>
          <h1 className="text-7xl font-bold tracking-tighter text-white mb-8 leading-[0.9] flex flex-col">
            <span>Welcome to</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-600">Deltalytix.</span>
          </h1>
          <p className="text-zinc-500 max-w-sm text-lg font-medium leading-relaxed">
            Professional trading analytics for the modern edge.
            All protocols are encrypted. Terminal session monitored.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-10 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-bold">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-800">Latency</span>
              <span className="text-teal-500/60 font-mono italic">0.012 MS</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-800">Security</span>
              <span className="text-teal-500/60 font-mono italic">TLS 1.3</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-800">Identity</span>
              <span className="text-teal-500/60 font-mono italic">Zero Trust</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-zinc-900 to-transparent"></div>
        </div>
      </motion.div>

      {/* Right Panel - Terminal Interaction */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-[#080808] border border-white/[0.03] p-10 sm:p-14 rounded-[2.5rem] relative shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Top scanning line decoration */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent animate-[scan_4s_linear_infinite]"></div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <Logo className="w-5 h-5 text-teal-500 fill-current" />
              </div>
              <div className="h-px flex-1 bg-zinc-900/50"></div>
              <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-[0.2em] whitespace-nowrap">Secure Uplink</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight tracking-[-0.03em]">Identify Yourself</h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Verification required for terminal access.</p>
          </div>

          <TerminalAuthForm />

          <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
            <p className="text-[10px] leading-relaxed text-zinc-600 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} DeltaLytix Technologies
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}