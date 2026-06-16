Multiple-choice answer for quizzes and exercises. Drive the look with `state`:

- `default` — selectable
- `selected` — picked, before checking
- `correct` / `incorrect` — after grading the user's pick
- `reveal` — highlight the right answer when the user was wrong

```jsx
<AnswerOption optionKey="A" state="selected" onClick={pick}>She has lived here.</AnswerOption>
<AnswerOption optionKey="B" state="incorrect">She have lived here.</AnswerOption>
<AnswerOption optionKey="C" state="correct">She had lived here.</AnswerOption>
```

Graded states auto-disable the button. Text aligns to the start, so it works in RTL.
