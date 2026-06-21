# AIM Phase 14 Task Prompts

Phase 14: Payments and Billing

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion Database:
https://app.notion.com/p/383af08baaf680079a06dd7a76b318fe?v=f5f103539960455592337c6641b3dd0d

## Global Phase 14 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All payments/billing UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Backend and payment provider events own checkout, payment, subscription, invoice, refund, and entitlement authority.
- UI may display backend-approved billing data and start checkout through protected backend APIs only.
- UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Do not store raw card data.
- Do not commit payment provider secrets, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

## Stop Conditions

Stop immediately if:
- TEAM_MEMBER_NOTION_EMAIL is missing.
- The Notion task is already assigned.
- The task is not Undone.
- A dependency is incomplete.
- A dependency output is missing from GitHub.
- Working tree has unrelated changes.
- This prompt file or the exact task section is missing.
- A real secret is detected.
- UI work does not follow the AIM design system.
- Client/UI decides payment status, subscription status, refund status, invoice status, or entitlement state.
- Raw card data is stored.
- Payment provider secrets or webhook secrets are committed, exposed, or logged.
- Webhook endpoint lacks signature verification or idempotency.
- Billing endpoint lacks ownership/permission protection.
- Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics work appears outside explicit readiness documentation.

---

#P14-001

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-001 only.

Task:
Create Phase 14 Payments and Billing Charter

Branch:
phase14/P14-001-payments-billing-charter

Priority:
P0

Description:
Define Phase 14 scope, exclusions, payment authority rules, compliance boundaries, provider boundaries, and dependencies.

Goal:
Lock Phase 14 to payments, billing, subscriptions, invoices, refunds, and safe payment visibility.

Expected output:
docs/phase-14/payments-billing-charter.md

Dependencies:
P13-078

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-001

Files created/updated:
- ...

Branch:
phase14/P14-001-payments-billing-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-002

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-002 only.

Task:
Create Payments Domain Map

Branch:
phase14/P14-002-payments-domain-map

Priority:
P0

Description:
Document product, price, plan, subscription, checkout, payment, invoice, refund, coupon, entitlement, provider event, and audit entities.

Goal:
Establish the payment/billing domain before implementation.

Expected output:
docs/phase-14/payments-domain-map.md

Dependencies:
P14-001

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-002

Files created/updated:
- ...

Branch:
phase14/P14-002-payments-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-003

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-003 only.

Task:
Create Payment Authority Rules

Branch:
phase14/P14-003-payment-authority-rules

Priority:
P0

Description:
Define backend/provider authority for prices, payments, subscriptions, invoices, refunds, entitlements, and webhook events.

Goal:
Prevent client-side payment or entitlement authority.

Expected output:
docs/phase-14/payment-authority-rules.md

Dependencies:
P14-001

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-003

Files created/updated:
- ...

Branch:
phase14/P14-003-payment-authority-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-004

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-004 only.

Task:
Create Payment Compliance and Sensitive Data Rules

Branch:
phase14/P14-004-payment-compliance-rules

Priority:
P0

Description:
Document no raw card storage, no provider secrets in clients, no PCI-sensitive payload handling, and logging restrictions.

Goal:
Protect payment data and reduce compliance risk.

Expected output:
docs/phase-14/payment-compliance-sensitive-data-rules.md

Dependencies:
P14-001

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-004

Files created/updated:
- ...

Branch:
phase14/P14-004-payment-compliance-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-005

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-005 only.

Task:
Create Payment Provider Policy

Branch:
phase14/P14-005-payment-provider-policy

Priority:
P0

Description:
Define provider abstraction, supported methods, provider event handling, and fallback boundaries.

Goal:
Avoid provider lock-in and unsafe assumptions.

Expected output:
docs/phase-14/payment-provider-policy.md

Dependencies:
P14-002

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-005

Files created/updated:
- ...

Branch:
phase14/P14-005-payment-provider-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-006

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-006 only.

Task:
Create Billing API Contract Map

Branch:
phase14/P14-006-billing-api-contract-map

Priority:
P0

Description:
Document backend APIs required by student/parent/admin billing flows.

Goal:
Align backend and UI before implementation.

Expected output:
docs/phase-14/billing-api-contract-map.md

Dependencies:
P14-002

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-006

Files created/updated:
- ...

Branch:
phase14/P14-006-billing-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-007

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-007 only.

Task:
Create Billing UI Flow Map

Branch:
phase14/P14-007-billing-ui-flow-map

Priority:
P1

Description:
Document pricing, checkout, subscription, invoice, refund request, and payment status UI flows.

Goal:
Guide UI tasks with design-system consistency.

Expected output:
docs/phase-14/billing-ui-flow-map.md

Dependencies:
P14-006

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-007

Files created/updated:
- ...

Branch:
phase14/P14-007-billing-ui-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-008

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-008 only.

Task:
Create Billing UI Design System Rules

Branch:
phase14/P14-008-billing-design-system-rules

