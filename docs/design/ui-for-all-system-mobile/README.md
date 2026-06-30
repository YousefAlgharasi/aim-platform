# AIM Mobile — Gen Z Redesign

A complete, self-contained package of the AIM English-learning app redesign in a Gen Z visual style: gradient heroes, glassy headers, rounded "blob" cards, pill buttons, a floating side drawer, and full light/dark + English/Arabic (RTL) support.

This bundle contains **everything**: the runnable app, the editable source, and the full design system (color, type, spacing, radius, shadow tokens + every component).

---

## 🚀 How to run it

**Just open `Run App (standalone).html`** by double-clicking it. It works completely offline — no server, no install, no internet. Everything (fonts, scripts, the design system, the phone frame) is inlined into that one file.

Inside the app:
- Use the **screen picker** (top-right dropdown) to jump to any of the 59 screens.
- Toggle **EN / عربي** to switch language + direction (RTL).
- Toggle **Light / Dark** for the theme.
- Tap the round **menu button** (bottom-left) to open the side drawer; tap the **bell** for the notifications sheet.

---

## 📁 Folder structure

```
AIM Gen Z - Full Project/
├── README.md                     ← you are here
├── SCREENS.md                    ← every screen, what it is, and its design notes
├── Run App (standalone).html     ← ⭐ double-click to run the whole app offline
│
├── design/                       ← the editable source files
│   ├── AIM Mobile - Gen Z.dc.html   ← the full app: all 59 screens + logic
│   ├── AIM Home - Gen Z.dc.html     ← the standalone Home screen exploration
│   ├── android-frame.jsx            ← the phone bezel / device frame
│   └── support.js                   ← the runtime that powers the .dc.html files
│
└── design-system/                ← the AIM Design System (tokens + components)
    ├── readme.md                    ← the design system's own guide
    ├── styles.css                   ← compiled component styles
    ├── ds-bundle.js                 ← all components as a loadable JS bundle
    ├── tokens/                      ← ⭐ the raw design values
    │   ├── colors.css                  colors + semantic aliases + dark mode
    │   ├── typography.css              type scale + role shorthands
    │   ├── spacing.css                 8-point spacing scale
    │   ├── radius.css                  corner radius scale
    │   ├── shadows.css                 elevation / shadow scale
    │   ├── sizes.css                   icon sizes, touch targets, etc.
    │   └── fonts.css                   font-face / font links
    └── components/                  ← every component (source + types + usage)
        ├── buttons/    Button, IconButton, Fab
        ├── forms/      Input, Textarea, Select, Checkbox, Radio, Switch, OTPInput
        ├── feedback/   Badge, Chip, AlertBanner, Skeleton
        ├── navigation/ Tabs, SegmentedControl, TopAppBar, BottomNav
        └── learning/   Card, ProgressBar, CircularProgress, AnswerOption,
                        AIFeedbackBubble, RecordButton
```

Each component folder contains three files per component:
- `Name.jsx` — the React source
- `Name.d.ts` — the full prop contract (TypeScript types)
- `Name.prompt.md` — copy-paste usage examples

---

## 🎨 Where the design values live

Everything visual is driven by **CSS custom properties (tokens)** in `design-system/tokens/`. The screens never hardcode raw colors — they reference tokens like `var(--surface)`, `var(--text-primary)`, `var(--primary-soft)`, `var(--radius-2xl)`, `var(--shadow-card)`. That's why dark mode and RTL "just work."

On top of the design system, the Gen Z layer adds a small set of gradient/accent variables defined inline on each screen container:

| Variable | Value |
| --- | --- |
| `--gz-hero` | `linear-gradient(142deg, #8B5CF6, #6C63FF, #5AC8FA)` — the signature purple→blue hero |
| `--gz-fire` | `linear-gradient(135deg, #FFB14E, #FF6B8A)` — streak / energy |
| `--gz-limeg` | `linear-gradient(135deg, #C8FF3D, #74E08A)` — growth / mastery |
| `--gz-coralg` | `linear-gradient(135deg, #FF6B8A, #FF9F45)` — alerts / focus |
| `--gz-purple` | `#6C63FF` · `--gz-lime` `#C8FF3D` · `--gz-coral` `#FF6B8A` · `--gz-sky` `#5AC8FA` |

See `SCREENS.md` for the full list of screens and the design language applied to each.

---

## ✏️ Editing the source

The app is built as a **Design Component** (`AIM Mobile - Gen Z.dc.html`). It's a single HTML file with three parts:
1. a **template** (the markup, with `{{ value }}` holes),
2. a **logic class** (`class Component extends DCLogic` — the router, the data, the 59 screens' state),
3. **props metadata**.

To preview/edit it you need the original design tool that produced it. The compiled **`Run App (standalone).html`** is the version that runs anywhere on its own — use that one just to view the result.

> Note: this HTML is a **design reference / prototype** — the intended look and behavior. To ship it in a real product, recreate these screens in your target codebase (React, SwiftUI, native, …) using the tokens and components in `design-system/`.
