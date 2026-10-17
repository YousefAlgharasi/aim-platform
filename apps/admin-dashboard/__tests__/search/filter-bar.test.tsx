import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminFilterBar } from '../../shared/components/Search/admin-filter-bar';
import { AdminSelect } from '../../shared/components/Input/admin-inputs';

describe('AdminFilterBar & AdminSelect', () => {
  it('renders search and select filters in a unified compact toolbar', () => {
    const handleSearch = jest.fn();
    const handleStatus = jest.fn();

    render(
      <AdminFilterBar
        searchValue="test@example.com"
        onSearchChange={handleSearch}
        searchPlaceholder="Search by email…"
        selectFilters={[
          {
            key: 'status',
            value: 'active',
            onChange: handleStatus,
            placeholder: 'All statuses',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Disabled', value: 'disabled' },
            ],
          },
        ]}
        onClearAll={jest.fn()}
      />
    );

    // Search input rendered
    const input = screen.getByPlaceholderText('Search by email…') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('test@example.com');

    // Select filter rendered
    const select = screen.getByDisplayValue('Active') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    // Clear all button rendered with active count
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('eliminates browser native double arrow via appearance: none', () => {
    render(
      <AdminSelect data-testid="select-test" defaultValue="one">
        <option value="one">Option One</option>
      </AdminSelect>
    );

    const select = screen.getByTestId('select-test');
    expect(select.className).toContain('appearance-none');
    expect(select.style.appearance).toBe('none');
  });

  it('fires clear search when x button is clicked', () => {
    const handleSearch = jest.fn();
    render(
      <AdminFilterBar
        searchValue="searching"
        onSearchChange={handleSearch}
      />
    );

    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
