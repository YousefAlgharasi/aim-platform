Primary mobile bottom navigation (3–5 destinations). Respects iOS safe-area inset. Supports notification badges.

```jsx
<BottomNav value={tab} onChange={setTab} items={[
  {value:'home', label:'Home', icon:<HomeIcon/>},
  {value:'learn', label:'Learn', icon:<BookIcon/>},
  {value:'practice', label:'Practice', icon:<MicIcon/>},
  {value:'profile', label:'Profile', icon:<UserIcon/>, badge:2},
]} />
```
Keep to 3–5 items. RTL-aware.
