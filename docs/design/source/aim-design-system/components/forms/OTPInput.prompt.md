One-time passcode entry for phone/email verification. Auto-advances, supports paste and backspace. Cells stay LTR even in RTL layouts (numbers read left-to-right).

```jsx
<OTPInput length={4} value={code} onChange={setCode} onComplete={verify} />
```
