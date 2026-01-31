# Widget Standardization Framework

> A comprehensive, Risk-Metrics-inspired policy architecture for enforcing unified risk management, security, and compliance across all widgets.

## 🎯 Overview

This framework provides a complete policy-engine SDK that:

- **Evaluates risk** for every widget action using Monte Carlo simulations
- **Enforces decisions** with green/amber/red path logic
- **Validates** all widget inputs/outputs against JSON schemas
- **Collects metrics** with Prometheus-compatible SLO monitoring
- **Secure inter-widget communication** via message bus with risk tokens
- **Automated CI/CD checks** for policy compliance

## 📋 Features

### 1. Policy Engine SDK

```typescript
import { getPolicyEngine } from '@/lib/widget-policy-engine/policy-engine'

const policyEngine = getPolicyEngine()
const result = await policyEngine.evaluateRisk(context, manifest)

if (result.decision === 'green') {
  // Proceed with action
}
```

### 2. React HOC Integration

```tsx
import { WithRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

<WithRiskEvaluation widgetId="my-widget" action="export_data">
  <button>Export</button>
</WithRiskEvaluation>
```

### 3. Schema Validation

- `widget-input.schema.json` - Input validation
- `widget-output.schema.json` - Output validation
- `widget-policy-manifest.schema.json` - Manifest validation
- `risk-register.schema.json` - Risk register validation

### 4. Error Handling

Centralized error codes with risk levels and remediation hints:

```typescript
import { WIDGET_ERROR_CODE, getWidgetErrorHandler } from '@/lib/widget-policy-engine/error-handler'

const errorHandler = getWidgetErrorHandler()
const error = errorHandler.handleError(
  new Error('Data fetch failed'),
  { widgetId: 'my-widget' }
)
```

### 5. Metrics Collection

Prometheus-compatible metrics:

```typescript
import { getMetricsCollector } from '@/lib/widget-policy-engine/metrics-collector'

const metrics = getMetricsCollector()
metrics.recordWidgetLoad('my-widget', '1.0.0', 150, 'Medium')
metrics.recordRiskDecision('my-widget', '1.0.0', 'Medium', 30)

const prometheusMetrics = metrics.exportPrometheusMetrics()
```

### 6. Inter-Widget Communication

Secure message bus with risk tokens:

```typescript
import { getWidgetMessageBus } from '@/lib/widget-policy-engine/message-bus'

const bus = getWidgetMessageBus()
await bus.publish({
  sourceWidgetId: 'widget-1',
  riskTier: 'Medium',
  action: 'data_update',
  payload: { data: '...' },
})

bus.subscribe({
  topic: 'widgets/*/widget-2/*',
  callback: (message) => console.log(message),
})
```

## 🚀 Quick Start

### 1. Create Widget Manifest

```json
{
  "schemaVersion": "1.0.0",
  "widgetId": "my-widget",
  "widgetVersion": "1.0.0",
  "policyVersion": "1.0.0",
  "riskAssessment": {
    "severityTier": "Medium",
    "probabilityScore": 0.4,
    "impactWeight": 35,
    "controlEffectiveness": 4,
    "residualRiskScore": 30
  },
  "features": [],
  "dataHandling": {
    "inputSchema": "widget-input.schema.json",
    "outputSchema": "widget-output.schema.json",
    "dataClassification": "internal",
    "encryptionRequired": false,
    "auditLogging": true,
    "retentionPeriod": "90d"
  },
  "compliance": {
    "frameworks": ["SOC2"],
    "auditHistory": [],
    "signoffs": []
  },
  "slos": {
    "p99LatencyMs": 200,
    "errorRate": 0.001,
    "riskScoreDrift": 0.05,
    "availability": 0.99
  },
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

### 2. Wrap Widget with HOC

```tsx
import { WithRiskEvaluation } from '@/components/widget-policy/with-risk-evaluation'

export default function MyWidget({ data, onAction }) {
  return (
    <WithRiskEvaluation
      widgetId="my-widget"
      action="update_data"
      inputs={{ data }}
      onConsent={onAction}
    >
      <div>{/* Widget content */}</div>
    </WithRiskEvaluation>
  )
}
```

### 3. Run Tests

```bash
# Validate manifests
npm run validate:manifests

# Run unit tests
npm run test:policy

# Check coverage
npm run test:coverage
```

## 📁 Structure

```
lib/widget-policy-engine/
├── types.ts                    # TypeScript types
├── policy-engine.ts            # Core policy engine
├── risk-calculator.ts          # Risk score calculator
├── decision-engine.ts          # Decision logic
├── mitigation-provider.ts      # Mitigation strategies
├── manifest-validator.ts       # JSON Schema validator
├── error-handler.ts            # Error handling
├── message-bus.ts              # Message bus
├── metrics-collector.ts        # Metrics collection
├── index.ts                    # Exports
└── __tests__/
    ├── policy-engine.test.ts
    ├── integration.test.ts
    └── property-based.test.ts

