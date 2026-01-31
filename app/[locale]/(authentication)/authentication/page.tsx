'use client'

import Link from "next/link"
import { UserAuthForm } from "../components/user-auth-form"
import { Logo } from "@/components/logo"
import { useI18n } from '@/locales/client'
import { cn } from "@/lib/utils"

export default function AuthenticationPage() {
  const t = useI18n()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020617] selection:bg-primary/30 selection:text-primary">
      {/* Cinematic Background Layering */}
      <div className="absolute inset-0 z-0">
        {/* Deep mesh gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(45,212,191,0.08)_0%,_transparent_50%),_radial-gradient(circle_at_100%_100%,_rgba(99,102,241,0.05)_0%,_transparent_50%)]" />

        {/* Animated Aurora Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] animate-float mix-blend-screen" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-500/5 blur-[80px] animate-pulse-slow" style={{ animationDuration: '6s' }} />

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <div className="flex flex-col items-center">

          {/* Brand Identity - Staggered Appearance */}
          <Link href="/" className="mb-10 group flex flex-col items-center animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="relative mb-6">
              {/* Spinning aura behind logo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 to-indigo-500/40 blur-xl opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 animate-spin-slow" />

              <div className="relative bg-[#0a0f1e]/80 backdrop-blur-md rounded-2xl p-4 ring-1 ring-white/10 shadow-[0_0_30px_rgba(45,212,191,0.15)] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
                <Logo className="w-12 h-12 text-primary fill-current drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-sm">
                Qunt <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-200">Edge</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
                {t('authentication.description')}
              </p>
            </div>
          </Link>

          {/* Premium Auth Container */}
          <div className="w-full relative animate-slide-up" style={{ animationDelay: '150ms' }}>
            {/* Outer Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[2rem] blur opacity-50" />

            <div className="relative backdrop-blur-2xl bg-slate-950/40 border border-white/10 shadow-[24px_24px_48px_rgba(0,0,0,0.4)] rounded-[1.75rem] p-8 sm:p-10 overflow-hidden group">
              {/* Dynamic light sweep animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              {/* Content Header (Optional, if needed for extra flair) */}
              <div className="mb-8 text-center sm:text-left border-b border-white/5 pb-6">
                <h2 className="text-xl font-semibold text-white mb-1">{t('authentication.title')}</h2>
                <p className="text-xs text-slate-500">{t('authentication.testimonialAuthor')}</p>
              </div>

              <UserAuthForm />

              <div className="relative mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  {t('authentication.termsAndPrivacy.prefix')}{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
                  >
                    {t('authentication.termsAndPrivacy.terms')}
                  </Link>{" "}
                  {t('authentication.termsAndPrivacy.and')}{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
                  >
                    {t('authentication.termsAndPrivacy.privacy')}
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              <div className="w-8 h-[1px] bg-slate-800" />
              <span>&copy; {new Date().getFullYear()} DeltaLytix Technologies</span>
              <div className="w-8 h-[1px] bg-slate-800" />
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  )
}