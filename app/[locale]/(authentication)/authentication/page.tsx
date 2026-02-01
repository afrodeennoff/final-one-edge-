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

      {/* Animated Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
      </div>

      {/* Left Panel - Visual Branding */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-20 relative z-10 border-r border-white/[0.02]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-transparent pointer-events-none"></div>

        <Link href="/" className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all w-fit relative z-20">
          <div className="relative p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 transition-colors group-hover:border-zinc-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-1">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Return to Base</span>
        </Link>

        <div className="relative z-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Node Alpha Live</span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-7xl font-bold tracking-tighter text-white mb-8 leading-[0.9] flex flex-col"
          >
            <span>Welcome to</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-[length:200%_auto] animate-gradient">Quntedge.</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-zinc-500 max-w-sm text-lg font-medium leading-relaxed"
          >
            Professional trading analytics for the modern edge.
            All protocols are encrypted. Terminal session monitored.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="space-y-6 relative z-20"
        >
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
          <div className="h-[1px] w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-transparent"></div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Terminal Interaction */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-[#080808]/80 backdrop-blur-xl border border-white/[0.05] p-10 sm:p-14 rounded-[2.5rem] relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Internal Glow */}
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Top scanning line decoration */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent animate-[scan_4s_linear_infinite]"></div>

          <div className="mb-12 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 shadow-[0_0_15px_-5px_rgba(45,212,191,0.5)]">
                <Logo className="w-5 h-5 text-teal-500 fill-current" />
              </div>
              <div className="h-px flex-1 bg-zinc-900/50"></div>
              <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-[0.2em] whitespace-nowrap">Secure Uplink</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight tracking-[-0.03em]">Identify Yourself</h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Verification required for terminal access.</p>
          </div>

          <div className="relative z-10">
            <TerminalAuthForm />
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-900 text-center relative z-10">
            <p className="text-[10px] leading-relaxed text-zinc-600 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Quntedge Technologies
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
      `}</style>
    </div>
  );
}