components/widget-policy/
└── with-risk-evaluation.tsx    # React HOC

schemas/
├── widget-input.schema.json
├── widget-output.schema.json
├── widget-policy-manifest.schema.json
└── risk-register.schema.json

.github/workflows/
└── widget-policy-compliance.yml # CI/CD

scripts/
└── codemods/
    └── add-policy-evaluation.js

docs/
├── WIDGET_STANDARDIZATION_FRAMEWORK.md
└── WIDGET_POLICY_IMPLEMENTATION_GUIDE.md
```

## 📊 Decision Flow

```
┌──────────────┐
│ Widget Action │
└──────┬───────┘
       ↓
┌──────────────────┐
│ Policy Evaluation │
└──────┬───────────┘
       ↓
┌──────────────────────┐
│ Risk Score < 40?     │──Yes──→ Green Path (Proceed)
└──────────┬───────────┘
           │ No
           ↓
┌──────────────────────┐
│ Risk Score < 80?     │──Yes──→ Amber Path (User Consent)
└──────────┬───────────┘
           │ No
           ↓
┌──────────────────────┐
│ Red Path (Block)     │
└──────────────────────┘
```

## 🔒 Security

### Risk Token Validation

All inter-widget messages include signed risk tokens:

```typescript
interface RiskToken {
  signature: string
  expiry: number
  riskLevel: SeverityTier
  payloadHash: string
}
```

### SLO Thresholds

| Metric | Threshold |
|--------|-----------|
| P99 Latency | ≤ 300 ms |
| Error Rate | ≤ 0.1% |
| Risk Score Drift | ≤ 5%/week |
| Availability | ≥ 99.0% |

## 📈 Monitoring

### Prometheus Metrics

```promql
# Widget load time
widget_load_ms{widget_id="my-widget",version="1.0.0",risk_tier="Medium"}

# User interactions
widget_user_interactions_total{widget_id="my-widget"}

# Risk decisions
widget_risk_decision_count_total{widget_id="my-widget"}

# Average risk score
widget_risk_score_avg{widget_id="my-widget"}

# Error rate
widget_error_rate{widget_id="my-widget"}
```

## 🧪 Testing

### Unit Tests

```typescript
import { PolicyEngine } from '@/lib/widget-policy-engine/policy-engine'

it('should allow low-risk actions', async () => {
  const engine = new PolicyEngine()
  const result = await engine.evaluateRisk(context, manifest)
  expect(result.decision).toBe('green')
})
```

### Integration Tests

```typescript
test('widget shows consent for high-risk actions', async () => {
  render(
    <WithRiskEvaluation widgetId="test" action="delete">
      <button>Delete</button>
    </WithRiskEvaluation>
  )
  expect(await screen.findByText(/confirmation required/i)).toBeInTheDocument()
})
```

### Property-Based Tests

```typescript
import fc from 'fast-check'

fc.assert(
  fc.asyncProperty(
    fc.record({ probabilityScore: fc.float({ min: 0, max: 1 }) }),
    async (assessment) => {
      const result = await engine.evaluateRisk(context, { ...manifest, riskAssessment: assessment })
      return result.riskScore >= 0 && result.riskScore <= 100
    }
  )
)
```

## 🔄 Migration

### Automated Codemods

```bash
# Add policy evaluation imports
npm run codemod:add-policy-evaluation

# Wrap with HOC
npm run codemod:wrap-risk-hoc

# Add error handling
npm run codemod:add-error-handling
```

### Migration Waves

| Wave | Risk Tier | Timeline |
|------|-----------|----------|
| 1 | Critical | Days 1-30 |
| 2 | High | Days 31-60 |
| 3 | Medium | Days 61-90 |
| 4 | Low | Days 91-120 |

## 📚 Documentation

- [Full Framework Documentation](./docs/WIDGET_STANDARDIZATION_FRAMEWORK.md)
- [Implementation Guide](./docs/WIDGET_POLICY_IMPLEMENTATION_GUIDE.md)

## ✅ Checklist

- [x] Policy Engine SDK
- [x] Risk Assessment Framework
- [x] JSON Schema Validation
- [x] Error Handling System
- [x] React HOC Integration
- [x] Message Bus
- [x] Metrics Collection
- [x] CI/CD Templates
- [x] Testing Suite
- [x] Migration Codemods
- [x] Documentation

## 📞 Support

For questions or issues:
- Documentation: [docs/WIDGET_STANDARDIZATION_FRAMEWORK.md](./docs/WIDGET_STANDARDIZATION_FRAMEWORK.md)
- GitHub Issues: [github.com/yourorg/yourrepo/issues]

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-01  
**Maintained By**: Security & Compliance Team
