'use client';

import { useState } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Popover,
  Paper,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AnalyticsTimeRange } from '@/lib/analytics';

interface TimeRangeSelectorProps {
  timeRange: AnalyticsTimeRange;
  onTimeRangeChange: (timeRange: AnalyticsTimeRange) => void;
}

export function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
}: TimeRangeSelectorProps) {
  const [activeButton, setActiveButton] = useState<string>('30d');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(timeRange.startDate);
  const [endDate, setEndDate] = useState<Date | null>(timeRange.endDate);

  // Handle predefined range selection
  const handleRangeSelect = (days: number, buttonId: string) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    onTimeRangeChange({ startDate, endDate });
    setActiveButton(buttonId);
  };

  // Handle custom range popover
  const handleCustomClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setActiveButton('custom');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Apply custom date range
  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      onTimeRangeChange({ startDate, endDate });
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ mb: 3 }}>
      <ButtonGroup variant="outlined" aria-label="time range selection">
        <Button
          onClick={() => handleRangeSelect(7, '7d')}
          variant={activeButton === '7d' ? 'contained' : 'outlined'}
        >
          Last 7 Days
        </Button>
        <Button
          onClick={() => handleRangeSelect(30, '30d')}
          variant={activeButton === '30d' ? 'contained' : 'outlined'}
        >
          Last 30 Days
        </Button>
        <Button
          onClick={() => handleRangeSelect(90, '90d')}
          variant={activeButton === '90d' ? 'contained' : 'outlined'}
        >
          Last 90 Days
        </Button>
        <Button
          onClick={handleCustomClick}
          variant={activeButton === 'custom' ? 'contained' : 'outlined'}
        >
          Custom Range
        </Button>
      </ButtonGroup>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Select Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                minDate={startDate || undefined}
              />
            </Box>
          </LocalizationProvider>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleApplyCustomRange}
              disabled={!startDate || !endDate}
            >
              Apply
            </Button>
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
}
