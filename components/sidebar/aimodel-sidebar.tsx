
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions";
import { signOut } from "@/server/auth";

export function AIModelSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const user = useUserStore(state => state.supabaseUser);
    const resetUser = useUserStore(state => state.resetUser);
    const { open, setOpen, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
    const [activeTab, setActiveTab] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function check() {
            const status = await checkAdminStatus();
            setIsAdmin(status);
        }
        check();
    }, []);

    // Update active tab based on pathname
    useEffect(() => {
        // Logic to highlight current tab based on path
        if (pathname === '/dashboard') setActiveTab('Overview');
        else if (pathname.includes('table')) setActiveTab('Trades');
        else if (pathname.includes('strategies')) setActiveTab('Journal');
        else if (pathname.includes('reports') || pathname.includes('behavior')) setActiveTab('Analytics');
        else if (pathname.includes('calendar')) setActiveTab('Calendar');
        else if (pathname.includes('import')) setActiveTab('Import');
        else if (pathname.includes('settings')) setActiveTab('Settings');
        else if (pathname.includes('billing')) setActiveTab('Billing');
        else if (pathname.includes('admin')) setActiveTab('Admin');
    }, [pathname]);

    const handleLogout = async () => {
        resetUser();
        await signOut();
    };

    const menuGroups = [
        {
            title: 'Main',
            items: [
                { label: 'Overview', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                { label: 'Trades', href: '/dashboard?tab=table', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                { label: 'Journal', href: '/dashboard/strategies', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                { label: 'Analytics', href: '/dashboard/reports', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                // Calendar link if you have a calendar page, assuming similar structure
                // { label: 'Calendar', href: '/dashboard/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            ]
        },
        {
            title: 'Operations',
            items: [
                { label: 'Import', href: '/dashboard/data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
                { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                { label: 'Billing', href: '/dashboard/billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }, // Added Billing
            ]
        }
    ];

    if (isAdmin) {
        menuGroups[1].items.push({
            label: 'Admin', href: '/admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        });
    }

    return (
        <>
            <AnimatePresence>
                {isMobile && open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenMobile(false)} // Close mobile
                        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={
                    isMobile
                        ? { x: open ? 0 : '-100%', width: 280 }
                        : { width: open ? 260 : 80, x: 0 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-[#030303] border-r border-white/5 flex flex-col z-50 flex-shrink-0 shadow-2xl fixed lg:relative h-full overflow-visible group/sidebar"
            >
                {!isMobile && (
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-8 w-6 h-6 bg-[#030303] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-teal-400 hover:border-teal-500/50 transition-colors z-50 shadow-lg"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-300 ${!open ? 'rotate-180' : ''}`}>
                            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}

                <div className="flex flex-col h-full overflow-hidden w-full relative">

                    <div className="h-24 flex items-center px-6 mb-2 relative flex-shrink-0">
                        <div className={`flex items-center transition-all duration-300 ${!open && !isMobile ? 'justify-center w-full' : 'gap-4'}`}>
                            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center text-teal-400 bg-teal-500/5 border border-teal-500/10 rounded-xl flex-shrink-0 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative z-10"><path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" strokeLinejoin="round" /></svg>
                            </Link>
                            {(open || isMobile) && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                                    <span className="font-bold text-white tracking-tight whitespace-nowrap leading-none text-lg">Qunt Edge</span>
                                    <span className="text-[9px] text-teal-500 font-mono uppercase tracking-widest mt-1">Terminal v2.4</span>
                                </motion.div>
                            )}
                        </div>

                        {isMobile && (
                            <button
                                onClick={() => setOpenMobile(false)}
                                className="p-2 text-zinc-500 hover:text-white rounded-lg ml-auto"
                            >
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    <nav className="flex-grow px-3 space-y-8 mt-4 overflow-y-auto no-scrollbar">
                        {menuGroups.map((group, groupIdx) => {
                            return (
                                <div key={groupIdx}>
                                    {(open || isMobile) && (
                                        <div className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-600 animate-in fade-in slide-in-from-left-2 duration-300">
                                            {group.title}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const isActive = activeTab === item.label;
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    onClick={() => { setActiveTab(item.label); if (isMobile) setOpenMobile(false); }}
                                                    className={`
                                            w-full flex items-center gap-3 px-3 py-3 rounded-lg flex-shrink-0 transition-all duration-200 relative group/item
                                            ${isActive
                                                            ? 'bg-gradient-to-r from-teal-500/10 to-transparent text-white'
                                                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                                        }
                                            ${!open && !isMobile ? 'justify-center' : ''}
                                        `}
                                                >
                                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal-500 rounded-r-full shadow-[0_0_10px_#2dd4bf]"></div>}

                                                    <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-500 group-hover/item:text-zinc-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>

                                                    {(open || isMobile) && (
                                                        <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                                                    )}

                                                    {!open && !isMobile && (
                                                        <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover/item:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 transition-opacity">
                                                            {item.label}
                                                        </div>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="mt-auto p-4 border-t border-white/5 flex-shrink-0 bg-[#020202]">
                        <div className={`flex items-center gap-3 ${!open && !isMobile ? 'justify-center' : ''}`}>
                            <div className="relative">
                                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 ring-1 ring-white/10 group-hover:ring-teal-500/30 transition-all flex-shrink-0">
                                    {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#020202] rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            {(open || isMobile) && (
                                <div className="flex flex-col overflow-hidden min-w-0">
                                    <span className="text-xs font-bold text-white truncate">{user?.user_metadata?.name || user?.email || 'Trader'}</span>
                                    <span className="text-[10px] text-zinc-500 truncate font-mono">PRO ACCOUNT</span>
                                </div>
                            )}

                            {(open || isMobile) && (
                                <button onClick={handleLogout} className="ml-auto p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
