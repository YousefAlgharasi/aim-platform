Icon-only button for toolbars, app bars and compact actions — always pass `ariaLabel` for accessibility.

```jsx
<IconButton ariaLabel="Search" variant="ghost"><SearchIcon/></IconButton>
<IconButton ariaLabel="Bookmark" variant="soft" round><BookmarkIcon/></IconButton>
```

Variants: `ghost` (default, transparent), `soft` (tinted), `solid` (primary fill), `outline`. Sizes `sm/md/lg`. Use `round` for a circular shape.
