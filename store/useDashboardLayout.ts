import { create } from "zustand"
import type { DashboardLayoutWithWidgets } from "@/store/user-store"

type State = {
  layout: DashboardLayoutWithWidgets | null
  setLayout: (l: DashboardLayoutWithWidgets) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useDashboardLayout = create<State>((set) => ({
  layout: null,
  setLayout: (layout) => set({ layout }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading })
}))
