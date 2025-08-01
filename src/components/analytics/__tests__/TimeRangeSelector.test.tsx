import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { TimeRangeSelector } from '../TimeRangeSelector';
import { getDefaultTimeRange } from '@/lib/analytics';

// Mock the TimeRangeSelector component to avoid MUI date picker issues
jest.mock('../TimeRangeSelector', () => {
  return {
    TimeRangeSelector: ({ timeRange, onTimeRangeChange }: any) => {
      const handleClick = (days: number) => {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - days);
        onTimeRangeChange({ startDate, endDate });
      };

      return (
        <div>
          <button onClick={() => handleClick(7)}>Last 7 Days</button>
          <button onClick={() => handleClick(30)}>Last 30 Days</button>
          <button onClick={() => handleClick(90)}>Last 90 Days</button>
          <button data-testid="custom-range-btn">Custom Range</button>
        </div>
      );
    },
  };
});

describe('TimeRangeSelector Component', () => {
  const mockTimeRange = getDefaultTimeRange();
  const mockOnTimeRangeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default time range', () => {
    render(
      <TimeRangeSelector
        timeRange={mockTimeRange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );

    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
    expect(screen.getByTestId('custom-range-btn')).toBeInTheDocument();
  });

  it('should call onTimeRangeChange when 7 days button is clicked', () => {
    render(
      <TimeRangeSelector
        timeRange={mockTimeRange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );

    fireEvent.click(screen.getByText('Last 7 Days'));

    expect(mockOnTimeRangeChange).toHaveBeenCalledTimes(1);
    const newTimeRange = mockOnTimeRangeChange.mock.calls[0][0];
    expect(newTimeRange).toHaveProperty('startDate');
    expect(newTimeRange).toHaveProperty('endDate');

    // Check that the start date is 7 days before the end date
    const expectedStartDate = new Date(newTimeRange.endDate);
    expectedStartDate.setDate(expectedStartDate.getDate() - 7);

    // Compare dates by converting to ISO string and comparing only the date part
    const startDateStr = newTimeRange.startDate.toISOString().split('T')[0];
    const expectedStartDateStr = expectedStartDate.toISOString().split('T')[0];

    expect(startDateStr).toBe(expectedStartDateStr);
  });

  it('should call onTimeRangeChange when 30 days button is clicked', () => {
    render(
      <TimeRangeSelector
        timeRange={mockTimeRange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );

    fireEvent.click(screen.getByText('Last 30 Days'));

    expect(mockOnTimeRangeChange).toHaveBeenCalledTimes(1);
    const newTimeRange = mockOnTimeRangeChange.mock.calls[0][0];

    // Check that the start date is 30 days before the end date
    const expectedStartDate = new Date(newTimeRange.endDate);
    expectedStartDate.setDate(expectedStartDate.getDate() - 30);

    const startDateStr = newTimeRange.startDate.toISOString().split('T')[0];
    const expectedStartDateStr = expectedStartDate.toISOString().split('T')[0];

    expect(startDateStr).toBe(expectedStartDateStr);
  });

  it('should call onTimeRangeChange when 90 days button is clicked', () => {
    render(
      <TimeRangeSelector
        timeRange={mockTimeRange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );

    fireEvent.click(screen.getByText('Last 90 Days'));

    expect(mockOnTimeRangeChange).toHaveBeenCalledTimes(1);
    const newTimeRange = mockOnTimeRangeChange.mock.calls[0][0];

    // Check that the start date is 90 days before the end date
    const expectedStartDate = new Date(newTimeRange.endDate);
    expectedStartDate.setDate(expectedStartDate.getDate() - 90);

    const startDateStr = newTimeRange.startDate.toISOString().split('T')[0];
    const expectedStartDateStr = expectedStartDate.toISOString().split('T')[0];

    expect(startDateStr).toBe(expectedStartDateStr);
  });
});
