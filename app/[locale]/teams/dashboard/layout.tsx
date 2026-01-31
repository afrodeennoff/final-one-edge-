import { Suspense } from 'react'
import { TeamManagement } from '../components/team-management'
import { getUserTeams, getUserTeamAccess } from '@/app/[locale]/dashboard/settings/actions'

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AIModelSidebar } from '@/components/sidebar/aimodel-sidebar'
import { GlobalSyncButton } from "@/app/[locale]/dashboard/components/global-sync-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Fetch initial data server-side for performance
    const teamsResult = await getUserTeams()
    const managedResult = await getUserTeamAccess()

    const initialUserTeams = teamsResult.success ? {
        ownedTeams: teamsResult.ownedTeams || [],
        joinedTeams: teamsResult.joinedTeams || []
    } : undefined

    const initialManagedTeams = managedResult.success ? managedResult.managedTeams : undefined

    return (
        <div className="flex min-h-screen w-full bg-[#020202] text-white">
            <AIModelSidebar />
            <SidebarInset className="flex-1 relative overflow-hidden bg-transparent">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 bg-[#020202]/95 backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <SidebarTrigger className="lg:hidden text-zinc-500 hover:text-white" />
                        <h1 className="text-sm font-bold text-white tracking-wide uppercase whitespace-nowrap">Team Terminal</h1>
                    </div>
                    <GlobalSyncButton />
                </header>
                <div className="px-2 sm:px-6 lg:px-8 py-6 relative z-10">
                    <TeamManagement
                        initialUserTeams={initialUserTeams}
                        initialManagedTeams={initialManagedTeams}
                    />
                    {children}
                </div>
            </SidebarInset>
        </div>
    )
}
