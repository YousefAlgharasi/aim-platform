Floating action button for the primary screen action (e.g. "Ask AI Tutor"). Gradient fill by default to mark it as an AI/adaptive entry point.

```jsx
<Fab ariaLabel="Ask AI Tutor" icon={<SparklesIcon/>} />
<Fab extended icon={<MicIcon/>}>Practice speaking</Fab>
```

Use `extended` with a short label for emphasis; set `gradient={false}` for a plain primary fill.
