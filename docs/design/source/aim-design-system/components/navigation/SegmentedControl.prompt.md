Pill segmented control for 2–4 mutually-exclusive options where the choice looks like a setting (e.g. Daily / Weekly, English / العربية). The thumb slides between segments.

```jsx
<SegmentedControl value={mode} onChange={setMode} items={['Daily','Weekly','Monthly']} />
<SegmentedControl fullWidth value={lang} onChange={setLang} items={[{value:'en',label:'English'},{value:'ar',label:'العربية'}]} />
```
