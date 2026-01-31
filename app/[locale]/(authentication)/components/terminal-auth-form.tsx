"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useI18n, useCurrentLocale } from "@/locales/client"
import { signInWithDiscord, signInWithEmail, verifyOtp, signInWithGoogle, signInWithPasswordAction } from "@/server/auth"
import { toast } from "sonner"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface TerminalAuthFormProps {
    className?: string
}

export function TerminalAuthForm({ className }: TerminalAuthFormProps) {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [step, setStep] = React.useState<'identify' | 'verify' | 'otp'>('identify')
    const [isLoading, setIsLoading] = React.useState(false)
    const [otp, setOtp] = React.useState("")

    const router = useRouter()
    const t = useI18n()
    const locale = useCurrentLocale()

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        // Check if magic link or password
        // For simplicity and matching aistudio, we'll go to password step by default
        // But we can check if it's a known user or just provide both options
        setStep('verify')
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await signInWithPasswordAction(email, password)
            toast.success(t('success'), { description: t('auth.signIn') })
            router.refresh()
            router.push('/dashboard')
        } catch (error) {
            console.error(error)
            toast.error("Access Denied", {
                description: error instanceof Error ? error.message : "Invalid Credentials"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleMagicLink = async () => {
        setIsLoading(true)
        try {
            await signInWithEmail(email, '/dashboard', locale)
            setStep('otp')
            toast.success("Magic Link Sent", { description: "Check your inbox for the code." })
        } catch (error) {
            console.error(error)
            toast.error("Error", { description: "Failed to send magic link" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await verifyOtp(email, otp)
            toast.success("Identity Verified")
            router.refresh()
            router.push('/dashboard')
        } catch (error) {
            console.error(error)
            toast.error("Verification Failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocial = async (provider: 'discord' | 'google') => {
        setIsLoading(true)
        try {
            if (provider === 'discord') await signInWithDiscord('/dashboard', locale)
            else await signInWithGoogle('/dashboard', locale)
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("w-full", className)}>
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[300px] flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-2 border-zinc-800 rounded-full"></div>
                            <div className="absolute inset-0 border-t-2 border-teal-500 rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-bold text-sm tracking-widest uppercase">Authenticating</h3>
                            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">Establishing secure uplink...</p>
                        </div>
                    </motion.div>
                ) : step === 'identify' ? (
                    <motion.form
                        key="identify"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleIdentify}
                        className="space-y-6"
                    >
                        <div className="space-y-2 group">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 group-focus-within:text-teal-500 transition-colors tracking-widest">Operator Identity</label>
                            <input
                                autoFocus
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950/50 border-b border-zinc-800 text-white py-4 focus:border-teal-500 focus:bg-zinc-900/40 transition-all outline-none text-lg font-mono placeholder:text-zinc-800 rounded-t-md px-1"
                                placeholder="trader@deltalytix.app"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest text-[10px] py-4 hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group rounded-sm shadow-lg shadow-white/5 active:scale-[0.98]">
                                <span>Continue</span>
                                <Icons.chevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900"></div></div>
                                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-bold">
                                    <span className="px-3 bg-[#080808] text-zinc-600">Secure Channels</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSocial('google')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-900 rounded-sm hover:bg-zinc-900 transition-colors group"
                                >
                                    <Icons.google className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">Google</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocial('discord')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-900 rounded-sm hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30 transition-colors group"
                                >
                                    <Icons.discord className="w-3.5 h-3.5 text-[#5865F2]/70 group-hover:text-[#5865F2] transition-colors" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">Discord</span>
                                </button>
                            </div>
                        </div>
                    </motion.form>
                ) : step === 'verify' ? (
                    <motion.form
                        key="verify"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleLogin}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2 group">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 group-focus-within:text-teal-500 transition-colors tracking-widest">Encryption Key</label>
                                    <button type="button" onClick={() => setStep('identify')} className="text-[9px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-tighter decoration-teal-500/50 underline-offset-4 hover:underline">Revise ID</button>
                                </div>
                                <input
                                    autoFocus
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950/50 border-b border-zinc-800 text-white py-4 focus:border-teal-500 focus:bg-zinc-900/40 transition-all outline-none text-lg font-mono placeholder:text-zinc-800 rounded-t-md px-1"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button type="submit" className="w-full bg-teal-500 text-black font-bold uppercase tracking-widest text-[10px] py-4 hover:bg-teal-400 transition-all shadow-[0_0_20px_-5px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_-5px_rgba(45,212,191,0.5)] rounded-sm active:scale-[0.98]">
                                Initiate Session
                            </button>

                            <button
                                type="button"
                                onClick={handleMagicLink}
                                className="w-full text-zinc-600 hover:text-zinc-300 text-[9px] uppercase font-bold tracking-[0.2em] py-2 transition-colors"
                            >
                                Request Magic Link Bypass
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.form
                        key="otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2 group">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 group-focus-within:text-teal-500 transition-colors tracking-widest">Verification Fragment</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-zinc-950/50 border-b border-zinc-800 text-white py-4 focus:border-teal-500 focus:bg-zinc-900/40 transition-all outline-none text-2xl font-mono tracking-[0.5em] text-center placeholder:text-zinc-800 rounded-t-md"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest text-[10px] py-4 hover:bg-zinc-200 transition-all rounded-sm">
                            Validate Fragment
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    )
}
