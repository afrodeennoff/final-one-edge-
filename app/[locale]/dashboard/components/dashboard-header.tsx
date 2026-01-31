
"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { useDashboard } from '@/app/[locale]/dashboard/dashboard-context';
import { AddWidgetSheet } from '@/app/[locale]/dashboard/components/add-widget-sheet';
import { cn } from '@/lib/utils';
import { useI18n } from '@/locales/client';
import { FilterCommandMenu } from './filters/filter-command-menu';
import ImportButton from './import/import-button';
import { DailySummaryModal } from './daily-summary-modal';
import { ShareButton } from './share-button';
import { useData } from '@/context/data-provider';
import { ActiveFilterTags } from './filters/active-filter-tags';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CloudUpload,
    CheckCircle2,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

export function DashboardHeader() {
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();
    const {
        isCustomizing,
        toggleCustomizing,
        addWidget,
        layouts,
        autoSaveStatus,
        flushPendingSaves
    } = useDashboard();
    const { refreshAllData, isPlusUser, isLoading } = useData();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const t = useI18n();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshAllData({ force: true });
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const getTitle = () => {
        if (pathname === '/dashboard') return 'Overview';
        if (pathname.includes('table')) return 'Journal';
        if (pathname.includes('strategies')) return 'Strategies';
        if (pathname.includes('reports')) return 'Analytics';
        if (pathname.includes('behavior')) return 'Behavior';
        if (pathname.includes('calendar')) return 'Calendar';
        if (pathname.includes('data')) return 'Data';
        if (pathname.includes('settings')) return 'Settings';
        if (pathname.includes('billing')) return 'Billing';
        return 'Dashboard';
    };

    const title = getTitle();
    const currentLayout = layouts || { desktop: [], mobile: [] };

    return (
        <header className="border-b border-white/5 bg-[#020202]/95 backdrop-blur-md sticky top-0 z-50 overflow-hidden">
            <div className="h-16 flex items-center justify-between px-4 md:px-8">
                {/* Left Side: Sidebar Toggle & Title */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={toggleSidebar} className="p-2 text-zinc-500 hover:text-white lg:hidden">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </button>
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-sm font-bold text-white tracking-wide uppercase whitespace-nowrap">{title}</h1>
                    </div>
                </div>

                {/* Right Side: Actions & Configuration */}
                <div className="flex items-center gap-3">

                    {/* Global Utilities Group */}
                    <div className="flex items-center gap-1">
                        <FilterCommandMenu variant="navbar" />

                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Manual Sync"
                        >
                            <RefreshCw className={cn("w-4 h-4", (isRefreshing || isLoading) && "animate-spin")} />
                        </button>

                        <DailySummaryModal />
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                    {/* Operations & Status Group */}
                    <div className="hidden sm:flex items-center gap-2">
                        <ImportButton />

                        {!isPlusUser() && (
                            <Link href="/dashboard/billing">
                                <button className="h-8 px-4 gap-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[9px] font-black uppercase tracking-widest hover:border-teal-500/50 hover:bg-teal-500/20 transition-all flex items-center group">
                                    <Sparkles className="w-3 h-3 animate-pulse group-hover:scale-110 transition-transform" />
                                    <span>UPGRADE</span>
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Customization Group (Conditional) */}
                    {title === 'Overview' && (
                        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/5 ml-1">
                            <AddWidgetSheet
                                onAddWidget={addWidget}
                                isCustomizing={isCustomizing}
                                trigger={
                                    <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                        <span>+ ADD</span>
                                    </button>
                                }
                            />

                            <button
                                onClick={toggleCustomizing}
                                className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all duration-300 border",
                                    isCustomizing
                                        ? "bg-teal-500 text-black border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                                        : "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isCustomizing ? 'LOCK' : 'EDIT'}
                            </button>

                            {isCustomizing && autoSaveStatus.hasPending && (
                                <button
                                    onClick={flushPendingSaves}
                                    className="p-1.5 text-teal-400 hover:bg-teal-400/10 rounded-md transition-all animate-pulse"
                                    title="Save Changes"
                                >
                                    <CloudUpload className="w-4 h-4" />
                                </button>
                            )}

                            {!autoSaveStatus.hasPending && isCustomizing && (
                                <div className="px-2 text-teal-500/60">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}

                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <ShareButton currentLayout={currentLayout} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-Navigation: Filters (Preserved Mapping) */}
            <AnimatePresence>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-8 pb-3 -mt-1"
                >
                    <ActiveFilterTags showAccountNumbers={true} />
                </motion.div>
            </AnimatePresence>
        </header>
    );
}
