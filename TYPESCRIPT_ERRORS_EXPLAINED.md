# TypeScript Errors Explained - Complete Fix Guide

**Total Errors**: 81  
**Categories**: 5 main problem areas  
**Estimated Fix Time**: 2-3 days for experienced developer

---

## Overview

The TypeScript errors are blocking your production build. This guide explains each category of errors and provides step-by-step fix instructions.

---

## Category 1: Widget Type System Issues (~40 errors)

### Problem Explanation

Your application has a widget system where the `Widget` type is defined locally in `@/store/user-store` but is **not exported**. Multiple files try to import this type, causing "locally declared" errors.

### Error Examples

```
lib/widget-conflict-resolution.ts(1,38): error TS2459: Module '"@/store/user-store"' declares 'Widget' locally, but it is not exported.
lib/widget-encryption.ts(1,38): error TS2459: Module '"@/store/user-store"' declares 'Widget' locally, but it is not exported.
lib/widget-migration-service.ts(1,38): error TS2459: Module '"@/store/user-store"' declares 'Widget' locally, but it is not exported.
```

### Root Cause

In TypeScript, when you define a type inside a module without using `export`, it's **local to that file only**. Other files cannot import it.

**Example of the problem:**

```typescript
// store/user-store.ts
type Widget = {  // ❌ Not exported - local only
  type: string;
  x: number;
  y: number;
}

// lib/widget-validator.ts
import { Widget } from '@/store/user-store'  // ❌ Error: Widget is not exported
```

### Solution

**Option 1: Export the type** (Recommended if Widget should be shared)

```typescript
// store/user-store.ts
export type Widget = {  // ✅ Exported - can be imported elsewhere
  type: string;
  x: number;
  y: number;
  // ... other properties
}
```

**Option 2: Create a shared types file** (Better for large projects)

```typescript
// types/widget.ts
export type Widget = {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  i: string;
  // ... other properties
}

export type WidgetType = 'chart' | 'statistics' | 'calendar' | 'mindset' | 'tradeJournal' | 'analysis' | 'import';

// store/user-store.ts
import type { Widget } from '@/types/widget';
```

### Files to Fix

- `/store/user-store.ts` - Export `Widget` type
- `/lib/widget-conflict-resolution.ts`
- `/lib/widget-encryption.ts`
- `/lib/widget-migration-service.ts`
- `/lib/widget-optimistic-updates.ts`
- `/lib/widget-persistence-manager.ts`
- `/lib/widget-version-service.ts`

### Additional Widget Type Issues

```
lib/widget-validator.ts(26,5): error TS2322: Type '"chart"' is not assignable to type 'WidgetType'.
```

This means your `WidgetType` enum/union is missing values. Fix it:

```typescript
// types/widget.ts
export type WidgetType = 
  | 'chart'           // ✅ Add this
  | 'statistics'      // ✅ Add this
  | 'calendar'        // ✅ Add this
  | 'mindset'         // ✅ Add this
  | 'tradeJournal'    // ✅ Add this
  | 'analysis'
  | 'import';
```

---

## Category 2: Database Schema Mismatches (~20 errors)

### Problem Explanation

Your code expects fields that don't exist in the Prisma schema, specifically:
- `version` field on `DashboardLayout`
- `layoutVersion` table in Prisma client

### Error Examples

```
server/database.ts(434,18): error TS2339: Property 'layoutVersion' does not exist on type 'PrismaClient'.
server/database.ts(450,9): error TS2353: Object literal may only specify known properties, and 'version' does not exist in type...
server/database.ts(604,29): error TS2353: Object literal may only specify known properties, and 'version' does not exist in type 'DashboardLayoutSelect<DefaultArgs>'.
```

### Root Cause

**Your Prisma schema doesn't have:**
1. A `layoutVersion` table/model
2. A `version` field on the `DashboardLayout` model

**But your code expects both.**

### Solution

**Option 1: Add missing fields to Prisma schema** (If you need versioning)

```prisma
// prisma/schema.prisma

model DashboardLayout {
  id        String   @id @unique @default(uuid())
  userId    String   @unique

  desktop   Json     @default("[]")
  mobile    Json     @default("[]")
  
  version   Int      @default(1)  // ✅ Add this field
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@schema("public")
}

// ✅ Add this new model if you need layout versioning
model LayoutVersion {
  id          String   @id @default(uuid())
  userId      String
  dashboardLayoutId String
  
  version     Int
  desktop     Json
  mobile      Json
  checksum    String
  description String?
  deviceId    String
  changeType  String
  
  createdAt   DateTime @default(now())
  
  dashboardLayout DashboardLayout @relation(fields: [dashboardLayoutId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([dashboardLayoutId])
  @@schema("public")
}
```

**Then run:**
```bash
npx prisma generate
npx prisma db push  # or npx prisma migrate dev
```

