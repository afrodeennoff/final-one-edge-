'use client'

import { Suspense, useState, useEffect } from 'react'
import { TeamEquityGridClient } from '../../../components/user-equity/team-equity-grid-client'
import { Zap } from 'lucide-react'

interface TeamTradersPageProps {
    params: Promise<{
        slug: string
    }>
}

export default function TeamTradersPage({ params }: TeamTradersPageProps) {
    const [slug, setSlug] = useState<string>('')

    // Handle async params
    useEffect(() => {
        params.then(({ slug }) => setSlug(slug))
    }, [params])

    if (!slug) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin" />
                </div>
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse font-black">Connecting Neutral Net...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                        <Zap className="h-8 w-8 text-teal-500" />
                        Traders Performance
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Global fleet telemetry and individual operator metrics.</p>
                </div>
            </div>

            <Suspense fallback={null}>
                <TeamEquityGridClient teamId={slug} />
            </Suspense>
        </div>
    )
}

