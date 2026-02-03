import { dashboardLayoutMigrations } from "./dashboardLayoutMigrations"
import { DASHBOARD_LAYOUT_VERSION } from "./dashboardLayoutVersion"

export function migrateDashboardLayout(layout: any, fromVersion: number) {
  let current = layout
  let v = fromVersion

  while (v < DASHBOARD_LAYOUT_VERSION) {
    const migrate = dashboardLayoutMigrations[v]
    if (!migrate) {
      break
    }
    current = migrate(current)
    v++
  }

  return current
}
