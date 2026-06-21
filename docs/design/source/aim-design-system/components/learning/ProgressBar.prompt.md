Linear progress bar for lesson completion, XP and skill mastery.

```jsx
<ProgressBar value={70} label="Lesson progress" showValue />
<ProgressBar value={320} max={500} tone="gradient" label="XP to next level" showValue valueFormat={(v,m)=>`${v}/${m} XP`} />
```
Tones: `primary`, `gradient` (growth), `success`, `warning`. Sizes `sm/md/lg`.
