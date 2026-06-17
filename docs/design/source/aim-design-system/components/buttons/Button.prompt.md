Tappable action button for AIM — use for any primary or secondary action; pick the variant by emphasis (primary for the main CTA, outline/ghost for secondary, destructive for irreversible actions).

```jsx
<Button variant="primary" size="lg" fullWidth>ابدأ الدرس</Button>
<Button variant="outline" leftIcon={<PlayIcon/>}>Continue</Button>
<Button variant="ghost" size="sm">Skip</Button>
<Button variant="destructive" loading>Deleting…</Button>
```

Variants: `primary` (blue), `secondary` (purple), `outline`, `ghost`, `destructive` (red).
Sizes: `sm` 36px · `md` 44px · `lg` 52px. Use `fullWidth` for mobile bottom CTAs.
States: `loading` (spinner, auto-disabled), `disabled`. Works in RTL automatically — icons sit on the leading/trailing edge.
