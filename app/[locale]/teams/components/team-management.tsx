'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from "@/locales/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Plus,
  UserPlus,
  UserMinus,
  Eye,
  Settings,
  XCircle,
  Trash2,
  Users
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  joinTeam,
  leaveTeam,
  getUserTeams,
  addManagerToTeam,
  removeManagerFromTeam,
  updateManagerAccess,
  getUserTeamAccess,
  deleteTeam,
  renameTeam,
  sendTeamInvitation,
  getTeamInvitations,
  removeTraderFromTeam,
  cancelTeamInvitation,
  createTeam
} from '@/app/[locale]/dashboard/settings/actions'
import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'

interface Team {
  id: string
  name: string
  userId: string
  traderIds: string[]
  traders: { id: string; email: string }[]
  managers: { id: string; managerId: string; access: string; email: string }[]
  createdAt: any
  updatedAt: any
  userAccess?: string
}

interface ManagedTeam extends Team {
  userAccess: string
}

interface TeamManagementProps {
  // Event handlers
  onTeamClick?: (team: Team) => void
  onManageClick?: (team: Team) => void
  onViewClick?: (team: Team) => void

  // Initial Data for Server Comp hydration
  initialUserTeams?: {
    ownedTeams: Team[]
    joinedTeams: Team[]
  }
  initialManagedTeams?: ManagedTeam[]
}