Priority:
P0

Description:
Document how all billing/payment UI must follow the approved AIM design system.

Goal:
Prevent one-off styling in billing UI.

Expected output:
docs/phase-14/billing-design-system-rules.md

Dependencies:
P14-001, DES-001

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-008

Files created/updated:
- ...

Branch:
phase14/P14-008-billing-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-009

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-009 only.

Task:
Create Products Table Migration

Branch:
phase14/P14-009-products-table-migration

Priority:
P0

Description:
Add table for billable products/features.

Goal:
Store product definitions safely.

Expected output:
Migration for billing_products

Dependencies:
P14-002

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-009

Files created/updated:
- ...

Branch:
phase14/P14-009-products-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-010

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-010 only.

Task:
Create Prices Table Migration

Branch:
phase14/P14-010-prices-table-migration

Priority:
P0

Description:
Add table for price records, currency, billing interval, provider price ID, and status.

Goal:
Store backend-approved pricing.

Expected output:
Migration for billing_prices

Dependencies:
P14-009

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-010

Files created/updated:
- ...

Branch:
phase14/P14-010-prices-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-011

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-011 only.

Task:
Create Plans Table Migration

Branch:
phase14/P14-011-plans-table-migration

Priority:
P0

Description:
Add table for subscription plans, included features, limits, and status.

Goal:
Define plans controlled by backend/admin.

Expected output:
Migration for billing_plans

Dependencies:
P14-009, P14-010

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-011

Files created/updated:
- ...

Branch:
phase14/P14-011-plans-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-012

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-012 only.

Task:
Create Entitlements Table Migration

Branch:
phase14/P14-012-entitlements-table-migration

Priority:
P0

Description:
Add table for user/student/parent feature access entitlements.

Goal:
Store backend-approved access rights.

Expected output:
Migration for billing_entitlements

Dependencies:
P14-011

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-012

Files created/updated:
- ...

Branch:
phase14/P14-012-entitlements-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-013

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-013 only.

Task:
Create Subscriptions Table Migration

Branch:
phase14/P14-013-subscriptions-table-migration

Priority:
P0

Description:
Add table for subscription lifecycle and provider subscription metadata.

Goal:
Track subscription state safely.

Expected output:
Migration for subscriptions

Dependencies:
P14-011

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-013

Files created/updated:
- ...

Branch:
phase14/P14-013-subscriptions-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-014

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-014 only.

Task:
Create Checkout Sessions Table Migration

Branch:
phase14/P14-014-checkout-sessions-table-migration

Priority:
P0

Description:
Add table for checkout sessions, provider session IDs, status, and expiry.

Goal:
Track checkout flow safely.

Expected output:
Migration for checkout_sessions

Dependencies:
P14-010, P14-013

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-014

Files created/updated:
- ...

Branch:
phase14/P14-014-checkout-sessions-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-015

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-015 only.

Task:
Create Payments Table Migration

Branch:
phase14/P14-015-payments-table-migration

Priority:
P0

Description:
Add table for payment records, amount, currency, status, provider payment ID, and safe metadata.

Goal:
Track payments without storing raw card data.

Expected output:
Migration for payments

Dependencies:
P14-014

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-015

Files created/updated:
- ...

Branch:
phase14/P14-015-payments-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-016

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-016 only.

Task:
Create Invoices Table Migration

Branch:
phase14/P14-016-invoices-table-migration

Priority:
P0

Description:
Add table for invoices, invoice items, totals, status, and provider invoice IDs.

Goal:
Track invoices safely.

Expected output:
Migration for invoices and invoice_items

Dependencies:
P14-013, P14-015

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-016

Files created/updated:
- ...

Branch:
phase14/P14-016-invoices-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-017

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-017 only.

Task:
Create Refunds Table Migration

Branch:
phase14/P14-017-refunds-table-migration

Priority:
P1

Description:
Add table for refunds, reasons, status, amount, provider refund ID, and audit metadata.

Goal:
Track refunds safely.

Expected output:
Migration for refunds

Dependencies:
P14-015

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-017

Files created/updated:
- ...

Branch:
phase14/P14-017-refunds-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-018

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-018 only.

Task:
Create Coupons and Promotions Table Migration

Branch:
phase14/P14-018-coupons-promotions-table-migration

Priority:
P1

Description:
Add tables for coupons, promotion codes, eligibility, status, and limits.

Goal:
Support controlled discounts.

Expected output:
Migration for coupons and promotion_codes

Dependencies:
P14-010

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-018

Files created/updated:
- ...

Branch:
phase14/P14-018-coupons-promotions-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-019

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-019 only.

Task:
Create Provider Events Table Migration

Branch:
phase14/P14-019-provider-events-table-migration

Priority:
P0

Description:
Add table for webhook/provider event IDs, event type, processing status, and idempotency keys.

Goal:
Support safe webhook processing.

Expected output:
Migration for payment_provider_events

Dependencies:
P14-015, P14-013

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-019

Files created/updated:
- ...

