Pill-shaped chip for filters, tags and reminder chips. Add `onClick` + `selected` for a filter toggle, `removable` for input tags.

```jsx
<Chip selected onClick={toggle} icon={<BellIcon/>}>Review due</Chip>
<Chip removable onRemove={remove}>Grammar</Chip>
<Chip>Vocabulary</Chip>
```
