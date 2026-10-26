// Arabic translations, keyed by the exact English source string used in `t('…')`.
// One file per area so features can be translated independently; keep keys unique across files.
import { common } from './common';
import { auth } from './auth';
import { learning } from './learning';
import { placement } from './placement';
import { assessments } from './assessments';
import { teacher } from './teacher';
import { dashboard } from './dashboard';
import { account } from './account';

export const ar: Record<string, string> = {
  ...common,
  ...auth,
  ...learning,
  ...placement,
  ...assessments,
  ...teacher,
  ...dashboard,
  ...account,
};