Branch:
phase14/P14-019-provider-events-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-020

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-020 only.

Task:
Create Billing Audit Table Migration

Branch:
phase14/P14-020-billing-audit-table-migration

Priority:
P1

Description:
Add audit table for billing actions, provider events, entitlement changes, and refunds.

Goal:
Provide billing traceability.

Expected output:
Migration for billing_audit_logs

Dependencies:
P14-012, P14-019

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-020

Files created/updated:
- ...

Branch:
phase14/P14-020-billing-audit-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-021

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-021 only.

Task:
Add Billing DB Constraints

Branch:
phase14/P14-021-billing-db-constraints

Priority:
P0

Description:
Add foreign keys, uniqueness, statuses, currency checks, idempotency constraints, and indexes.

Goal:
Prevent invalid billing/payment state.

Expected output:
Updated billing constraints migration

Dependencies:
P14-009..P14-020

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-021

Files created/updated:
- ...

Branch:
phase14/P14-021-billing-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-022

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-022 only.

Task:
Add Billing Seed Fixtures

Branch:
phase14/P14-022-billing-seed-fixtures

Priority:
P2

Description:
Add safe development fixtures for products, prices, and plans.

Goal:
Support local billing development/testing.

Expected output:
Billing seed data/fixtures

Dependencies:
P14-021

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-022

Files created/updated:
- ...

Branch:
phase14/P14-022-billing-seed-fixtures

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-023

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-023 only.

Task:
Create Billing Backend Module

Branch:
phase14/P14-023-billing-backend-module

Priority:
P0

Description:
Add backend feature module for payments and billing.

Goal:
Establish backend billing feature boundary.

Expected output:
services/backend-api/src/features/billing/

Dependencies:
P14-021

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-023

Files created/updated:
- ...

Branch:
phase14/P14-023-billing-backend-module

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-024

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-024 only.

Task:
Create Billing DTOs and Entities

Branch:
phase14/P14-024-billing-dtos-entities

Priority:
P0

Description:
Define DTOs/entities for products, prices, plans, checkout sessions, payments, invoices, refunds, coupons, entitlements, and provider events.

Goal:
Standardize billing contracts.

Expected output:
Billing DTO/entity files

Dependencies:
P14-023

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-024

Files created/updated:
- ...

Branch:
phase14/P14-024-billing-dtos-entities

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-025

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-025 only.

Task:
Add Billing Validation Rules

Branch:
phase14/P14-025-billing-validation-rules

Priority:
P0

Description:
Validate currency, amount, price IDs, plan IDs, subscription status, provider IDs, and refund requests.

Goal:
Reject invalid billing inputs.

Expected output:
Billing validation helpers/pipes/tests

Dependencies:
P14-024

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-025

Files created/updated:
- ...

Branch:
phase14/P14-025-billing-validation-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-026

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-026 only.

Task:
Create Billing Repository Layer

Branch:
phase14/P14-026-billing-repository

Priority:
P0

Description:
Add data access methods for billing products, prices, subscriptions, payments, invoices, refunds, coupons, entitlements, and provider events.

Goal:
Encapsulate billing persistence.

Expected output:
Billing repository implementation

Dependencies:
P14-024

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-026

Files created/updated:
- ...

Branch:
phase14/P14-026-billing-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-027

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-027 only.

Task:
Create Product and Price Service

Branch:
phase14/P14-027-product-price-service

Priority:
P0

Description:
Add service for reading active products/prices/plans and admin-safe management if supported.

Goal:
Centralize product/price authority.

Expected output:
Product/price service

Dependencies:
P14-026

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-027

Files created/updated:
- ...

Branch:
phase14/P14-027-product-price-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-028

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-028 only.

Task:
Create Entitlement Service

Branch:
phase14/P14-028-entitlement-service

Priority:
P0

Description:
Add service for deriving, granting, revoking, and reading backend-approved entitlements.

Goal:
Centralize feature access authority.

Expected output:
Entitlement service

Dependencies:
P14-012, P14-026

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-028

Files created/updated:
- ...

Branch:
phase14/P14-028-entitlement-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-029

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-029 only.

Task:
Create Subscription Service

Branch:
phase14/P14-029-subscription-service

Priority:
P0

Description:
Add service for subscription lifecycle and provider state sync.

Goal:
Centralize subscription authority.

Expected output:
Subscription service

Dependencies:
P14-013, P14-026, P14-028

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-029

Files created/updated:
- ...

Branch:
phase14/P14-029-subscription-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-030

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-030 only.

Task:
Create Checkout Service

Branch:
phase14/P14-030-checkout-service

Priority:
P0

Description:
Add backend checkout session creation and status handling through provider abstraction.

Goal:
Control checkout from backend.

Expected output:
Checkout service

Dependencies:
P14-014, P14-027, P14-029

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-030

Files created/updated:
- ...

Branch:
phase14/P14-030-checkout-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-031

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-031 only.

Task:
Create Payment Service

