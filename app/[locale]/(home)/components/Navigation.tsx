
"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/user-store';
import { useI18n } from "@/locales/client";
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavigationProps {
    onAccessPortal: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onAccessPortal }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = useUserStore(state => state.supabaseUser);
    const t = useI18n();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Toggle body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const links = [
        { name: 'Philosophy', href: '#problem' },
        { name: 'Methodology', href: '#how-it-works' },
        { name: 'Infrastructure', href: '#features' },
        { name: t('landing.navbar.pricing'), href: '/pricing' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container-fluid flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white relative z-10 transition-transform duration-500 group-hover:rotate-180">
                                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                                <circle cx="16" cy="16" r="4" fill="#2dd4bf" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tighter text-white group-hover:text-teal-400 transition-colors uppercase">Qunt Edge</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="hover:text-white transition-colors relative group py-2"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden md:flex items-center gap-6">
                            {!user ? (
                                <>
                                    <button
                                        onClick={onAccessPortal}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {t('landing.navbar.signIn')}
                                    </button>
                                    <button
                                        onClick={onAccessPortal}
                                        className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-teal-400 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)] touch-optimized"
                                    >
                                        {t('landing.cta')}
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-teal-400 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)] touch-optimized"
                                >
                                    {t('landing.navbar.dashboard')}
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none z-100"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            <span className={cn("w-6 h-0.5 bg-white transition-all duration-300", mobileMenuOpen && "rotate-45 translate-y-2")} />
                            <span className={cn("w-6 h-0.5 bg-white transition-all duration-300", mobileMenuOpen && "opacity-0")} />
                            <span className={cn("w-6 h-0.5 bg-white transition-all duration-300", mobileMenuOpen && "-rotate-45 -translate-y-2")} />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <motion.div
                initial={false}
                animate={mobileMenuOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, x: 0, visibility: "visible" },
                    closed: { opacity: 0, x: "100%", visibility: "hidden" }
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-90 bg-[#050505] flex flex-col pt-32 px-10 lg:hidden"
            >
                <div className="flex flex-col gap-8">
                    {links.map((link, i) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            initial={{ opacity: 0, x: 20 }}
                            animate={mobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-3xl font-bold tracking-tighter text-zinc-400 hover:text-white transition-colors"
                        >
                            {link.name}
                        </motion.a>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.4 }}
                        className="pt-10 border-t border-white/5 flex flex-col gap-6"
                    >
                        {!user ? (
                            <>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        onAccessPortal();
                                    }}
                                    className="text-xl font-bold text-zinc-400 hover:text-white transition-colors text-left"
                                >
                                    {t('landing.navbar.signIn')}
                                </button>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        onAccessPortal();
                                    }}
                                    className="w-full bg-teal-500 text-black py-4 rounded-xl text-lg font-bold uppercase tracking-widest"
                                >
                                    {t('landing.cta')}
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full bg-teal-500 text-black py-4 rounded-xl text-lg font-bold uppercase tracking-widest text-center"
                            >
                                {t('landing.navbar.dashboard')}
                            </Link>
                        )}
                    </motion.div>
                </div>

                <div className="mt-auto pb-10">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        Qunt Edge / Industrial Grade Analysis
                    </p>
                </div>
            </motion.div>
        </>
    );
};

export default Navigation;
