import { screen, fireEvent, renderWithProviders } from '../test-utils';
import { AdminBillingMonitor } from '../../features/billing/admin-billing-monitor';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/admin/billing',
}));

describe('AdminBillingMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders the overview tab by default', () => {
    renderWithProviders(<AdminBillingMonitor />);
    expect(screen.getByText('Billing Overview')).toBeInTheDocument();
  });

  it('switches tabs and updates URL search params', () => {
    renderWithProviders(<AdminBillingMonitor />);
    fireEvent.click(screen.getByRole('tab', { name: 'Provider Events' }));
    expect(mockPush).toHaveBeenCalledWith('/admin/billing?tab=events', { scroll: false });
  });

  it('renders active tab based on URL search params', () => {
    mockSearchParams = new URLSearchParams('tab=coupons');
    renderWithProviders(<AdminBillingMonitor />);
    expect(screen.getByRole('heading', { name: 'Coupons' })).toBeInTheDocument();
  });

  it('renders the read-only boundary note', () => {
    renderWithProviders(<AdminBillingMonitor />);
    expect(screen.getByText('Read-only — no mutation endpoints exposed in this view.')).toBeInTheDocument();
  });
});