Branch:
phase14/P14-031-payment-service

Priority:
P0

Description:
Add service for payment record handling, status sync, and safe metadata.

Goal:
Track payments safely.

Expected output:
Payment service

Dependencies:
P14-015, P14-026

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-031

Files created/updated:
- ...

Branch:
phase14/P14-031-payment-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-032

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-032 only.

Task:
Create Invoice Service

Branch:
phase14/P14-032-invoice-service

Priority:
P0

Description:
Add service for invoice retrieval/status handling.

Goal:
Support invoice display and admin inspection.

Expected output:
Invoice service

Dependencies:
P14-016, P14-026

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-032

Files created/updated:
- ...

Branch:
phase14/P14-032-invoice-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-033

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-033 only.

Task:
Create Refund Service

Branch:
phase14/P14-033-refund-service

Priority:
P1

Description:
Add service for controlled refund request/processing status through provider abstraction.

Goal:
Support safe refunds.

Expected output:
Refund service

Dependencies:
P14-017, P14-031

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-033

Files created/updated:
- ...

Branch:
phase14/P14-033-refund-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-034

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-034 only.

Task:
Create Coupon and Promotion Service

Branch:
phase14/P14-034-coupon-service

Priority:
P1

Description:
Add service for coupon validation, eligibility, and promotion application.

Goal:
Support controlled discounts.

Expected output:
Coupon/promotion service

Dependencies:
P14-018, P14-027

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-034

Files created/updated:
- ...

Branch:
phase14/P14-034-coupon-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-035

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-035 only.

Task:
Create Payment Provider Adapter Interface

Branch:
phase14/P14-035-provider-adapter-interface

Priority:
P0

Description:
Add provider abstraction for checkout, payment, subscription, invoice, refund, and webhook event parsing.

Goal:
Avoid provider lock-in and secret leakage.

Expected output:
Payment provider adapter interface

Dependencies:
P14-005, P14-030

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-035

Files created/updated:
- ...

Branch:
phase14/P14-035-provider-adapter-interface

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-036

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-036 only.

Task:
Create Provider Webhook Service

Branch:
phase14/P14-036-provider-webhook-service

Priority:
P0

Description:
Add webhook event verification, idempotent processing, and safe provider event storage.

Goal:
Process provider events reliably.

Expected output:
Provider webhook service

Dependencies:
P14-019, P14-035

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-036

Files created/updated:
- ...

Branch:
phase14/P14-036-provider-webhook-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-037

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-037 only.

Task:
Create Billing Audit Service

Branch:
phase14/P14-037-billing-audit-service

Priority:
P1

Description:
Log safe billing metadata for checkout, payment, refund, subscription, and entitlement events.

Goal:
Provide billing traceability without secrets.

Expected output:
Billing audit service

Dependencies:
P14-020, P14-026

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-037

Files created/updated:
- ...

Branch:
phase14/P14-037-billing-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-038

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-038 only.

Task:
Add Billing Permission Guards

Branch:
phase14/P14-038-billing-permission-guards

Priority:
P0

Description:
Protect student/parent/admin billing endpoints with ownership, role, and permission checks.

Goal:
Prevent unauthorized billing access.

Expected output:
Billing guards/policies/tests

Dependencies:
P14-023

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-038

Files created/updated:
- ...

Branch:
phase14/P14-038-billing-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-039

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-039 only.

Task:
Create Billing Idempotency Service

Branch:
phase14/P14-039-billing-idempotency-service

Priority:
P0

Description:
Add idempotency handling for checkout, webhook, payment, subscription, and refund events.

Goal:
Prevent duplicate billing actions.

Expected output:
Billing idempotency service

Dependencies:
P14-019, P14-036

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-039

Files created/updated:
- ...

Branch:
phase14/P14-039-billing-idempotency-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-040

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-040 only.

Task:
Add Billing Error Handling

Branch:
phase14/P14-040-billing-error-handling

Priority:
P1

Description:
Standardize errors for invalid plan, unauthorized billing access, provider failure, duplicate event, payment failed, and refund invalid.

Goal:
Improve billing reliability.

Expected output:
Billing error handling + tests

Dependencies:
P14-030..P14-039

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-040

Files created/updated:
- ...

Branch:
phase14/P14-040-billing-error-handling

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-041

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-041 only.

Task:
Create Public Pricing API

Branch:
phase14/P14-041-public-pricing-api

Priority:
P0

Description:
Add safe endpoint for active products/plans/prices visible to clients.

Goal:
Feed pricing UI without exposing internal data.

Expected output:
Pricing endpoint

Dependencies:
P14-027, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-041

Files created/updated:
- ...

Branch:
phase14/P14-041-public-pricing-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-042

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-042 only.

Task:
Create Checkout Session API

Branch:
phase14/P14-042-create-checkout-session-api

Priority:
P0

Description:
Add authenticated endpoint to create checkout sessions for selected plans/prices.

Goal:
Enable controlled checkout.

