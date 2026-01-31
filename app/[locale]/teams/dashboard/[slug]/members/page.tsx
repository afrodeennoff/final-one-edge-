'use client'

import { Suspense, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, UserPlus, ShieldPlus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TeamMembersPageProps {
    params: Promise<{
        slug: string
    }>
}

export default function TeamMembersPage({ params }: TeamMembersPageProps) {
    const [slug, setSlug] = useState<string>('')

    useEffect(() => {
        params.then(({ slug }) => setSlug(slug))
    }, [params])

    if (!slug) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin" />
            </div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse font-black">Scanning Biometrics...</p>
        </div>
    )

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                        <Users className="h-8 w-8 text-teal-500" />
                        Members & Roles
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Manage access levels and operational clearance for your squad.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-black font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Operator
                    </Button>
                </div>
            </div>

            <Card variant="default" className="border-white/5 py-20">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-teal-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative h-16 w-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                            <ShieldPlus className="h-8 w-8 text-teal-500" />
                        </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Centralized Control Incoming</h3>
                        <p className="text-zinc-500 text-sm font-medium">The advanced member management matrix is currently under construction. Please use the main Team Management portal for urgent access modifications.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-zinc-400 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]">
                        Access Global Portal
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

