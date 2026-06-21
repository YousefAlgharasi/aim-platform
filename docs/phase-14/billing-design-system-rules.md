# Phase 14 — Billing UI Design System Rules

## Purpose

Document how all billing/payment UI must follow the approved AIM design system. Prevent one-off styling in billing UI.

## Source of Truth

The approved AIM design system is located at:

```
docs/design/source/aim-design-system/
```

All billing UI components must reference and follow this design system.

## Required Design Tokens

### Colors

- Use only design system color tokens (primary, secondary, success, warning, error, neutral scales)
- Status badges must use semantic colors from the design system:
  - Active/Succeeded: success color
  - Pending/Processing: warning color
  - Failed/Error: error color
  - Canceled/Expired: neutral color
  - Refunded: info color
- Do not use arbitrary hex values or custom colors

### Typography

- Use design system typography scale (headings, body, captions, labels)
- Currency amounts use the designated numeric/monospace style if defined
- Plan names use heading styles
- Table content uses body styles
- Status labels use caption/badge styles

### Spacing

- Use design system spacing tokens (4px, 8px, 12px, 16px, 24px, 32px, etc.)
- Card padding follows design system card spacing
- Table cell padding follows design system table spacing
- Form field spacing follows design system form spacing
- Do not use custom spacing values outside the token scale

### Border Radius

- Use design system radius tokens for cards, buttons, badges, inputs
- Do not use custom radius values

### Elevation/Shadows

- Use design system elevation tokens for cards and dialogs
- Do not use custom box-shadow values

## Required Shared Components

### Layout

- Page shell / app shell with sidebar navigation
- Content area with proper max-width and padding
- Responsive grid system from design system

### Cards

- Use shared card component for plan cards, payment cards, subscription cards
- Card header, body, footer follow design system card anatomy
- Do not create one-off card styles

### Tables

- Use shared table component for payments, invoices, refunds, audit logs
- Table headers, rows, cells follow design system table anatomy
- Support sortable columns where applicable
- Support pagination using design system pagination component

### Forms

- Use shared form components for refund request, coupon creation
- Input fields, labels, validation messages follow design system form anatomy
- Submit buttons use design system button component
- Form layout follows design system form spacing

### Badges

- Use shared badge component for status indicators
- Badge variants mapped to billing statuses:
  - `success`: active, succeeded, paid
  - `warning`: pending, trialing, past_due, draft, open
  - `error`: failed, uncollectible
  - `neutral`: canceled, expired, void, archived
  - `info`: refunded, partially_refunded

### Dialogs

- Use shared dialog/modal component for confirmations (cancel subscription, submit refund)
- Dialog anatomy follows design system (header, body, footer with actions)

### Buttons

- Use design system button variants (primary, secondary, danger, ghost)
- Subscribe/checkout: primary button
- Cancel subscription: danger button with confirmation
- Submit refund: secondary button
- Admin approve: primary button
- Admin deny: danger button

### Loading States

- Use design system skeleton component for initial page loads
- Use design system spinner for action-triggered loading
- Skeleton should match the shape of the content being loaded

### Empty States

- Use design system empty state component
- Include illustration (if available), message, and optional action
- Examples: "No subscriptions yet", "No payments found", "No invoices"

### Error States

- Use design system error banner or toast for API errors
- Do not expose sensitive error details to users
- Provide actionable messages: "Failed to load billing data. Please try again."

## Responsive Layout Rules

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<768px) | Single column, stacked cards, collapsible tables |
| Tablet (768-1024px) | Two-column where appropriate |
| Desktop (>1024px) | Full layout with sidebar |

- Plan cards: horizontal scroll or grid wrap on mobile
- Tables: horizontal scroll or card view on mobile
- Forms: full-width on mobile
- Dialogs: full-screen on mobile, centered on desktop

## Arabic/RTL Readiness

- All billing UI must support `dir="rtl"` attribute
- Layout must mirror correctly for RTL languages
- Text alignment must follow document direction
- Icons that indicate direction must flip for RTL
- Currency formatting must respect locale
- Date formatting must respect locale
- Form labels must align correctly in RTL
- Navigation must flip for RTL

## Accessibility Requirements

- All form inputs must have associated labels
- All buttons must have accessible names
- Status badges must not rely on color alone (include text)
- Tables must have proper header cells
- Dialogs must trap focus and support Escape to close
- Keyboard navigation must work for all interactive elements
- ARIA roles and attributes where required by design system
- Contrast ratios must meet WCAG 2.1 AA minimum

## Prohibited Patterns

- No inline styles for layout or theming
- No arbitrary hex colors
- No custom spacing outside design tokens
- No one-off card, table, or form styles
- No custom button styles
- No custom badge styles
- No layout patterns that break RTL
- No components that bypass the design system
- No hardcoded pixel values outside the spacing scale
- No z-index values outside the design system elevation scale