Expected output:
Checkout session endpoint

Dependencies:
P14-030, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-042

Files created/updated:
- ...

Branch:
phase14/P14-042-create-checkout-session-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-043

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-043 only.

Task:
Create Checkout Status API

Branch:
phase14/P14-043-checkout-status-api

Priority:
P0

Description:
Add endpoint to read checkout/payment status for current user.

Goal:
Allow clients to show payment result safely.

Expected output:
Checkout status endpoint

Dependencies:
P14-030, P14-031, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-043

Files created/updated:
- ...

Branch:
phase14/P14-043-checkout-status-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-044

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-044 only.

Task:
Create User Subscription API

Branch:
phase14/P14-044-user-subscription-api

Priority:
P0

Description:
Add endpoint to read current subscription and entitlements for current user.

Goal:
Feed billing/account UI.

Expected output:
Subscription endpoint

Dependencies:
P14-028, P14-029, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-044

Files created/updated:
- ...

Branch:
phase14/P14-044-user-subscription-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-045

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-045 only.

Task:
Create User Invoices API

Branch:
phase14/P14-045-user-invoices-api

Priority:
P1

Description:
Add endpoint to list/read current user's invoices.

Goal:
Feed invoice history UI.

Expected output:
User invoices endpoint

Dependencies:
P14-032, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-045

Files created/updated:
- ...

Branch:
phase14/P14-045-user-invoices-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-046

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-046 only.

Task:
Create Refund Request API

Branch:
phase14/P14-046-refund-request-api

Priority:
P1

Description:
Add endpoint for allowed refund requests if policy permits.

Goal:
Support controlled refund flow.

Expected output:
Refund request endpoint

Dependencies:
P14-033, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-046

Files created/updated:
- ...

Branch:
phase14/P14-046-refund-request-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-047

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-047 only.

Task:
Create Provider Webhook Endpoint

Branch:
phase14/P14-047-provider-webhook-endpoint

Priority:
P0

Description:
Add protected provider webhook endpoint with signature verification and idempotency.

Goal:
Sync provider events safely.

Expected output:
Webhook endpoint

Dependencies:
P14-036, P14-039

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-047

Files created/updated:
- ...

Branch:
phase14/P14-047-provider-webhook-endpoint

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-048

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-048 only.

Task:
Create Admin Billing Read-Only API

Branch:
phase14/P14-048-admin-billing-readonly-api

Priority:
P1

Description:
Add admin read-only endpoints for subscriptions, payments, invoices, refunds, and provider events.

Goal:
Support admin billing inspection.

Expected output:
Admin billing read-only endpoints

Dependencies:
P14-032, P14-033, P14-036, P14-038

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-048

Files created/updated:
- ...

Branch:
phase14/P14-048-admin-billing-readonly-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-049

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-049 only.

Task:
Document Billing API Contracts

Branch:
phase14/P14-049-billing-api-contract-docs

Priority:
P0

Description:
Document pricing, checkout, subscription, invoice, refund, webhook, and admin billing endpoints.

Goal:
Align backend and UI.

Expected output:
docs/phase-14/billing-api-contracts.md

Dependencies:
P14-041..P14-048

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-049

Files created/updated:
- ...

Branch:
phase14/P14-049-billing-api-contract-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-050

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-050 only.

Task:
Add Billing Permission Tests

Branch:
phase14/P14-050-billing-permission-tests

Priority:
P0

Description:
Test users cannot access others' subscriptions, invoices, payments, checkout sessions, or refunds.

Goal:
Verify billing access control.

Expected output:
Backend permission tests

Dependencies:
P14-038, P14-041..P14-048

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-050

Files created/updated:
- ...

Branch:
phase14/P14-050-billing-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-051

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-051 only.

Task:
Add Checkout Flow Tests

Branch:
phase14/P14-051-checkout-flow-tests

Priority:
P0

Description:
Test pricing read, checkout creation, checkout status, failed payment, and completed payment states.

Goal:
Verify checkout reliability.

Expected output:
Backend checkout tests

Dependencies:
P14-030, P14-041..P14-043

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-051

Files created/updated:
- ...

Branch:
phase14/P14-051-checkout-flow-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-052

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-052 only.

Task:
Add Webhook Idempotency Tests

Branch:
phase14/P14-052-webhook-idempotency-tests

Priority:
P0

Description:
Test duplicate provider events, invalid signatures, event ordering, and safe state updates.

Goal:
Verify provider event safety.

Expected output:
Backend webhook/idempotency tests

Dependencies:
P14-036, P14-039, P14-047

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-052

Files created/updated:
- ...

Branch:
phase14/P14-052-webhook-idempotency-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-053

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-053 only.

Task:
Add Entitlement Tests

Branch:
phase14/P14-053-entitlement-tests

Priority:
P0

Description:
Test entitlements are granted/revoked from backend-approved subscription states only.

Goal:
Verify access authority.

Expected output:
Backend entitlement tests

Dependencies:
P14-028, P14-029, P14-044

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-053

