import { formatNumber, t } from '../../i18n';

const CURRENCY_LABEL: Record<string, string> = { YER: 'YER', SAR: 'SAR', USD: 'USD' };

export function formatMoney(amount: number, currency: string): string {
  return `${formatNumber(amount, { maximumFractionDigits: 2 })} ${t(CURRENCY_LABEL[currency] ?? currency)}`;
}
