Surface container for lessons, stats, and AI content. Pick the variant by purpose:

- `default` — outlined, for most content
- `elevated` — shadow, for cards on a colored background
- `ai` — gradient ring border, to mark AI-generated content
- `gradient` — full AI gradient fill, for hero / streak cards (text turns white)

```jsx
<Card variant="elevated" interactive onClick={open}>
  <h3>Daily Lesson</h3>
  <p>Past tense verbs · 5 min</p>
</Card>
<Card variant="ai"><AIFeedbackBubble>…</AIFeedbackBubble></Card>
```

Add `interactive` for tappable cards (hover lift + focus ring). Set `padded={false}` to control padding yourself (e.g. cards with full-bleed media).