export function TeamManagement({
  onTeamClick,
  onManageClick,
  onViewClick,
  initialUserTeams,
  initialManagedTeams
}: TeamManagementProps) {

  const pathname = usePathname()
  const [firstTeamId, setFirstTeamId] = useState<string | null>(null);

  useEffect(() => {
    // Only auto-redirect if we are exactly on the teams/dashboard root
    const isRoot = pathname.endsWith('/teams/dashboard') || pathname.endsWith('/teams/dashboard/');
    if (!isRoot) return;

    if (initialUserTeams && initialManagedTeams) {
      let targetId = null;
      if (initialUserTeams.ownedTeams.length > 0) targetId = initialUserTeams.ownedTeams[0].id
      else if (initialUserTeams.joinedTeams.length > 0) targetId = initialUserTeams.joinedTeams[0].id
      else if (initialManagedTeams.length > 0) targetId = initialManagedTeams[0].id

      if (targetId) setFirstTeamId(targetId)
    } else {
      const loadInitialData = async () => {
        setIsLoading(true)
        const teamsResult = await getUserTeams()
        const managedResult = await getUserTeamAccess()

        if (teamsResult.success) {
          if (teamsResult.ownedTeams && teamsResult.ownedTeams.length > 0) {
            setFirstTeamId(teamsResult.ownedTeams[0].id)
          } else if (teamsResult.joinedTeams && teamsResult.joinedTeams.length > 0) {
            setFirstTeamId(teamsResult.joinedTeams[0].id)
          }
        }
        if (!firstTeamId && managedResult.success && managedResult.managedTeams && managedResult.managedTeams.length > 0) {
          setFirstTeamId(managedResult.managedTeams[0].id)
        }
        setIsLoading(false)
      }
      loadInitialData()
    }
  }, [pathname, initialUserTeams, initialManagedTeams])

  useEffect(() => {
    if (firstTeamId && (pathname.endsWith('/teams/dashboard') || pathname.endsWith('/teams/dashboard/'))) {
      redirect(`/teams/dashboard/${firstTeamId}`)
    }
  }, [firstTeamId, pathname])
  const t = useI18n()

  // State
  const [userTeams, setUserTeams] = useState<{
    ownedTeams: Team[]
    joinedTeams: Team[]
  }>({
    ownedTeams: initialUserTeams?.ownedTeams || [],
    joinedTeams: initialUserTeams?.joinedTeams || []
  })

  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>(initialManagedTeams || [])
  const [isLoading, setIsLoading] = useState(!initialUserTeams && !initialManagedTeams)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // Form states
  const [newTeamName, setNewTeamName] = useState('')
  const [joinTeamId, setJoinTeamId] = useState('')
  const [newManagerEmail, setNewManagerEmail] = useState('')
  const [newManagerAccess, setNewManagerAccess] = useState<'admin' | 'viewer'>('viewer')
  const [renameTeamName, setRenameTeamName] = useState('')
  const [newTraderEmail, setNewTraderEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])

  // Load data on component mount
  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    setIsLoading(true)
    try {
      // Load owned and joined teams
      const teamsResult = await getUserTeams()
      if (teamsResult.success) {
        setUserTeams({
          ownedTeams: teamsResult.ownedTeams || [],
          joinedTeams: teamsResult.joinedTeams || [],
        })
      }

      // Load managed teams
      const managedResult = await getUserTeamAccess()
      if (managedResult.success) {
        setManagedTeams(managedResult.managedTeams || [])
      }
    } catch (error) {
      console.error('Error loading team data:', error)
      toast.error(t('dashboard.teams.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error(t('teams.rename.nameRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createTeam(newTeamName.trim())
      if (result.success) {
        toast.success(t('teams.management.createTeamTitle') + ' - ' + t('teams.rename.success'))
        setCreateDialogOpen(false)
        setNewTeamName('')
        await loadTeamData()
      } else {
        toast.error(result.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error(t('dashboard.teams.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!joinTeamId.trim()) {
      toast.error('Team ID is required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await joinTeam(joinTeamId.trim())
      if (result.success) {
        toast.success('Joined team successfully')
        setJoinDialogOpen(false)
        setJoinTeamId('')
        await loadTeamData()
      } else {
        toast.error(result.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error joining team:', error)
      toast.error(t('dashboard.teams.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLeaveTeam = async (teamId: string) => {
    try {
      const result = await leaveTeam(teamId)
      if (result.success) {
        toast.success(t('dashboard.teams.leaveSuccess'))
        await loadTeamData()
      } else {
        toast.error(result.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error leaving team:', error)
      toast.error(t('dashboard.teams.error'))
    }
  }

  const handleAddManager = async () => {
    if (!newManagerEmail.trim()) {
      toast.error(t('dashboard.teams.managerEmail'))
      return
    }

    if (!selectedTeam) return

    setIsSubmitting(true)
    try {
      const result = await addManagerToTeam(selectedTeam.id, newManagerEmail.trim(), newManagerAccess)
      if (result.success) {
        toast.success(t('dashboard.teams.managerAdded'))

        // Update the selected team locally
        const newManager = {
          id: `temp-${Date.now()}`, // Temporary ID
          managerId: 'temp-manager-id', // This will be updated when we reload the data
          access: newManagerAccess,
          email: newManagerEmail.trim(),
        }

        const updatedSelectedTeam = {
          ...selectedTeam,
          managers: [...selectedTeam.managers, newManager]
        }
        setSelectedTeam(updatedSelectedTeam)

        // Update the teams in the main state to keep everything in sync
        setUserTeams(prev => ({
          ownedTeams: prev.ownedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          ),
          joinedTeams: prev.joinedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          )
        }))

        setManagedTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? { ...updatedSelectedTeam, userAccess: team.userAccess }
              : team
          )
        )

        setNewManagerEmail('')
        setNewManagerAccess('viewer')

        // Note: We don't reload data immediately to keep the dialog open
        // Data will be refreshed when the dialog is closed or when needed
      } else {
        toast.error(result.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error adding manager:', error)
      toast.error(t('dashboard.teams.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveManager = async (managerId: string) => {
    if (!selectedTeam) return

    try {
      const result = await removeManagerFromTeam(selectedTeam.id, managerId)
      if (result.success) {
        toast.success(t('dashboard.teams.managerRemoved'))

        // Update the selected team locally
        const updatedSelectedTeam = {
          ...selectedTeam,
          managers: selectedTeam.managers.filter(manager => manager.managerId !== managerId)
        }
        setSelectedTeam(updatedSelectedTeam)

        // Update the teams in the main state to keep everything in sync
        setUserTeams(prev => ({
          ownedTeams: prev.ownedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          ),
          joinedTeams: prev.joinedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          )
        }))

        setManagedTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? { ...updatedSelectedTeam, userAccess: team.userAccess }
              : team
          )
        )

        // Note: We don't reload data immediately to keep the dialog open
        // Data will be refreshed when the dialog is closed
      } else {
        toast.error(result.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error removing manager:', error)
      toast.error(t('dashboard.teams.error'))
    }
  }

  const handleUpdateManagerAccess = async (managerId: string, access: 'admin' | 'viewer') => {
    if (!selectedTeam) return

    try {
      const result = await updateManagerAccess(selectedTeam.id, managerId, access)
      if (result.success) {
        toast.success(t('dashboard.teams.accessUpdated'))

        // Update the selected team locally
        const updatedSelectedTeam = {
          ...selectedTeam,
          managers: selectedTeam.managers.map(manager =>
            manager.managerId === managerId
              ? { ...manager, access }
              : manager
          )
        }
        setSelectedTeam(updatedSelectedTeam)

        // Update the teams in the main state to keep everything in sync
        setUserTeams(prev => ({
          ownedTeams: prev.ownedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          ),
          joinedTeams: prev.joinedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          )
        }))

        setManagedTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? { ...updatedSelectedTeam, userAccess: team.userAccess }
              : team
          )
        )

        // Note: We don't reload data immediately to keep the dialog open
        // Data will be refreshed when the dialog is closed or when needed
      } else {
        toast.error(result.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error updating manager access:', error)
      toast.error(t('dashboard.teams.error'))
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const result = await deleteTeam(teamId)
      if (result.success) {
        toast.success('Team deleted successfully')
        await loadTeamData()
      } else {
        toast.error(result.error || 'Failed to delete team')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error('Failed to delete team')
    }
  }

  const handleRenameTeam = async () => {
    if (!selectedTeam || !renameTeamName.trim()) {
      toast.error(t('teams.rename.nameRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      const result = await renameTeam(selectedTeam.id, renameTeamName.trim())
      if (result.success) {
        toast.success(t('teams.rename.success'))

        // Update the selected team name locally
        const updatedSelectedTeam = {
          ...selectedTeam,
          name: renameTeamName.trim()
        }
        setSelectedTeam(updatedSelectedTeam)

        // Update the teams in the main state to keep everything in sync
        setUserTeams(prev => ({
          ownedTeams: prev.ownedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          ),
          joinedTeams: prev.joinedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          )
        }))

        setManagedTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? { ...updatedSelectedTeam, userAccess: team.userAccess }
              : team
          )
        )

        // Keep the modal open and reset the rename input
        setRenameTeamName('')
      } else {
        toast.error(result.error || t('teams.rename.error'))
      }
    } catch (error) {
      console.error('Error renaming team:', error)
      toast.error(t('teams.rename.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTrader = async () => {
    if (!selectedTeam || !newTraderEmail.trim()) {
      toast.error(t('teams.traders.add.emailRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      const result = await sendTeamInvitation(selectedTeam.id, newTraderEmail.trim())
      if (result.success) {
        toast.success(t('teams.invitations.sent'))
        setNewTraderEmail('')
        // Only reload pending invitations, no need to reload all team data
        await loadPendingInvitations()
      } else {
        toast.error(result.error || t('teams.traders.add.error'))
      }
    } catch (error) {
      console.error('Error adding trader:', error)
      toast.error(t('teams.traders.add.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadPendingInvitations = async () => {
    if (!selectedTeam) return

    try {
      const result = await getTeamInvitations(selectedTeam.id)
      if (result.success) {
        setPendingInvitations(result.invitations || [])
      }
    } catch (error) {
      console.error('Error loading pending invitations:', error)
    }
  }

  const handleRemoveTrader = async (traderId: string) => {
    if (!selectedTeam) return

    try {
      const removeResult = await removeTraderFromTeam(selectedTeam.id, traderId)
      if (removeResult.success) {
        toast.success('Trader removed successfully')

        // Update the selected team locally
        const updatedSelectedTeam = {
          ...selectedTeam,
          traderIds: selectedTeam.traderIds.filter(id => id !== traderId),
          traders: selectedTeam.traders.filter(trader => trader.id !== traderId)
        }
        setSelectedTeam(updatedSelectedTeam)

        // Update the teams in the main state to keep everything in sync
        setUserTeams(prev => ({
          ownedTeams: prev.ownedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          ),
          joinedTeams: prev.joinedTeams.map(team =>
            team.id === selectedTeam.id
              ? updatedSelectedTeam
              : team
          )
        }))

        setManagedTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? { ...updatedSelectedTeam, userAccess: team.userAccess }
              : team
          )
        )
      } else {
        toast.error(removeResult.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error removing trader:', error)
      toast.error(t('dashboard.teams.error'))
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!selectedTeam) return

    try {
      const cancelResult = await cancelTeamInvitation(selectedTeam.id, invitationId)
      if (cancelResult.success) {
        toast.success('Invitation canceled successfully')
        await loadPendingInvitations()
      } else {
        toast.error(cancelResult.error || t('dashboard.teams.error'))
      }
    } catch (error) {
      console.error('Error canceling invitation:', error)
      toast.error(t('dashboard.teams.error'))
    }
  }

  const getStatusIndicator = (access: string, isOwner: boolean) => {
    if (isOwner) {
      return 'bg-yellow-500' // Gold for owner
    }
    switch (access) {
      case 'admin':
        return 'bg-blue-500' // Blue for admin
      case 'viewer':
        return 'bg-green-500' // Green for viewer
      default:
        return 'bg-muted'
    }
  }

  const getAccessLabel = (access: string, isOwner: boolean) => {
    if (isOwner) {
      return t('dashboard.teams.owner')
    }
    switch (access) {
      case 'admin':
        return t('dashboard.teams.admin')
      case 'viewer':
        return t('dashboard.teams.viewer')
      default:
        return access
    }
  }

  const formatDate = (date: any) => {
    if (date instanceof Date) {
      return date.toLocaleDateString()
    }
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString()
    }
    return 'Unknown date'
  }

  // Deduplicate teams to prevent showing the same team twice
  const allTeams = new Map<string, Team>()

  // Add owned teams first (highest priority)
  userTeams.ownedTeams.forEach(team => {
    allTeams.set(team.id, { ...team, userAccess: 'admin' })
  })

  // Add joined teams (medium priority)
  userTeams.joinedTeams.forEach(team => {
    if (!allTeams.has(team.id)) {
      allTeams.set(team.id, { ...team, userAccess: 'viewer' })
    }
  })

  // Add managed teams (lowest priority - only if not already added)
  managedTeams.forEach(team => {
    if (!allTeams.has(team.id)) {
      allTeams.set(team.id, team)
    }
  })

  const filteredTeams = Array.from(allTeams.values())

  // If we are on a specific team page, we don't render the selection grid here
  // The layout will render the specific team page as children
  const isSpecificTeamPage = pathname.includes('/teams/dashboard/') && pathname.split('/').pop() !== 'dashboard';

  if (isSpecificTeamPage) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            {t('teams.management.component.title')}
          </h1>
          <p className="text-zinc-500 mt-2 max-w-lg">
            {t('teams.management.component.description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Join Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Join a Team</DialogTitle>
                <DialogDescription className="text-zinc-500">
                  Enter the team ID provided by your team owner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamId" className="text-zinc-400">Team ID</Label>
                  <Input
                    id="teamId"
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value)}
                    placeholder="Enter team ID..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-teal-500/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinDialogOpen(false)} className="rounded-lg">Cancel</Button>
                <Button
                  onClick={handleJoinTeam}
                  disabled={isSubmitting}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-lg"
                >
                  {isSubmitting ? "Joining..." : "Join Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Team</DialogTitle>
                <DialogDescription className="text-zinc-500">
                  Build your own trading team and manage multiple accounts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name" className="text-zinc-400">Team Name</Label>
                  <Input
                    id="create-name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-teal-500/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-lg">Cancel</Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={isSubmitting}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-lg"
                >
                  {isSubmitting ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => {
          const isOwner = userTeams.ownedTeams.some(b => b.id === team.id)
          const isJoined = userTeams.joinedTeams.some(b => b.id === team.id)
          const isManaged = managedTeams.some(b => b.id === team.id)
          const access = team.userAccess || (isOwner ? 'admin' : 'viewer')
          const isActive = pathname.includes(`/teams/dashboard/${team.id}`)

          return (
            <Card key={team.id} variant="default" className={cn(
              "group/team transition-all duration-500",
              isActive && "ring-1 ring-teal-500/50 shadow-[0_0_40px_rgba(20,184,166,0.1)]"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center text-white ring-1 ring-white/10 bg-white/5 group-hover/team:bg-teal-500/10 group-hover/team:ring-teal-500/30 transition-all",
                      isActive && "bg-teal-500/20 ring-teal-500/50 text-teal-400"
                    )}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className={cn(
                        "text-lg font-bold truncate tracking-tight",
                        isActive ? "text-teal-400" : "text-white"
                      )}>
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase tracking-widest font-mono py-0 h-4 border-white/5 bg-white/5",
                          isOwner ? "text-yellow-500 border-yellow-500/20" :
                            access === 'admin' ? "text-blue-500 border-blue-500/20" :
                              "text-zinc-500"
                        )}>
                          {getAccessLabel(access, isOwner)}
                        </Badge>
                        {isActive && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5 group-hover/team:border-white/10 transition-colors">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">{t('dashboard.teams.traders')}</span>
                    <span className="text-xl font-bold text-white">{team.traderIds.length}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5 group-hover/team:border-white/10 transition-colors">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">{t('teams.management.created')}</span>
                    <span className="text-xs font-mono text-zinc-400">{formatDate(team.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    asChild
                    className={cn(
                      "flex-1 font-bold rounded-lg transition-all",
                      isActive
                        ? "bg-teal-500 hover:bg-teal-600 text-black"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    )}
                  >
                    <Link href={`/teams/dashboard/${team.id}`} className="flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-2" />
                      {isActive ? "Viewing" : t('teams.dashboard.view')}
                    </Link>
                  </Button>

                  {(isOwner || access === 'admin') && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-lg border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeam(team);
                        setRenameTeamName(team.name);
                        setManageDialogOpen(true);
                        setTimeout(() => loadPendingInvitations(), 100);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-zinc-700" />
          </div>
          <h2 className="text-2xl font-bold text-white">No teams yet</h2>
          <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
            Create a team to start managing multiple traders and accounts together.
          </p>
        </div>
      )}

      {/* Management Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-4xl bg-zinc-950 border-white/10 h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 border-b border-white/5">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="h-6 w-6 text-teal-400" />
              Manage Team: {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            {/* Rename Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Settings</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="rename" className="text-zinc-400">Team Name</Label>
                  <Input
                    id="rename"
                    value={renameTeamName}
                    onChange={(e) => setRenameTeamName(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-teal-500/50"
                  />
                </div>
                <Button
                  onClick={handleRenameTeam}
                  disabled={isSubmitting}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  {isSubmitting ? "Saving..." : "Rename"}
                </Button>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Traders Management */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Traders</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Trader email..."
                    value={newTraderEmail}
                    onChange={(e) => setNewTraderEmail(e.target.value)}
                    className="w-64 bg-white/5 border-white/10"
                  />
                  <Button
                    onClick={handleAddTrader}
                    disabled={isSubmitting}
                    className="bg-teal-500 hover:bg-teal-600 text-black font-bold"
                  >
                    Invite
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {selectedTeam?.traders.map((trader) => (
                  <div key={trader.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group/trader">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 font-mono">
                        {trader.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-zinc-300">{trader.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveTrader(trader.id)}
                      className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                    <div className="flex items-center gap-3">
                      <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-sm text-teal-400">{inv.email}</span>
                      <Badge variant="outline" className="text-[10px] py-0 border-teal-500/20 text-teal-500">PENDING</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleCancelInvitation(inv.id)}
                      className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {!selectedTeam?.traders.length && !pendingInvitations.length && (
                  <div className="text-center py-8 text-zinc-600 text-sm">No traders in this team yet.</div>
                )}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Danger Zone */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-500/50">Danger Zone</h3>
              <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Delete Team</h4>
                  <p className="text-sm text-zinc-500">All data and relationships will be permanently removed.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="font-bold">Delete permanently</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-950 border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Absolutly sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-500">
                        This will permanently delete the team "{selectedTeam?.name}" and all trader connections.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => selectedTeam && handleDeleteTeam(selectedTeam.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                      >
                        Delete Team
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-zinc-950">
            <Button onClick={() => setManageDialogOpen(false)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold">
              Close Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 