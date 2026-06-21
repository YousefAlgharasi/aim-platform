// P14-067: Parent Billing UI Tests
// Verifies parent billing UI never processes payments client-side,
// never stores card data, and always defers to backend authority.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const BILLING_PAGE_FILES = [
  'ParentBilling.js',
  'ParentPricing.js',
  'ParentSubscription.js',
  'ParentCheckout.js',
  'ParentInvoices.js',
];

const BILLING_API_FILES = [
  'billingApiClient.js',
];

const FORBIDDEN_PATTERNS = [
  /cardNumber/i,
  /card_number/i,
  /cvv/i,
  /cvc/i,
  /expiry/i,
  /stripe\.confirm/i,
  /processPayment/i,
  /chargeCard/i,
  /sk_live_/,
  /sk_test_/,
  /whsec_/,
  /STRIPE_SECRET/i,
  /WEBHOOK_SECRET/i,
];

const FORBIDDEN_AUTHORITY_PATTERNS = [
  /calculatePrice/i,
  /computeDiscount/i,
  /validateCouponLocally/i,
  /isEntitled\s*=/i,
  /grantEntitlement/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Parent Billing UI — no client-side payment processing', () => {
  for (const file of BILLING_PAGE_FILES) {
    const content = readFile(PAGES_DIR, file);
    if (!content) continue;

    describe(file, () => {
      test('does not contain raw card data references', () => {
        for (const pattern of FORBIDDEN_PATTERNS) {
          expect(content).not.toMatch(pattern);
        }
      });

      test('does not compute pricing or entitlements client-side', () => {
        for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
          expect(content).not.toMatch(pattern);
        }
      });
    });
  }
});

describe('Parent Billing API client — backend authority', () => {
  for (const file of BILLING_API_FILES) {
    const content = readFile(API_DIR, file);
    if (!content) continue;

    describe(file, () => {
      test('does not embed provider secrets', () => {
        expect(content).not.toMatch(/sk_live_/);
        expect(content).not.toMatch(/sk_test_/);
        expect(content).not.toMatch(/whsec_/);
      });

      test('uses authenticated requests with Bearer token', () => {
        expect(content).toMatch(/Authorization/);
        expect(content).toMatch(/Bearer/);
      });

      test('calls backend billing endpoints', () => {
        expect(content).toMatch(/\/billing\//);
      });
    });
  }
});

describe('Parent Billing pages exist', () => {
  for (const file of BILLING_PAGE_FILES) {
    test(`${file} exists`, () => {
      const filePath = path.join(PAGES_DIR, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  }
});
