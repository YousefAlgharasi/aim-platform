Inline banner for contextual messages — streaks, errors, tips, offline notices.

```jsx
<AlertBanner tone="success" title="Lesson complete!">You earned 20 XP.</AlertBanner>
<AlertBanner tone="warning" dismissible onDismiss={hide}>Your streak ends in 3 hours.</AlertBanner>
<AlertBanner tone="error" title="Couldn't save">Check your connection and try again.</AlertBanner>
```

Tones: `info`, `success`, `warning`, `error` — each sets its own icon and color.
