import { render, screen } from '../test-utils';
import { CourseSalesPanel } from '../../features/billing/pages/admin-billing-monitor';

describe('CourseSalesPanel', () => {
  it('shows real money from approved course payments, pending separately, and per-course revenue', () => {
    render(
      <CourseSalesPanel
        courseSales={{
          byCurrency: [
            { currency: 'YER', revenueMtd: 18000, revenueAllTime: 30000, discountsGiven: 2000, approvedThisMonth: 2, approvedTotal: 3, pendingCount: 1, pendingAmount: 10000, rejectedCount: 1 },
          ],
          byCourse: [{ courseId: 'c1', title: 'Starter', currency: 'YER', payments: 3, revenue: 30000 }],
        }}
      />,
    );
    expect(screen.getByText('Revenue this month (YER)')).toBeInTheDocument();
    expect(screen.getByText(/18,000/)).toBeInTheDocument();
    expect(screen.getByText('Approved payments')).toBeInTheDocument();
    expect(screen.getByText('3 (2 this month)')).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText(/Pending payments are not counted as revenue yet/)).toBeInTheDocument();
  });

  it('explains the empty state instead of showing zeros', () => {
    render(<CourseSalesPanel courseSales={{ byCurrency: [], byCourse: [] }} />);
    expect(screen.getByText(/No course payments yet/)).toBeInTheDocument();
  });
});
