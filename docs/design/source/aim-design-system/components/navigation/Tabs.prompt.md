Underlined tabs for switching views within a screen (e.g. Lessons / Progress / Review). The active indicator animates between tabs.

```jsx
<Tabs value={tab} onChange={setTab} items={[
  {value:'lessons', label:'Lessons'},
  {value:'progress', label:'Progress', count:3},
  {value:'review', label:'Review'},
]} />
```
RTL-aware. For 2–4 mutually-exclusive options that look like a control rather than navigation, use `SegmentedControl` instead.
