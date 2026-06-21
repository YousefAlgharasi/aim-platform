Labeled text field for forms — handles text, password (with show/hide toggle), search and email. Pass `error` to show a validation state.

```jsx
<Input label="Email" type="email" placeholder="you@example.com" />
<Input label="Password" type="password" helper="At least 8 characters" />
<Input label="Search" type="search" leftIcon={<SearchIcon/>} placeholder="Search lessons" />
<Input label="Phone" error="Enter a valid number" required />
```

Use `size="sm"` (40px) for dense forms. RTL-aware. For Arabic, set `dir="rtl"` on a parent — the field flips automatically.
