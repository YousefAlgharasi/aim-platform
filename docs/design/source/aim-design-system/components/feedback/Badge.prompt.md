Status badge / pill for learning states and metadata. Map AIM statuses to tones:

- `success` → Completed / Strong area / Correct
- `primary` → In progress / Recommended
- `warning` → Needs review / Weak area
- `neutral` → Not started / Locked
- `secondary` → New · `info` → Info · `error` → Error

```jsx
<Badge tone="success" dot>Completed</Badge>
<Badge tone="primary" pill>In progress</Badge>
<Badge tone="warning" variant="outline">Needs review</Badge>
<Badge tone="secondary" variant="solid">New</Badge>
```

Variants: `soft` (default), `solid`, `outline`. Use `dot` for a status indicator, `pill` for rounded.