Files created/updated:
- ...

Branch:
phase14/P14-053-entitlement-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-054

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-054 only.

Task:
Add Refund Tests

Branch:
phase14/P14-054-refund-tests

Priority:
P1

Description:
Test refund request eligibility, invalid refunds, provider failures, and status sync.

Goal:
Verify refund safety.

Expected output:
Backend refund tests

Dependencies:
P14-033, P14-046

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-054

Files created/updated:
- ...

Branch:
phase14/P14-054-refund-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-055

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-055 only.

Task:
Add Sensitive Payment Data Tests

Branch:
phase14/P14-055-sensitive-data-tests

Priority:
P0

Description:
Ensure raw card data, provider secrets, and sensitive provider payloads are not stored or logged.

Goal:
Protect payment data.

Expected output:
Backend sensitive-data tests

Dependencies:
P14-004, P14-035..P14-047

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns products, prices, subscriptions, checkout sessions, payments, invoices, refunds, entitlements, webhooks, and idempotency.
- Protect every billing endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted prices, scores, entitlement state, provider metadata, payment status, invoice status, or webhook events.
- Validate DTOs and return safe errors.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-055

Files created/updated:
- ...

Branch:
phase14/P14-055-sensitive-data-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-056

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-056 only.

Task:
Create Student Billing Feature Shell

Branch:
phase14/P14-056-student-billing-feature-shell

Priority:
P1

Description:
Create mobile billing feature folders/models/providers using feature-first architecture.

Goal:
Establish student billing UI boundary.

Expected output:
apps/mobile/lib/features/billing/

Dependencies:
P14-049, P6-050

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-056

Files created/updated:
- ...

Branch:
phase14/P14-056-student-billing-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-057

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-057 only.

Task:
Create Student Pricing UI

Branch:
phase14/P14-057-student-pricing-ui

Priority:
P1

Description:
Build pricing/plans screen using AIM design system and backend pricing API.

Goal:
Allow student to view plans safely.

Expected output:
Student pricing UI

Dependencies:
P14-041, P14-056

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-057

Files created/updated:
- ...

Branch:
phase14/P14-057-student-pricing-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-058

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-058 only.

Task:
Create Student Checkout Start UI

Branch:
phase14/P14-058-student-checkout-start-ui

Priority:
P1

Description:
Build checkout start flow that calls backend checkout API and redirects/opens provider flow safely.

Goal:
Enable controlled checkout start.

Expected output:
Student checkout start UI

Dependencies:
P14-042, P14-057

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-058

Files created/updated:
- ...

Branch:
phase14/P14-058-student-checkout-start-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-059

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-059 only.

Task:
Create Student Checkout Status UI

Branch:
phase14/P14-059-student-checkout-status-ui

Priority:
P1

Description:
Build success/failure/pending checkout status screen using backend status API.

Goal:
Show payment result safely.

Expected output:
Student checkout status UI

Dependencies:
P14-043, P14-058

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-059

Files created/updated:
- ...

Branch:
phase14/P14-059-student-checkout-status-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-060

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-060 only.

Task:
Create Student Subscription UI

Branch:
phase14/P14-060-student-subscription-ui

Priority:
P1

Description:
Build current subscription/entitlement screen using backend-approved data.

Goal:
Allow student to inspect subscription state.

Expected output:
Student subscription UI

Dependencies:
P14-044, P14-056

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-060

Files created/updated:
- ...

Branch:
phase14/P14-060-student-subscription-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-061

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-061 only.

Task:
Create Student Invoice History UI

Branch:
phase14/P14-061-student-invoice-history-ui

Priority:
P2

Description:
Build invoice list/detail UI using AIM design system.

Goal:
Allow student to inspect invoices safely.

Expected output:
Student invoice history UI

Dependencies:
P14-045, P14-056

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-061

Files created/updated:
- ...

Branch:
phase14/P14-061-student-invoice-history-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-062

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-062 only.

Task:
Add Student Billing UI Tests

Branch:
phase14/P14-062-student-billing-tests

Priority:
P2

Description:
Test pricing, checkout start/status, subscription display, and invoice states.

Goal:
Verify mobile billing UI behavior.

Expected output:
Flutter billing tests

Dependencies:
P14-057..P14-061

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-062

Files created/updated:
- ...

Branch:
phase14/P14-062-student-billing-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-063

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-063 only.

Task:
Create Parent Billing UI Shell

Branch:
phase14/P14-063-parent-billing-ui-shell

Priority:
P1

Description:
Create parent billing UI integration using Phase 12 parent dashboard conventions.

Goal:
Establish parent billing UI boundary.

Expected output:
Parent billing shell UI

Dependencies:
P12-077, P14-049

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-063

Files created/updated:
- ...

Branch:
phase14/P14-063-parent-billing-ui-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-064

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-064 only.

Task:
Create Parent Pricing and Subscription UI

Branch:
phase14/P14-064-parent-pricing-subscription-ui