**Option 2: Remove version-related code** (If you don't need versioning)

If you don't need layout versioning, remove all references to:
- `layoutVersion` in database queries
- `version` field in DashboardLayout operations
- All version-tracking code

### Files with Version Issues

- `/server/database.ts` - Lines 434, 450, 478, 516, 549, 604
- `/lib/widget-persistence-manager.ts` - Lines 126, 137, 144, 150, 236, 254
- `/lib/widget-version-service.ts` - Lines 66, 173, 192

---

## Category 3: DashboardLayout Type Missing (~6 errors)

### Problem Explanation

Files are using `DashboardLayout` as a type but it's not imported or defined properly.

### Error Examples

```
app/[locale]/dashboard/dashboard-context-auto-save.tsx(14,62): error TS2304: Cannot find name 'DashboardLayout'.
app/[locale]/dashboard/dashboard-context.tsx(16,62): error TS2304: Cannot find name 'DashboardLayout'.
```

### Solution

**Import the type from Prisma:**

```typescript
// app/[locale]/dashboard/dashboard-context-auto-save.tsx

import type { DashboardLayout as PrismaDashboardLayout } from '@/prisma/generated/prisma';

// Or create a custom type that extends the Prisma type
type DashboardLayout = PrismaDashboardLayout & {
  // Add any custom fields
  version?: number;
};
```

**Or create a shared type file:**

```typescript
// types/dashboard.ts
import type { DashboardLayout as PrismaDashboardLayout } from '@/prisma/generated/prisma';

export type DashboardLayout = PrismaDashboardLayout;

// Or with custom fields:
export type DashboardLayoutWithWidgets = PrismaDashboardLayout & {
  desktop: Widget[];
  mobile: Widget[];
  version?: number;
};
```

---

## Category 4: Prisma Namespace Issues (~6 errors)

### Problem Explanation

Files are using `Prisma.Trade` or `Prisma.User` but the Prisma namespace is not properly configured.

### Error Examples

```
app/[locale]/dashboard/dashboard-context-auto-save.tsx(17,47): error TS2503: Cannot find namespace 'Prisma'.
app/[locale]/dashboard/dashboard-context-auto-save.tsx(18,45): error TS2503: Cannot find namespace 'Prisma'.
```

### Solution

**Option 1: Use generated types directly**

```typescript
// Instead of: Prisma.Trade
import { Trade } from '@/prisma/generated/prisma';

// Use the type directly
type TradeType = Trade;
```

**Option 2: Import Prisma namespace**

```typescript
import type { Prisma } from '@/prisma/generated/prisma';

// Now you can use Prisma.Trade, Prisma.User, etc.
type TradeType = Prisma.Trade;
```

**Option 3: Use Prisma's generated types**

```typescript
import type { PrismaClient } from '@/prisma/generated/prisma';

type Trade = PrismaClient['trade'];
type User = PrismaClient['user'];
```

---

## Category 5: Testing & Other Issues (~9 errors)

### Problem Explanation

Vitest is used in tests but not properly configured as a dependency.

### Error Example

```
lib/__tests__/auto-save-service.test.ts(1,65): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
```

### Solution

**Install Vitest:**

```bash
npm install -D vitest @vitest/ui
```

**Add to tsconfig:**

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

---

## Step-by-Step Fix Plan

### Phase 1: Export Types (1 hour)

1. **Export Widget type from user-store**
   ```bash
   # Open store/user-store.ts
   # Add 'export' before 'type Widget'
   ```

2. **Create shared types file** (optional but recommended)
   ```bash
   mkdir -p types
   touch types/widget.ts
   touch types/dashboard.ts
   ```

3. **Update all imports** in lib files

### Phase 2: Fix Prisma Schema (2-3 hours)

1. **Decide if you need versioning:**
   - If yes: Add `version` field and `LayoutVersion` model to schema
   - If no: Remove all version-related code

2. **Update schema:**
   ```bash
   # Edit prisma/schema.prisma
   # Add missing fields/models
   ```

3. **Regenerate Prisma client:**
   ```bash
   npx prisma generate
   npx prisma db push  # or migrate dev
   ```

### Phase 3: Fix Type Imports (1 hour)

1. **Import DashboardLayout type** in all files that use it

2. **Import Prisma types** where needed

3. **Fix any remaining type errors**

### Phase 4: Fix Tests (30 minutes)

1. **Install Vitest:**
   ```bash
   npm install -D vitest @vitest/ui
   ```

2. **Update tsconfig.json**

3. **Run typecheck:**
   ```bash
   npm run typecheck
   ```

---

## Verification Commands

```bash
# Check for remaining errors
npm run typecheck

# Count errors
npm run typecheck 2>&1 | grep "error TS" | wc -l

# Regenerate Prisma client
npx prisma generate

# Test build
npm run build
```

---

## Quick Reference: Common Fixes

### "Cannot find name 'X'" → Import it
```typescript
import { X } from './path';
```

### "Module declares X locally, but not exported" → Export it
```typescript
export type X = { ... };
```

### "Property 'Y' does not exist" → Add to schema or type
```typescript
// Add to Prisma schema
model ModelName {
  y Type @default(...)
}
```

### "Cannot find namespace 'Prisma'" → Import types
```typescript
import type { Prisma } from '@/prisma/generated/prisma';
```

---

## Expected Outcome

After fixing all errors:
- ✅ `npm run typecheck` passes with 0 errors
- ✅ `npm run build` completes successfully
- ✅ All types are properly exported and imported
- ✅ Prisma schema matches code expectations

---

## Need Help?

If you get stuck on any specific error, I can:
1. Fix individual errors for you
2. Create the complete fixed files
3. Set up the proper type structure
4. Generate the Prisma migrations

Just let me know which approach you prefer!
