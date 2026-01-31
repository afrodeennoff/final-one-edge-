
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useData } from "@/context/data-provider";
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions";
import { signOut } from "@/server/auth";
import {
    LayoutDashboard,
    TrendingUp,
    Activity,
    BookOpen,
    BarChart3,
    Brain,
    Building2,
    Globe,
    Database,
    Download,
    RefreshCw,
    Settings,
    CreditCard,
    Shield,
    Mail,
    Send,
    Users
} from "lucide-react";
import TradeExportDialog from '@/components/export-button';

interface SidebarItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

interface SidebarGroup {
    title: string;
    items: SidebarItem[];
}

export function AIModelSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const { refreshAllData, formattedTrades } = useData();
    const user = useUserStore(state => state.supabaseUser);
    const resetUser = useUserStore(state => state.resetUser);
    const { open, setOpen, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
    const [activeTab, setActiveTab] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    useEffect(() => {
        async function check() {
            const status = await checkAdminStatus();
            setIsAdmin(status);
        }
        check();
    }, []);

    // Update active tab based on pathname and searchParams
    useEffect(() => {
        const tab = searchParams.get('tab');

        if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
            if (tab === 'table') setActiveTab('Trades');
            else if (tab === 'accounts') setActiveTab('Accounts');
            else if (pathname.includes('strategies')) setActiveTab('Journal');
            else if (pathname.includes('reports')) setActiveTab('Reports');
            else if (pathname.includes('behavior')) setActiveTab('Behavior');
            else if (pathname.includes('data')) setActiveTab('Data');
            else if (pathname.includes('settings')) setActiveTab('Settings');
            else if (pathname.includes('billing')) setActiveTab('Billing');
            else if (tab === 'widgets' || pathname === '/dashboard') setActiveTab('Dashboard');
        }

        if (pathname.includes('/teams')) {
            if (pathname.includes('analytics')) setActiveTab('Team Analytics');
            else if (pathname.includes('traders')) setActiveTab('Team Traders');
            else if (pathname.includes('members')) setActiveTab('Team Members');
            else setActiveTab('Team Overview');
        }

        if (pathname.includes('/admin')) {
            if (pathname.includes('newsletter-builder')) setActiveTab('Mail');
            else if (pathname.includes('weekly-recap')) setActiveTab('Weekly Recap');
            else if (pathname.includes('welcome-email')) setActiveTab('Welcome Email');
            else if (pathname.includes('send-email')) setActiveTab('Send Email');
            else setActiveTab('ID');
        }

        if (pathname.includes('/propfirms')) {
            setActiveTab('Prop Firms');
        }
    }, [pathname, searchParams]);

    const handleLogout = async () => {
        resetUser();
        await signOut();
    };

    const menuGroups = useMemo<SidebarGroup[]>(() => {
        const isTeamPath = pathname.includes('/teams');
        const isAdminPath = pathname.includes('/admin');
        const groups: SidebarGroup[] = [];

        if (isAdminPath) {
            groups.push({
                title: 'Admin Panel',
                items: [
                    { label: 'Mail', href: '/admin/newsletter-builder', icon: <Mail className="w-5 h-5" /> },
                    { label: 'ID', href: '/admin', icon: <Shield className="w-5 h-5" /> },
                ]
            });
        } else if (isTeamPath) {
            groups.push({
                title: 'Team Management',
                items: [
                    { label: 'Team Overview', href: slug ? `/teams/dashboard/${slug}` : "/teams/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
                    { label: 'Team Analytics', href: slug ? `/teams/dashboard/${slug}/analytics` : "/teams/dashboard", icon: <BarChart3 className="w-5 h-5" />, disabled: !slug },
                    { label: 'Team Traders', href: slug ? `/teams/dashboard/${slug}/traders` : "/teams/dashboard", icon: <TrendingUp className="w-5 h-5" />, disabled: !slug },
                    { label: 'Team Members', href: slug ? `/teams/dashboard/${slug}/members` : "/teams/manage", icon: <Users className="w-5 h-5" /> },
                ]
            });
        } else {
            groups.push({
                title: 'Inventory',
                items: [
                    { label: 'Dashboard', href: '/dashboard?tab=widgets', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { label: 'Trades', href: '/dashboard?tab=table', icon: <TrendingUp className="w-5 h-5" /> },
                    { label: 'Accounts', href: '/dashboard?tab=accounts', icon: <Activity className="w-5 h-5" /> },
                    { label: 'Journal', href: '/dashboard/strategies', icon: <BookOpen className="w-5 h-5" /> },
                ]
            });

            groups.push({
                title: 'Insights',
                items: [
                    { label: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="w-5 h-5" /> },
                    { label: 'Behavior', href: '/dashboard/behavior', icon: <Brain className="w-5 h-5" /> },
                ]
            });

            groups.push({
                title: 'Social',
                items: [
                    { label: 'Team', href: '/teams/dashboard', icon: <Building2 className="w-5 h-5" /> },
                    { label: 'Prop Firms', href: '/propfirms', icon: <Globe className="w-5 h-5" /> },
                ]
            });
        }

        if (isAdmin && !isAdminPath) {
            groups.push({
                title: 'Admin',
                items: [
                    { label: 'Mail', href: '/admin/newsletter-builder', icon: <Mail className="w-5 h-5" /> },
                    { label: 'ID', href: '/admin', icon: <Shield className="w-5 h-5" /> },
                ]
            });
        }

        groups.push({
            title: 'System',
            items: [
                { label: 'Data', href: '/dashboard/data', icon: <Database className="w-5 h-5" /> },
                { label: 'Export', href: '#', icon: <Download className="w-5 h-5" />, onClick: () => setIsExportOpen(true) },
                { label: 'Sync', href: '#', icon: <RefreshCw className="w-5 h-5" />, onClick: () => refreshAllData({ force: true }) },
                { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
                { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="w-5 h-5" /> },
            ]
        });

        if (isTeamPath || isAdminPath) {
            groups[groups.length - 1].items.unshift({
                label: 'Main Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />
            });
        }

        return groups;
    }, [pathname, slug, isAdmin, refreshAllData]);

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
                className="bg-[#030303] border-r border-white/5 flex flex-col z-50 flex-shrink-0 shadow-2xl fixed lg:sticky lg:top-0 h-screen overflow-visible group/sidebar"
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

                    <div className="h-16 flex items-center px-6 mb-2 relative flex-shrink-0">
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
                        {menuGroups.map((group: SidebarGroup, groupIdx: number) => {
                            return (
                                <div key={groupIdx}>
                                    <div className="space-y-1">
                                        {group.items.map((item: SidebarItem) => {
                                            const isActive = activeTab === item.label;
                                            const disabled = item.disabled;
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={disabled ? '#' : item.href}
                                                    onClick={(e) => {
                                                        if (disabled) {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        if (item.onClick) {
                                                            e.preventDefault();
                                                            item.onClick();
                                                        } else {
                                                            setActiveTab(item.label);
                                                            if (isMobile) setOpenMobile(false);
                                                        }
                                                    }}
                                                    className={`
                                            w-full flex items-center gap-3 px-3 py-3 rounded-lg flex-shrink-0 transition-all duration-200 relative group/item
                                            ${isActive
                                                            ? 'bg-gradient-to-r from-teal-500/10 to-transparent text-white'
                                                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                                        }
                                            ${!open && !isMobile ? 'justify-center' : ''}
                                            ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                                        `}
                                                >
                                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal-500 rounded-r-full shadow-[0_0_10px_#2dd4bf]"></div>}

                                                    <div className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-500 group-hover/item:text-zinc-300'}`}>
                                                        {item.icon as React.ReactNode}
                                                    </div>

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
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-500 truncate font-mono">
                                            {isAdmin ? 'ADMIN ACCOUNT' : 'PRO ACCOUNT'}
                                        </span>
                                        {isAdmin && (
                                            <div className="flex flex-col gap-0.5 mt-0.5 opacity-50">
                                                <span className="text-[7px] text-zinc-600 truncate uppercase">Mail: {user?.email}</span>
                                                <span className="text-[7px] text-zinc-600 truncate uppercase tracking-tighter">ID: {user?.id}</span>
                                            </div>
                                        )}
                                    </div>
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

            <TradeExportDialog
                trades={formattedTrades}
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
            />
        </>
    );
}