Priority:
P1

Description:
Build parent pricing/subscription screen using AIM design system.

Goal:
Allow parent to inspect/choose plans safely.

Expected output:
Parent pricing/subscription UI

Dependencies:
P14-041, P14-044, P14-063

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-064

Files created/updated:
- ...

Branch:
phase14/P14-064-parent-pricing-subscription-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-065

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-065 only.

Task:
Create Parent Checkout UI

Branch:
phase14/P14-065-parent-checkout-ui

Priority:
P1

Description:
Build parent checkout start/status flow through backend APIs.

Goal:
Enable controlled parent checkout.

Expected output:
Parent checkout UI

Dependencies:
P14-042, P14-043, P14-064

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-065

Files created/updated:
- ...

Branch:
phase14/P14-065-parent-checkout-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-066

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-066 only.

Task:
Create Parent Invoice History UI

Branch:
phase14/P14-066-parent-invoice-history-ui

Priority:
P2

Description:
Build parent invoice history page using backend APIs and AIM design system.

Goal:
Allow parent to inspect invoices safely.

Expected output:
Parent invoice UI

Dependencies:
P14-045, P14-063

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-066

Files created/updated:
- ...

Branch:
phase14/P14-066-parent-invoice-history-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-067

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-067 only.

Task:
Add Parent Billing UI Tests

Branch:
phase14/P14-067-parent-billing-tests

Priority:
P2

Description:
Test parent pricing, checkout, subscription, invoice, and permission states.

Goal:
Verify parent billing UI behavior.

Expected output:
Parent billing UI tests

Dependencies:
P14-064..P14-066

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-067

Files created/updated:
- ...

Branch:
phase14/P14-067-parent-billing-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-068

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-068 only.

Task:
Create Admin Billing Monitor UI

Branch:
phase14/P14-068-admin-billing-monitor-ui

Priority:
P1

Description:
Build admin read-only billing monitor using AIM design system.

Goal:
Allow operations/admin inspection of billing state.

Expected output:
Admin billing monitor UI

Dependencies:
P14-048, P11-077

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-068

Files created/updated:
- ...

Branch:
phase14/P14-068-admin-billing-monitor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-069

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-069 only.

Task:
Create Admin Subscriptions UI

Branch:
phase14/P14-069-admin-subscriptions-ui

Priority:
P1

Description:
Build admin subscriptions list/detail read-only UI with filters and status badges.

Goal:
Inspect subscriptions safely.

Expected output:
Admin subscriptions UI

Dependencies:
P14-048, P14-068

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-069

Files created/updated:
- ...

Branch:
phase14/P14-069-admin-subscriptions-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-070

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-070 only.

Task:
Create Admin Payments and Invoices UI

Branch:
phase14/P14-070-admin-payments-invoices-ui

Priority:
P1

Description:
Build read-only admin payments/invoices UI.

Goal:
Inspect payment and invoice state safely.

Expected output:
Admin payments/invoices UI

Dependencies:
P14-048, P14-068

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-070

Files created/updated:
- ...

Branch:
phase14/P14-070-admin-payments-invoices-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-071

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-071 only.

Task:
Create Admin Refunds UI

Branch:
phase14/P14-071-admin-refunds-ui

Priority:
P2

Description:
Build refund inspection/allowed action UI if policy permits, otherwise read-only.

Goal:
Support controlled refund operations.

Expected output:
Admin refunds UI

Dependencies:
P14-033, P14-048, P14-068

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-071

Files created/updated:
- ...

Branch:
phase14/P14-071-admin-refunds-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-072

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-072 only.

Task:
Create Admin Provider Events UI

Branch:
phase14/P14-072-admin-provider-events-ui

Priority:
P2

Description:
Build read-only provider event/audit view with safe metadata only.

Goal:
Inspect webhook/event processing safely.

Expected output:
Admin provider events UI

Dependencies:
P14-048, P14-068

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-072

Files created/updated:
- ...

Branch:
phase14/P14-072-admin-provider-events-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-073

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-073 only.

Task:
Add Admin Billing UI Tests

Branch:
phase14/P14-073-admin-billing-tests

Priority:
P2

Description:
Test admin billing monitor/subscriptions/payments/invoices/refunds/provider events views.

Goal:
Verify admin billing UI safety.

Expected output:
Admin billing UI tests

Dependencies:
P14-068..P14-072

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-073

Files created/updated:
- ...

Branch:
phase14/P14-073-admin-billing-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-074

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-074 only.

Task:
Create Billing Design System Review

Branch:
phase14/P14-074-billing-design-system-review

Priority:
P0

Description:
Verify all billing/payment UI uses AIM design system tokens/components and no one-off styling.

Goal:
Approve or block billing UI consistency.

Expected output:
docs/quality/phase-14-billing-design-system-review.md

Dependencies:
P14-062, P14-067, P14-073

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-074

Files created/updated:
- ...

Branch:
phase14/P14-074-billing-design-system-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-075

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-075 only.

