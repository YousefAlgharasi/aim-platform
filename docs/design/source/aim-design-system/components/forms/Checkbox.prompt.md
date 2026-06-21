Checkbox with label for multi-select and consent. Supports an `indeterminate` (mixed) state for "select all".

```jsx
<Checkbox label="I agree to the terms" checked={ok} onChange={e=>setOk(e.target.checked)} />
<Checkbox label="Select all" indeterminate />
```
