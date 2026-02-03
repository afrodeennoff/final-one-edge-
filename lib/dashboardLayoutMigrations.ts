type Layout = any
type Migration = (old: Layout) => Layout

export const dashboardLayoutMigrations: Record<number, Migration> = {
  1: (old) => {
    return old
  }
}
