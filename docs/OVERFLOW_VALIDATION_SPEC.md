# Container Boundary Compliance & Overflow Validation Specification
## Design Approval Contingency Specification

**Version:** 1.0  
**Date:** 2026-01-31  
**Status:** **CONDITIONAL APPROVAL - Pending Overflow Validation**  

---

## Executive Summary

**Design Status:** 🟡 **CONDITIONALLY APPROVED**

The dashboard redesign is approved contingent upon strict compliance with container boundary requirements. All UI elements must demonstrate complete containment within their parent containers across all specified breakpoints before final design approval is granted.

**Critical Requirements:**
- ✅ Zero horizontal overflow permitted
- ✅ Vertical overflow only through intentional scrollable regions
- ✅ All content must auto-fit via wrapping, scaling, or truncation
- ✅ Systematic testing at 320px, 768px, 1024px, 1440px
- ✅ Automated overflow detection implementation
- ✅ CSS containment strategies mandatory

---

## Table of Contents
1. [Acceptance Criteria](#acceptance-criteria)
2. [CSS Containment Strategies](#css-containment-strategies)
3. [Component-Specific Requirements](#component-specific-requirements)
4. [Testing Procedures](#testing-procedures)
5. [Automated Overflow Detection](#automated-overflow-detection)
6. [Violation Reporting](#violation-reporting)
7. [Approval Checklist](#approval-checklist)

---

## 1. Acceptance Criteria

### 1.1 Hard Requirements (Must Pass)

```yaml
Horizontal Overflow:
  permitted: false
  tolerance: 0px
  description: "Absolutely no horizontal scroll allowed"
  
Vertical Overflow:
  permitted: conditional
  allowed_regions:
    - "ScrollArea components"
    - "Data tables with fixed headers"
    - "Widget canvas content areas"
  disallowed_regions:
    - "Page body"
    - "Widget cards"
    - "Navigation bars"
    - "Modal dialogs"
    - "Dropdown menus"
  
Content Containment:
  text_blocks: "Must wrap or truncate with ellipsis"
  images: "Must scale with max-width: 100%"
  buttons: "Must shrink or stack, never overflow"
  forms: "Inputs must be container-constrained"
  charts: "Must use ResponsiveContainer"
  icons: "Must be SVG or properly sized"
```

### 1.2 Breakpoint Testing Requirements

```typescript
const BREAKPOINTS = {
  mobile_small: '320px',    // Minimum supported width
  mobile_large: '375px',    // iPhone SE
  tablet_portrait: '768px', // iPad Mini
  tablet_landscape: '1024px', // iPad Pro
  desktop: '1440px',        // Standard desktop
}

const TEST_REQUIREMENTS = {
  horizontal_overflow: {
    max_tolerance: 0,
    measurement: 'document.documentElement.scrollWidth <= window.innerWidth',
    fail_action: 'BLOCK_DEPLOYMENT'
  },
  
  vertical_overflow: {
    allowed_elements: ['[data-scrollable="true"]', '.scroll-area'],
    measurement: 'check overflow on non-scrollable elements',
    fail_action: 'DOCUMENT_AND_FIX'
  }
}
```

---

## 2. CSS Containment Strategies

### 2.1 Global Containment Rules

**File:** `styles/globals.css` (Add to existing)

```css
/* ============================================
   CONTAINER BOUNDARY COMPLIANCE
   Zero horizontal overflow policy
   ============================================ */

/* Root containment - Prevent page-level overflow */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
  box-sizing: border-box;
}

/* Universal box-sizing */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Base containment for all containers */
.container,
.card,
.widget,
.modal,
.dropdown,
.navigation {
  overflow: hidden;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Text containment strategies */
.text-contain {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-contain-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-contain-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Image containment */
img,
video,
canvas,
svg {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Button containment - Never allow buttons to overflow */
button,
.btn,
[role="button"] {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Form input containment */
input,
textarea,
select {
  max-width: 100%;
  width: 100%;
}

/* Flex container containment */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
}

/* Grid container containment */
.grid-container {
  display: grid;
  max-width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

/* Code block containment */
pre,
code {
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Table containment - Only tables scroll horizontally */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  table-layout: fixed;
}

th, td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 0;
}

/* Widget-specific containment */
.widget-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.widget-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Chart containment */
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* Navigation containment */
.nav-link {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modal containment */
.modal-overlay {
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
}

.modal-content {
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 2rem);
  overflow: auto;
}

/* Dropdown menu containment */
.dropdown-menu {
  max-width: calc(100vw - 2rem);
  overflow: hidden;
}

.dropdown-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tooltip containment */
.tooltip {
  max-width: 300px;
  word-wrap: break-word;
}

/* Badge/tag containment */
.badge,
.tag,
.chip {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Critical: Prevent common overflow causes */
.no-overflow {
  overflow: hidden !important;
}

.break-words {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.break-all {
  word-break: break-all;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive container helper */
.responsive-container {
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Mobile-specific containment */
@media (max-width: 768px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .widget-card {
    width: 100%;
    max-width: 100vw;
    overflow: hidden;
  }
  
  .modal-content {
    max-width: calc(100vw - 1rem);
    max-height: calc(100vh - 1rem);
  }
}
```

### 2.2 Utility Classes for Tailwind

**File:** `tailwind.config.ts` (Update existing)

```typescript
export default {
  theme: {
    extend: {
      // Overflow utilities
      overflow: {
        'hidden': 'hidden',
        'auto': 'auto',
        'scroll': 'scroll',
        'visible': 'visible',
        'x-hidden': 'hidden',
        'y-auto': 'auto',
        'y-scroll': 'scroll',
      },
      
      // Text overflow
      textOverflow: {
        'ellipsis': 'ellipsis',
        'clip': 'clip',
      },
      
      // Word break
      wordBreak: {
        'normal': 'normal',
        'words': 'break-word',
        'all': 'break-all',
        'keep': 'keep-all',
      },
      
      // Max width utilities
      maxWidth: {
        '100': '100%',
        'screen': '100vw',
        'none': 'none',
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        'full': '100%',
      },
      
      // Min width utilities
      minWidth: {
        '0': '0',
        'full': '100%',
        'screen': '100vw',
      },
    },
  },
  plugins: [
    // Custom utilities for text truncation
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-1': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-line-clamp': '1',
          '-webkit-box-orient': 'vertical',
        },
        '.line-clamp-2': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
        },
        '.line-clamp-3': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
        },
        '.line-clamp-4': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-line-clamp': '4',
          '-webkit-box-orient': 'vertical',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
```

---

## 3. Component-Specific Requirements

### 3.1 Text Elements

```typescript
// Heading containment
const headingRequirements = {
  h1: {
    max_width: '100%',
    overflow: 'hidden',
    text_overflow: 'ellipsis',
    white_space: 'nowrap', // For single-line headings
    // OR
    white_space: 'normal',  // For multi-line headings
    word_wrap: 'break-word',
  },
  
  longText: {
    display: '-webkit-box',
    webkitLineClamp: 'variable (1-4 lines)',
    webkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}
```

**Implementation:**
```tsx
// Component examples
<h1 className="truncate max-w-full">Long Heading That Needs Truncation</h1>

<p className="line-clamp-3">
  Long paragraph text that should be truncated after 3 lines if it exceeds
  the container height. This ensures no overflow occurs.
</p>

<span className="break-words max-w-full">
  Supercalifragilisticexpialidociouswordthatneedsbreaking
</span>
```

### 3.2 Images & Media

```tsx
// Safe image component
interface SafeImageProps {
  src: string
  alt: string
  className?: string
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`max-w-full h-auto object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback on error
        e.currentTarget.src = '/placeholder.svg'
      }}
    />
  )
}
```

### 3.3 Buttons

```tsx
// Overflow-safe button
export function SafeButton({ children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'max-w-full overflow-hidden',
        'text-ellipsis whitespace-nowrap',
        'flex items-center justify-center',
        props.className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
    </button>
  )
}
```

### 3.4 Form Inputs

```tsx
// Container-safe input
export function SafeInput(props: InputProps) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <input
        {...props}
        className={cn(
          'w-full max-w-full',
          'box-border',
          'text-ellipsis',
          props.className
        )}
      />
    </div>
  )
}
```

### 3.5 Charts

```tsx
// Container-safe chart wrapper
import { ResponsiveContainer } from 'recharts'

export function SafeChart({ children, ...props }: ChartProps) {
  return (
    <div className="chart-container w-full h-full min-h-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
```

### 3.6 Tables

```tsx
// Overflow-safe table
export function SafeTable({ children, className }: TableProps) {
  return (
    <div className="table-container w-full overflow-x-auto">
      <table className={cn('w-full table-layout-fixed', className)}>
        {children}
      </table>
    </div>
  )
}

// Table cell with truncation
export function TableCell({ children, className }: CellProps) {
  return (
    <td className={cn('overflow-hidden text-ellipsis whitespace-nowrap', className)}>
      {children}
    </td>
  )
}
```

### 3.7 Modals

```tsx
// Boundary-compliant modal
export function SafeModal({ children, ...props }: ModalProps) {
  return (
    <div className="modal-overlay fixed inset-0 overflow-hidden z-50">
      <div className="modal-content 
                      max-w-[calc(100vw-2rem)] 
                      max-h-[calc(100vh-2rem)] 
                      overflow-auto
                      m-auto
                      absolute inset-4">
        {children}
      </div>
    </div>
  )
}
```

### 3.8 Widget Cards

```tsx
// Strictly contained widget
export function BoundaryCompliantWidget({ 
  id, 
  title, 
  children, 
  size 
}: WidgetProps) {
  return (
    <div
      className={cn(
        'widget-card',
        'w-full max-w-full',
        'overflow-hidden',
        'flex flex-col',
        // Size-specific containment
        size === 'tiny' && 'min-h-[100px] max-h-[120px]',
        size === 'small' && 'min-h-[200px] max-h-[300px]',
        size === 'medium' && 'min-h-[280px] max-h-[400px]',
        size === 'large' && 'min-h-[400px] max-h-[600px]',
      )}
      data-widget-id={id}
    >
      {/* Header - Always visible, truncates if needed */}
      <div className="widget-header flex-shrink-0 overflow-hidden">
        <h3 className="truncate text-sm font-semibold">{title}</h3>
      </div>
      
      {/* Content - Flexible but contained */}
      <div className="widget-content flex-1 min-h-0 overflow-hidden">
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Testing Procedures

### 4.1 Manual Testing Checklist

```yaml
Pre-Deployment Checklist:
  Visual Inspection:
    - [ ] Open browser DevTools (F12)
    - [ ] Resize viewport to 320px width
    - [ ] Check for horizontal scrollbar (FAIL if present)
    - [ ] Resize viewport to 768px width
    - [ ] Check for horizontal scrollbar (FAIL if present)
    - [ ] Resize viewport to 1024px width
    - [ ] Check for horizontal scrollbar (FAIL if present)
    - [ ] Resize viewport to 1440px width
    - [ ] Check for horizontal scrollbar (FAIL if present)
  
  Element Inspection:
    - [ ] Select all images: verify max-width: 100%
    - [ ] Select all videos: verify max-width: 100%
    - [ ] Select all buttons: verify overflow: hidden
    - [ ] Select all inputs: verify max-width: 100%
    - [ ] Select all text blocks: verify wrapping or truncation
    - [ ] Select all charts: verify ResponsiveContainer
    - [ ] Select all tables: verify table-container wrapper
  
  Edge Cases:
    - [ ] Enter very long text without spaces: verify break-word
    - [ ] Upload large image: verify scaling
    - [ ] Enter very long URL: verify truncation
    - [ ] Open nested modals: verify containment
    - [ ] Expand all dropdowns: verify no overflow
    - [ ] Test with mobile device or emulator
```

### 4.2 Browser DevTools Procedure

**Step-by-Step Overflow Detection:**

```
1. Open Chrome DevTools (F12 or Cmd+Option+I)

2. Navigate to Console tab

3. Run this script to detect overflow:
```

```javascript
// Overflow Detection Script - Run in DevTools Console
(function detectOverflow() {
  const allElements = document.querySelectorAll('*');
  const violations = [];
  
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement;
    
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      
      // Check horizontal overflow
      if (rect.right > parentRect.right) {
        violations.push({
          element: el.tagName + (el.className ? '.' + el.className : ''),
          issue: 'horizontal-overflow',
          overflowAmount: (rect.right - parentRect.right).toFixed(2) + 'px',
          parent: parent.tagName + (parent.className ? '.' + parent.className : '')
        });
      }
      
      // Check if element causes page-wide horizontal scroll
      if (rect.right > window.innerWidth) {
        violations.push({
          element: el.tagName + (el.className ? '.' + el.className : ''),
          issue: 'viewport-overflow',
          overflowAmount: (rect.right - window.innerWidth).toFixed(2) + 'px',
          viewportWidth: window.innerWidth + 'px',
          elementRight: rect.right.toFixed(2) + 'px'
        });
      }
    }
  });
  
  if (violations.length > 0) {
    console.group('🚨 OVERFLOW VIOLATIONS DETECTED');
    console.table(violations);
    console.groupEnd();
    
    // Highlight violations
    violations.forEach(v => {
      console.error(`${v.issue}: ${v.element}`);
    });
    
    return violations;
  } else {
    console.log('✅ No overflow violations detected');
    return [];
  }
})();
```

### 4.3 Responsive Testing Script

**File:** `scripts/test-overflow.js` (Create new file)

```javascript
/**
 * Automated Overflow Testing Script
 * Tests multiple breakpoints for container boundary compliance
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BREAKPOINTS = [
  { name: 'mobile_small', width: 320, height: 568 },
  { name: 'mobile_large', width: 375, height: 667 },
  { name: 'tablet_portrait', width: 768, height: 1024 },
  { name: 'tablet_landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];

const URL = 'http://localhost:3000/dashboard';

async function testOverflowAtBreakpoint(page, breakpoint) {
  await page.setViewport({
    width: breakpoint.width,
    height: breakpoint.height,
  });
  
  await page.goto(URL, { waitUntil: 'networkidle2' });
  
  // Check for horizontal overflow
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  
  // Get overflow details
  const overflowDetails = await page.evaluate(() => {
    const violations = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        violations.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          overflow: (rect.right - window.innerWidth) + 'px',
          right: rect.right + 'px',
          viewport: window.innerWidth + 'px',
        });
      }
    });
    
    return violations;
  });
  
  // Take screenshot if overflow detected
  let screenshotPath = null;
  if (hasHorizontalOverflow || overflowDetails.length > 0) {
    screenshotPath = `./screenshots/overflow-${breakpoint.name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
  
  return {
    breakpoint: breakpoint.name,
    width: breakpoint.width,
    height: breakpoint.height,
    hasOverflow: hasHorizontalOverflow || overflowDetails.length > 0,
    violations: overflowDetails,
    screenshot: screenshotPath,
  };
}

async function runAllTests() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const results = [];
  
  for (const breakpoint of BREAKPOINTS) {
    console.log(`Testing breakpoint: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
    
    const result = await testOverflowAtBreakpoint(page, breakpoint);
    results.push(result);
    
    if (result.hasOverflow) {
      console.error(`  ❌ OVERFLOW DETECTED at ${breakpoint.name}`);
      console.error(`     Violations: ${result.violations.length}`);
      if (result.screenshot) {
        console.error(`     Screenshot: ${result.screenshot}`);
      }
    } else {
      console.log(`  ✅ No overflow at ${breakpoint.name}`);
    }
  }
  
  await browser.close();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    total_tests: results.length,
    passed: results.filter(r => !r.hasOverflow).length,
    failed: results.filter(r => r.hasOverflow).length,
    results: results,
  };
  
  fs.writeFileSync(
    './overflow-test-results.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total: ${report.total_tests}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Report saved to: ./overflow-test-results.json`);
  
  return report;
}

// Run tests
runAllTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

**Package.json script addition:**

```json
{
  "scripts": {
    "test:overflow": "node scripts/test-overflow.js",
    "test:overflow:watch": "nodemon --watch app --exec 'npm run test:overflow'"
  }
}
```

---

## 5. Automated Overflow Detection

### 5.1 CI/CD Integration

**File:** `.github/workflows/overflow-check.yml` (Create new file)

```yaml
name: Overflow Boundary Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  overflow-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Start development server
        run: npm run dev &
        env:
          PORT: 3000
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Install Puppeteer
        run: npm install --save-dev puppeteer
      
      - name: Run overflow tests
        run: npm run test:overflow
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: overflow-test-results
          path: |
            overflow-test-results.json
            screenshots/
      
      - name: Check for failures
        run: |
          if [ -f overflow-test-results.json ]; then
            FAILED=$(node -e "console.log(require('./overflow-test-results.json').failed)")
            if [ "$FAILED" -gt "0" ]; then
              echo "❌ OVERFLOW DETECTED: Design approval not granted"
              echo "View results in overflow-test-results.json"
              exit 1
            else
              echo "✅ All overflow tests passed"
            fi
          fi
```

### 5.2 Jest Test Helper

**File:** `tests/helpers/overflow.ts` (Create new file)

```typescript
/**
 * Jest helper for testing component overflow
 */

export function testNoHorizontalOverflow(container: HTMLElement) {
  const violations: Array<{
    element: string
    overflow: string
  }> = []
  
  const allElements = container.querySelectorAll('*')
  
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect()
    const parent = el.parentElement
    
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      
      if (rect.right > parentRect.right) {
        violations.push({
          element: el.tagName + (el.className ? '.' + el.className : ''),
          overflow: `${(rect.right - parentRect.right).toFixed(2)}px`,
        })
      }
    }
  })
  
  expect(violations).toHaveLength(0)
  
  if (violations.length > 0) {
    console.error('Overflow violations:', violations)
  }
}

export function testViewportContainment(container: HTMLElement) {
  const viewportWidth = container.ownerDocument.defaultView.innerWidth
  const violations: Array<{
    element: string
    right: string
    viewport: string
    overflow: string
  }> = []
  
  const allElements = container.querySelectorAll('*')
  
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect()
    
    if (rect.right > viewportWidth) {
      violations.push({
        element: el.tagName + (el.className ? '.' + el.className : ''),
        right: `${rect.right.toFixed(2)}px`,
        viewport: `${viewportWidth}px`,
        overflow: `${(rect.right - viewportWidth).toFixed(2)}px`,
      })
    }
  })
  
  expect(violations).toHaveLength(0)
}

export function createBreakpointTester(Component: React.ComponentType<any>) {
  return async (width: number) => {
    const { container } = render(Component)
    
    // Set container width
    container.style.width = `${width}px`
    container.style.maxWidth = `${width}px`
    
    // Test for overflow
    testNoHorizontalOverflow(container)
    testViewportContainment(container)
  }
}
```

### 5.3 React Component Test Example

**File:** `components/dashboard/__tests__/widget-card.overflow.test.tsx` (Create new file)

```typescript
import { render, screen } from '@testing-library/react'
import { WidgetCard } from '../widget-card'
import { testNoHorizontalOverflow, createBreakpointTester } from '@/tests/helpers/overflow'

describe('WidgetCard - Overflow Compliance', () => {
  const testAtBreakpoints = createBreakpointTester(
    <WidgetCard
      id="test-widget"
      title="Test Widget Title That Might Be Very Long And Needs Truncation"
      size="medium"
    >
      <div>Widget content goes here and should not overflow</div>
    </WidgetCard>
  )
  
  it('does not overflow at 320px', async () => {
    await testAtBreakpoints(320)
  })
  
  it('does not overflow at 768px', async () => {
    await testAtBreakpoints(768)
  })
  
  it('does not overflow at 1024px', async () => {
    await testAtBreakpoints(1024)
  })
  
  it('does not overflow at 1440px', async () => {
    await testAtBreakpoints(1440)
  })
  
  it('truncates long titles', () => {
    const { container } = render(
      <WidgetCard
        id="test-widget"
        title="This is an extremely long widget title that should be truncated with ellipsis when it exceeds the container width"
        size="small"
      >
        <div>Content</div>
      </WidgetCard>
    )
    
    const title = screen.getByText(/This is an extremely long widget title/)
    expect(title).toHaveClass('truncate')
    testNoHorizontalOverflow(container)
  })
})
```

---

## 6. Violation Reporting

### 6.1 Violation Report Template

**File:** `docs/OVERFLOW_VIOLATION_REPORT_TEMPLATE.md` (Create new file)

```markdown
# Overflow Violation Report

**Date:** {{DATE}}  
**Component/Page:** {{COMPONENT_NAME}}  
**Reporter:** {{REPORTER_NAME}}  
**Status:** {{OPEN|IN_PROGRESS|RESOLVED}}

---

## Violation Summary

**Severity:** 🔴 Critical / 🟡 High / 🟢 Medium  
**Breakpoint:** {{320px|768px|1024px|1440px|ALL}}  
**Overflow Type:** Horizontal / Vertical  
**Approval Status:** ❌ BLOCKED / ⚠️ WARNING / ✅ PASS

---

## Violation Details

### Affected Element
- **Tag:** `{{<TAG>}}`
- **Class:** `{{.class-name}}`
- **ID:** `{{#id}}`
- **Location:** {{FILE_PATH}}:{{LINE_NUMBER}}

### Overflow Measurement
- **Element Width:** {{WIDTH}}px
- **Container Width:** {{CONTAINER_WIDTH}}px
- **Overflow Amount:** {{OVERFLOW}px
- **Viewport Width:** {{VIEWPORT_WIDTH}}px

### Screenshot
![Screenshot](./screenshots/{{SCREENSHOT_FILE}})

### Code Snippet
\`\`\`tsx
{{PROBLEMATIC_CODE}}
\`\`\`

---

## Root Cause Analysis

**Issue:** {{DESCRIPTION_OF_WHY_OVERFLOW_OCCURS}}

**Contributing Factors:**
1. {{FACTOR_1}}
2. {{FACTOR_2}}
3. {{FACTOR_3}}

---

## Proposed Solution

### CSS Fix
\`\`\`css
{{CSS_SOLUTION}}
\`\`\`

### Component Code Fix
\`\`\`tsx
{{COMPONENT_SOLUTION}}
\`\`\`

### Alternative Solution
{{ALTERNATIVE_APPROACH}}

---

## Testing Verification

- [ ] Fix applied at {{BREAKPOINT}}
- [ ] Manual testing passed
- [ ] Automated tests pass
- [ ] Screenshot captured (after fix)
- [ ] No regressions at other breakpoints

---

## Approval Sign-off

**Developer:** {{NAME}} - {{DATE}}  
**Reviewer:** {{NAME}} - {{DATE}}  
**Final Approval:** {{NAME}} - {{DATE}}

---

## Resolution

**Status:** ✅ RESOLVED  
**Resolution Date:** {{DATE}}  
**Resolution Method:** {{CSS_CHANGE|CODE_REFACTOR|LAYOUT_ADJUSTMENT}}  
**Verified By:** {{NAME}}

**Final Screenshot:**
![Resolved](./screenshots/{{RESOLVED_SCREENSHOT}})
```

### 6.2 Example Violation Report

```markdown
# Overflow Violation Report

**Date:** 2026-01-31  
**Component/Page:** Dashboard - QuickStatsBar  
**Reporter:** QA Team  
**Status:** OPEN

---

## Violation Summary

**Severity:** 🔴 Critical  
**Breakpoint:** 320px (Mobile Small)  
**Overflow Type:** Horizontal  
**Approval Status:** ❌ BLOCKED

---

## Violation Details

### Affected Element
- **Tag:** `<span>`  
- **Class:** `.metric-value`  
- **ID:** N/A  
- **Location:** `components/dashboard/quick-stats-bar.tsx:45`

### Overflow Measurement
- **Element Width:** 342px  
- **Container Width:** 320px  
- **Overflow Amount:** 22px  
- **Viewport Width:** 320px

### Screenshot
![Screenshot](./screenshots/overflow-quickstats-320px-20260131.png)

### Code Snippet
```tsx
<span className="metric-value text-2xl font-bold">
  ${pnlValue.toLocaleString()}
</span>
```

---

## Root Cause Analysis

**Issue:** Long P&L value with comma formatting exceeds container width at 320px breakpoint. Font size (text-2xl = 24px) is too large for small screen.

**Contributing Factors:**
1. No max-width constraint on metric value
2. Fixed font size doesn't scale down
3. Long numbers ($12,437.55) don't wrap appropriately
4. No text truncation applied

---

## Proposed Solution

### CSS Fix
```css
.metric-value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 320px) {
  .metric-value {
    font-size: 1rem; /* Reduce from text-2xl (24px) to text-base (16px) */
  }
}
```

### Component Code Fix
```tsx
<span className="metric-value text-xl sm:text-2xl font-bold truncate max-w-full">
  {pnlValue.toLocaleString()}
</span>
```

---

## Testing Verification

- [ ] Fix applied at 320px
- [ ] Manual testing passed
- [ ] Automated tests pass
- [ ] Screenshot captured (after fix)
- [ ] No regressions at other breakpoints

---

## Approval Sign-off

**Developer:** @developer-name - 2026-02-01  
**Reviewer:** @reviewer-name - 2026-02-01  
**Final Approval:** PENDING

---

## Resolution

**Status:** ⏳ IN PROGRESS  
**Resolution Date:** TBD  
**Resolution Method:** CSS_CHANGE  
**Verified By:** PENDING

**Final Screenshot:**
PENDING
```

---

## 7. Approval Checklist

### 7.1 Pre-Approval Requirements

```yaml
Developer Verification:
  css_containment_strategies:
    - [ ] All elements have overflow: hidden or text-overflow: ellipsis
    - [ ] All images have max-width: 100%
    - [ ] All videos have max-width: 100%
    - [ ] All buttons have max-width: 100% and overflow: hidden
    - [ ] All inputs have max-width: 100%
    - [ ] All charts use ResponsiveContainer
    - [ ] All tables are wrapped in scrollable container
    - [ ] All widgets have overflow: hidden
  
  breakpoint_testing:
    - [ ] Tested at 320px (no horizontal overflow)
    - [ ] Tested at 768px (no horizontal overflow)
    - [ ] Tested at 1024px (no horizontal overflow)
    - [ ] Tested at 1440px (no horizontal overflow)
  
  automated_tests:
    - [ ] Puppeteer tests pass (all breakpoints)
    - [ ] Jest overflow tests pass
    - [ ] CI/CD pipeline passes
    - [ ] No console overflow errors
  
  edge_cases:
    - [ ] Long text without spaces handled
    - [ ] Large images scale properly
    - [ ] Long URLs truncated
    - [ ] Nested modals contained
    - [ ] Dropdowns don't overflow
    - [ ] Form inputs contained
    - [ ] Charts responsive at all sizes

QA Verification:
  manual_testing:
    - [ ] Visual inspection at all breakpoints
    - [ ] Browser DevTools overflow check passed
    - [ ] No horizontal scrollbar present
    - [ ] Intentional vertical scroll regions work
    - [ ] Screenshots captured for all breakpoints
  
  cross_browser:
    - [ ] Chrome (latest)
    - [ ] Firefox (latest)
    - [ ] Safari (latest)
    - [ ] Edge (latest)
    - [ ] Mobile Safari (iOS)
    - [ ] Chrome Mobile (Android)
  
  accessibility:
    - [ ] Zoom to 200% (no horizontal overflow)
    - [ ] Zoom to 400% (no horizontal overflow)
    - [ ] Text spacing increased (still contained)
    - [ ] Screen reader announcements work
```

### 7.2 Final Approval Matrix

| Component | 320px | 768px | 1024px | 1440px | Status | Approved By |
|-----------|-------|-------|--------|--------|--------|-------------|
| Header | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| Sidebar | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| QuickStatsBar | ❌ | ✅ | ✅ | ✅ | **BLOCKED** | - |
| WidgetGrid | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| WidgetCard | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| Charts | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| Modals | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| Forms | ✅ | ✅ | ✅ | ✅ | PASS | @dev |
| Tables | ✅ | ✅ | ✅ | ✅ | PASS | @dev |

**Overall Status:** 🟡 **CONDITIONAL - 1 Component Blocked**

### 7.3 Approval Sign-Off

```yaml
Design Approval:
  status: CONDITIONAL
  conditions:
    - "QuickStatsBar overflow at 320px must be resolved"
    - "All automated tests must pass"
    - "Cross-browser testing must be complete"
  
  approved_by:
    designer: "@designer - 2026-01-31"
    tech_lead: "@tech-lead - PENDING"
    product_owner: "@po - PENDING"

Implementation Approval:
  status: PENDING
  required:
    - "All overflow violations resolved"
    - "All tests passing"
    - "Documentation complete"
    - "Code review approved"
```

---

## Conclusion

**Design Approval Status:** 🟡 **CONDITIONALLY APPROVED**

The dashboard redesign design is approved pending successful completion of container boundary compliance validation. All components must pass overflow testing at specified breakpoints before final approval is granted.

**Next Steps:**
1. Implement CSS containment strategies
2. Run automated overflow detection scripts
3. Fix all identified violations
4. Complete testing checklist
5. Submit for final approval

**Approval Authority:**
- Design Lead: {{NAME}}
- Technical Lead: {{NAME}}
- Product Owner: {{NAME}}

---

**Last Updated:** 2026-01-31  
**Review Date:** 2026-02-07  
**Valid Until:** 2026-03-31
