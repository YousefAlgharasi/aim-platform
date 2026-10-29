// Course prices. Each course has a price and currency, an optional discount
// (percent or fixed amount, optionally limited to a date range) and how many
// days a student gets to finish it after their payment is approved. A price
// of 0 makes the course free. The backend calculates the final price.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  CoursePrice,
  coursePaymentsApi,
  CURRENCIES,
  formatDate,
  formatMoney,
} from '../../../../features/course-payments/api';
import { StatusBadge } from '../../../../features/course-payments/course-payments-styles';
import { PriceDraft as Draft, toPriceDraft as toDraft, validatePriceDraft } from '../../../../features/course-payments/price-draft';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../../shared/components/operations';

export default function CoursePricesPage() {
  const [courses, setCourses] = useState<CoursePrice[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const items = await coursePaymentsApi.listPrices();
      setCourses(items);
      setDrafts(Object.fromEntries(items.map((c) => [c.courseId, toDraft(c)])));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load prices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(courseId: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [courseId]: { ...prev[courseId], [field]: value } as Draft }));
    setErrors((prev) => ({ ...prev, [courseId]: '' }));
    setSaved(null);
  }

  async function save(e: React.FormEvent, course: CoursePrice) {
    e.preventDefault();
    const { input, error } = validatePriceDraft(drafts[course.courseId]);
    if (!input) {
      setErrors((prev) => ({ ...prev, [course.courseId]: error ?? 'Invalid price.' }));
      return;
    }
    setSaving(course.courseId);
    try {
      const updated = await coursePaymentsApi.savePrice(course.courseId, input);
      setCourses((prev) => prev.map((c) => (c.courseId === course.courseId ? updated : c)));
      setDrafts((prev) => ({ ...prev, [course.courseId]: toDraft(updated) }));
      setSaved(course.courseId);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [course.courseId]: err instanceof Error ? err.message : 'Failed to save.' }));
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <OperationsLoadingSpinner message="Loading course prices..." />;
  if (loadError) return <OperationsErrorCard message={loadError} onRetry={load} />;

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Course payments</p>
        <h1 className="cp-title">Course Prices</h1>
        <p className="cp-meta">
          Set what each course costs. A price of 0 makes the course free. Students who don&apos;t finish within the days
          to finish fail and have to pay again to retake the course from the start.
        </p>
      </header>

      <div className="cp-list">
        {courses.map((course) => {
          const d = drafts[course.courseId] ?? toDraft(course);
          const isSaving = saving === course.courseId;
          const q = course.quote;
          return (
            <form key={course.courseId} className="cp-card" onSubmit={(e) => save(e, course)} aria-label={`${course.courseTitle} price`}>
              <div className="cp-actions" style={{ justifyContent: 'space-between' }}>
                <h2 className="cp-card-title">
                  {course.courseTitle}{course.cefrCode ? ` (${course.cefrCode})` : ''}
                  {course.courseStatus !== 'published' && <span className="cp-muted"> · {course.courseStatus}</span>}
                </h2>
                <span>
                  {q.isFree ? (
                    <StatusBadge status="free" />
                  ) : (
                    <>
                      Students pay <span className="cp-strong">{formatMoney(q.amount, q.currency)}</span>
                      {q.discountActive && (
                        <> <span className="cp-strike">{formatMoney(q.originalAmount, q.currency)}</span>
                          {q.discountEndsAt && <span className="cp-muted"> until {formatDate(q.discountEndsAt)}</span>}
                        </>
                      )}
                    </>
                  )}
                </span>
              </div>

              <div className="cp-fields">
                <div className="cp-field">
                  <label className="cp-label" htmlFor={`amount-${course.courseId}`}>Price</label>
                  <input id={`amount-${course.courseId}`} className="cp-input" type="number" min="0" step="0.01" inputMode="decimal"
                    value={d.amount} onChange={(e) => update(course.courseId, 'amount', e.target.value)} disabled={isSaving} />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor={`currency-${course.courseId}`}>Currency</label>
                  <select id={`currency-${course.courseId}`} className="cp-select" value={d.currency}
                    onChange={(e) => update(course.courseId, 'currency', e.target.value)} disabled={isSaving}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor={`days-${course.courseId}`}>Days to finish</label>
                  <input id={`days-${course.courseId}`} className="cp-input" type="number" min="1" max="365" step="1"
                    value={d.accessDays} onChange={(e) => update(course.courseId, 'accessDays', e.target.value)} disabled={isSaving} />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor={`dtype-${course.courseId}`}>Discount</label>
                  <select id={`dtype-${course.courseId}`} className="cp-select" value={d.discountType}
                    onChange={(e) => update(course.courseId, 'discountType', e.target.value)} disabled={isSaving}>
                    <option value="none">No discount</option>
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </div>
                {d.discountType !== 'none' && (
                  <>
                    <div className="cp-field">
                      <label className="cp-label" htmlFor={`dvalue-${course.courseId}`}>
                        {d.discountType === 'percent' ? 'Discount %' : `Discount (${d.currency})`}
                      </label>
                      <input id={`dvalue-${course.courseId}`} className="cp-input" type="number" min="0" step="0.01"
                        value={d.discountValue} onChange={(e) => update(course.courseId, 'discountValue', e.target.value)} disabled={isSaving} />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label" htmlFor={`dstart-${course.courseId}`}>Starts (optional)</label>
                      <input id={`dstart-${course.courseId}`} className="cp-input" type="datetime-local"
                        value={d.discountStartsAt} onChange={(e) => update(course.courseId, 'discountStartsAt', e.target.value)} disabled={isSaving} />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label" htmlFor={`dend-${course.courseId}`}>Ends (optional)</label>
                      <input id={`dend-${course.courseId}`} className="cp-input" type="datetime-local"
                        value={d.discountEndsAt} onChange={(e) => update(course.courseId, 'discountEndsAt', e.target.value)} disabled={isSaving} />
                    </div>
                  </>
                )}
              </div>

              {errors[course.courseId] && <div className="cp-error" role="alert">{errors[course.courseId]}</div>}
              {saved === course.courseId && !errors[course.courseId] && <div className="cp-success" role="status">Saved.</div>}

              <div className="cp-actions">
                <button type="submit" className="cp-btn" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
