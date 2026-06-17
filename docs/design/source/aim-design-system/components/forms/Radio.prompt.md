Radio button for single-choice groups. Share a `name` across options.

```jsx
<Radio name="plan" value="monthly" label="Monthly" checked={p==='monthly'} onChange={()=>setP('monthly')} />
<Radio name="plan" value="yearly" label="Yearly" checked={p==='yearly'} onChange={()=>setP('yearly')} />
```
