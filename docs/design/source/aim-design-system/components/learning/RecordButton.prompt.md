Microphone record button for speaking practice and pronunciation. Pulses while recording; switches to a stop icon.

```jsx
<RecordButton recording={rec} onToggle={toggle} caption={rec ? '0:12' : undefined} />
```
Pass a timer string to `caption` while recording. Respects `prefers-reduced-motion` (no pulse).
