# Frontend Design Specification

## Design intent

MigrateOS should feel like a calm, high-trust modernization command center: dark and technically precise, with motion that conveys system state rather than decoration. Its identity is original—**MigrateOS Signal Grid**—and does not reuse Covenant branding, marks, layouts, or assets.

The design uses layered translucent surfaces, restrained cyan/violet signal accents, warm amber for attention, and red only for confirmed failure. Dense information remains legible through hierarchy and progressive disclosure.

## Information architecture

| Route | Primary question answered | Key modules |
| --- | --- | --- |
| `/` | Why and how does MigrateOS reduce upgrade risk? | Hero, modernization flow, proof points, demo CTA |
| `/dashboard` | What needs attention across my repositories? | Job overview, risk radar, recent activity, progress timeline |
| `/repositories/[id]/analysis` | What did MigrateOS discover and why? | Technology map, dependency findings, evidence drawer, risk factors |
| `/jobs/[id]/plan` | What will change, in what order, and with what risk? | Plan steps, blast radius, approval control, diff scope |
| `/jobs/[id]/execution` | What is happening right now? | Live phase timeline, validation state, patch summary |
| `/jobs/[id]/agents` | Which agent produced this evidence? | Agent lane graph, streaming logs, artifact inspector |
| `/jobs/[id]/report` | Is the migration ready to review? | Executive report, validation evidence, manual work, PR state |
| `/settings` | Which policies and integrations govern this project? | Connections, command policy, retention, notifications |

## Visual system

| Token family | Direction |
| --- | --- |
| Canvas | Near-black blue/charcoal with a very subtle grid and vignette; never a noisy background image. |
| Surfaces | Glass panels with low-opacity fill, 1px cool border, deep shadow, and layered elevation. |
| Accent | Cyan represents active/system flow; violet represents model/agent intelligence; amber represents review needed. |
| Status | Success is mint, warning amber, blocked/failure rose. Status always includes an icon and text label. |
| Typography | Modern neo-grotesk/sans for UI and a readable monospace face for paths, logs, SHAs, and commands. |
| Data | Use a single semantic color mapping across risk, timelines, charts, and badges. Never rely on hue alone. |

## Core components

- `AppShell`: persistent navigation, project switcher, notification center, command/search entry point.
- `GlassPanel`: reusable surface with elevation, padding, and status variants—no one-off card styling.
- `StatusBadge` and `RiskIndicator`: text-first semantic status with severity/uncertainty tooltips.
- `AgentRail`: animated but accessible agent state sequence; reduced-motion mode uses static state transitions.
- `LiveLog`: virtualized, filterable, reconnect-aware SSE view with timestamps, event type, and copyable correlation ID.
- `EvidenceLink`: opens a side drawer with source file, line range, finding explanation, and confidence.
- `PlanStep`: explicit prerequisites, expected changes, risk, validation criteria, and approval state.
- `RepositoryMap`: progressive tree/technology visualization that links visual regions to concrete findings.
- `ValidationSummary`: pass/fail/blocked results with raw-output artifact links and clear next action.

## Interaction design

The dashboard favors immediate orientation: job status and risk are visible before charts. A job moves through a visible timeline from snapshot to report; each step can be opened for evidence. Approval is a deliberate, two-stage control that summarizes scope and consequences; it never looks like a generic primary button. During execution, streaming agent activity is paced with meaningful progress states and a clear reconnect indicator—not fake typing animation.

Framer Motion is limited to route transitions, panel entrance, status changes, agent rail progression, and counter interpolation. Animations respect `prefers-reduced-motion`, never obscure user input, and use short, consistent durations.

## Accessibility and responsiveness

- Meet WCAG 2.2 AA contrast, focus, keyboard, target-size, and semantic-heading expectations.
- Provide text status alongside color, accessible chart tables/summaries, screen-reader live-region announcements for important job transitions, and pause/filter controls for log streaming.
- Desktop emphasizes a three-column inspection workflow; tablet collapses the evidence drawer; mobile converts dense tables to labeled detail cards without hiding risk/approval actions.
- All forms use React Hook Form plus shared Zod schemas, inline error summaries, and server-error mapping.

## Data and state management

React Query owns server state, query keys, cache invalidation, optimistic non-destructive updates, and SSE-driven cache updates. Local UI state stays component/feature-local. API-generated types are the contract source; presentation components do not reimplement backend state machines.