Task:
Create Billing Security Review

Branch:
phase14/P14-075-billing-security-review

Priority:
P0

Description:
Review provider secrets, webhook verification, permissions, idempotency, sensitive data, logs, and client exposure.

Goal:
Validate billing security readiness.

Expected output:
docs/quality/phase-14-billing-security-review.md

Dependencies:
P14-050..P14-055

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-075

Files created/updated:
- ...

Branch:
phase14/P14-075-billing-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-076

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-076 only.

Task:
Create Billing Compliance Review

Branch:
phase14/P14-076-billing-compliance-review

Priority:
P0

Description:
Review no raw card storage, provider redirection, invoice/refund handling, and sensitive logging rules.

Goal:
Validate payment compliance boundaries.

Expected output:
docs/quality/phase-14-billing-compliance-review.md

Dependencies:
P14-004, P14-055, P14-075

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-076

Files created/updated:
- ...

Branch:
phase14/P14-076-billing-compliance-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-077

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-077 only.

Task:
Create Billing Architecture Review

Branch:
phase14/P14-077-billing-architecture-review

Priority:
P0

Description:
Review backend/API/UI/provider architecture, feature boundaries, and maintainability.

Goal:
Validate billing architecture readiness.

Expected output:
docs/quality/phase-14-billing-architecture-review.md

Dependencies:
P14-074, P14-075, P14-076

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-077

Files created/updated:
- ...

Branch:
phase14/P14-077-billing-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-078

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-078 only.

Task:
Create Billing Checkout E2E Check

Branch:
phase14/P14-078-billing-e2e-checkout

Priority:
P1

Description:
Document or implement E2E check for pricing → checkout → provider event → entitlement flow.

Goal:
Validate checkout lifecycle.

Expected output:
docs/quality/phase-14-billing-checkout-e2e-check.md

Dependencies:
P14-051, P14-052, P14-053

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-078:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-078

Files created/updated:
- ...

Branch:
phase14/P14-078-billing-e2e-checkout

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-079

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-079 only.

Task:
Create Billing UI E2E Check

Branch:
phase14/P14-079-billing-e2e-ui

Priority:
P1

Description:
Document or implement E2E check for student/parent/admin billing UI flows.

Goal:
Validate billing UI flows.

Expected output:
docs/quality/phase-14-billing-ui-e2e-check.md

Dependencies:
P14-062, P14-067, P14-073

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-079:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared billing/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-079

Files created/updated:
- ...

Branch:
phase14/P14-079-billing-e2e-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-080

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-080 only.

Task:
Create Phase 14 Output Completeness Review

Branch:
phase14/P14-080-output-completeness-review

Priority:
P0

Description:
Verify every Phase 14 expected output exists and meets scope/design/security/compliance rules.

Goal:
Approve or block Phase 14 completion.

Expected output:
docs/quality/phase-14-output-completeness-review.md

Dependencies:
P14-074..P14-079

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-080:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-080

Files created/updated:
- ...

Branch:
phase14/P14-080-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-081

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-081 only.

Task:
Create Phase 15 Readiness Checklist

Branch:
phase14/P14-081-phase-15-readiness-checklist

Priority:
P1

Description:
Document analytics/reporting readiness from billing and subscription outputs.

Goal:
Prepare Phase 15 safely.

Expected output:
docs/phase-15/readiness-from-phase-14.md

Dependencies:
P14-080

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-081:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-081

Files created/updated:
- ...

Branch:
phase14/P14-081-phase-15-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P14-082

You are an AI coding/documentation agent working on AIM Platform Phase 14 — Payments and Billing.

Work on task P14-082 only.

Task:
Create Phase 14 Final Review and Handoff

Branch:
phase14/P14-082-phase-14-final-review

Priority:
P0

Description:
Summarize implementation, outputs, security/compliance risks, checks, limitations, and next steps.

Goal:
Close Phase 14.

Expected output:
docs/phase-14/final-review.md

Dependencies:
P14-081

Required workflow:
1. Open the Phase 14 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P14-082:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority, Security, and Compliance Rules:
- Client/UI must not calculate final price authority, payment status, subscription status, invoice status, refund status, or entitlement state.
- Backend and provider events remain final authority for payment lifecycle.
- Do not store raw card data.
- Do not commit or expose provider secrets, webhook secrets, service-role keys, database credentials, or production tokens.
- Do not log sensitive provider payloads or payment credentials.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 15 analytics except readiness documentation when this task explicitly asks.
- Do not commit secrets, payment provider keys, webhook secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Payment lifecycle authority remains backend/provider-controlled.
- Entitlement authority remains backend-controlled.
- Sensitive payment data rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P14-082

Files created/updated:
- ...

Branch:
phase14/P14-082-phase-14-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Billing validation:
- Backend/provider payment authority preserved: yes/no/not applicable
- Backend entitlement authority preserved: yes/no/not applicable
- Webhook/idempotency rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No raw card data stored: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...
