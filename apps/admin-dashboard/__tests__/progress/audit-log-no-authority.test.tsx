import { render, screen } from '@testing-library/react';
import { AuditLogClient } from '../../app/admin/audit-logs/audit-log-client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const mockLogs = [
  { id: 'log-1', userId: 'u-1', action: 'course_published', entityType: 'course', entityId: 'c-1', createdAt: '2026-01-10T10:00:00Z' },
];

describe('AuditLogClient — no authority', () => {
  it('displays action from backend as-is', () => {
    render(<AuditLogClient logs={mockLogs} total={1} page={1} totalPages={1} filterUserId="" filterAction="" />);
    expect(screen.getByText('course published')).toBeInTheDocument();
  });

  it('displays entity type from backend', () => {
    render(<AuditLogClient logs={mockLogs} total={1} page={1} totalPages={1} filterUserId="" filterAction="" />);
    expect(screen.getByText('course')).toBeInTheDocument();
  });

  it('does not contain delete buttons', () => {
    render(<AuditLogClient logs={mockLogs} total={1} page={1} totalPages={1} filterUserId="" filterAction="" />);
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it('does not contain edit buttons', () => {
    render(<AuditLogClient logs={mockLogs} total={1} page={1} totalPages={1} filterUserId="" filterAction="" />);
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<AuditLogClient logs={[]} total={0} page={1} totalPages={0} filterUserId="" filterAction="" />);
    expect(screen.getByText(/no audit logs/i)).toBeInTheDocument();
  });
});
