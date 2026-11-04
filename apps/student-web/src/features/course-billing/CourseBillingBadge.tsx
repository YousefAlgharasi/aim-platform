import type { CourseAccess, CoursePriceQuote } from './courseBillingApi';
import { formatMoney } from './billingFormat';
import { useI18n } from '../../i18n/I18nContext';

/** Price / payment pending / days left / time ran out — nothing for free or finished courses. */
export function CourseBillingBadge({ price, access }: { price?: CoursePriceQuote; access?: CourseAccess }) {
  const { t, plural } = useI18n();
  if (!price || !access) return null;

  let label = '';
  let tone = 'text-brand-ink bg-brand-soft';
  switch (access.status) {
    case 'none':
    case 'rejected':
      label = formatMoney(price.amount, price.currency);
      break;
    case 'pending':
      label = t('Payment pending');
      tone = 'text-warning-ink bg-warning-soft';
      break;
    case 'failed':
      label = t('Time ran out');
      tone = 'text-danger-ink bg-danger-soft';
      break;
    case 'active': {
      const n = access.daysLeft ?? 0;
      label = n <= 0
        ? t('Less than a day left')
        : plural(n, { one: t('1 day left'), two: t('2 days left'), few: t('{n} days left [few]', { n }), other: t('{n} days left', { n }) });
      if (n <= 5) tone = 'text-warning-ink bg-warning-soft';
      break;
    }
    default:
      return null;
  }

  return (
    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${tone}`}>{label}</span>
  );
}
