import type { CoursePayment } from './courseBillingApi';
import { formatMoney } from './billingFormat';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export interface ReceiptLabels {
  title: string; course: string; amount: string; paidWith: string; transaction: string; date: string; reference: string; status: string; statusValue: string; note: string;
}

/** The receipt as a self-contained HTML document (every value escaped). Exported for tests. */
export function receiptHtml(p: CoursePayment, labels: ReceiptLabels, dateText: string, dir: 'ltr' | 'rtl'): string {
  const row = (k: string, v: string) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`;
  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><title>${esc(labels.title)}</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:40px;color:#111}h1{font-size:22px;margin:0 0 4px}p.sub{margin:0 0 24px;color:#555}
table{border-collapse:collapse;width:100%;max-width:520px}th,td{text-align:start;padding:10px 12px;border-bottom:1px solid #ddd}th{width:38%;color:#555;font-weight:600}
.total td{font-size:18px;font-weight:700}.ok{color:#136a3a;font-weight:700}@media print{body{margin:16px}}</style></head><body>
<h1>AIM English</h1><p class="sub">${esc(labels.title)}</p>
<table>${row(labels.course, p.courseTitle)}${row(labels.paidWith, p.walletName)}${row(labels.transaction, p.transactionNumber)}${row(labels.date, dateText)}
<tr class="total"><th>${esc(labels.amount)}</th><td>${esc(formatMoney(p.amount, p.currency))}</td></tr>
<tr><th>${esc(labels.status)}</th><td class="ok">${esc(labels.statusValue)}</td></tr>${row(labels.reference, p.id)}</table></body></html>`;
}

/** Opens the receipt in a new tab and starts the browser's print dialog (Save as PDF works from there). */
export function printReceipt(html: string): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
  return true;
}
