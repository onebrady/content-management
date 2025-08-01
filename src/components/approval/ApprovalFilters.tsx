'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
  InputAdornment,
  Button,
  Collapse,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { ApprovalStatus, ContentType } from '@prisma/client';
import { ApprovalFilters as FiltersType } from './ApprovalDashboard';

interface ApprovalFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: Partial<FiltersType>) => void;
}

export function ApprovalFilters({
  filters,
  onFilterChange,
}: ApprovalFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery);

  // Handle status filter change
  const handleStatusChange = (event: any) => {
    const {
      target: { value },
    } = event;
    onFilterChange({
      status: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle content type filter change
  const handleContentTypeChange = (event: any) => {
    const {
      target: { value },
    } = event;
    onFilterChange({
      contentType: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle date range change
  const handleDateRangeChange = (index: number, date: Date | null) => {
    const newDateRange = [...filters.dateRange];
    newDateRange[index] = date;
    onFilterChange({ dateRange: newDateRange as [Date | null, Date | null] });
  };

  // Handle search query change
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchQuery });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      status: [],
      contentType: [],
      dateRange: [null, null],
      searchQuery: '',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Bar */}
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ mb: 3, display: 'flex', gap: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Search by title, author, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery('');
                    onFilterChange({ searchQuery: '' });
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Button variant="contained" type="submit" sx={{ minWidth: 100 }}>
          Search
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      {/* Advanced Filters */}
      <Collapse in={showAdvanced}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                multiple
                value={filters.status}
                onChange={handleStatusChange}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {Object.values(ApprovalStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="content-type-filter-label">
                Content Type
              </InputLabel>
              <Select
                labelId="content-type-filter-label"
                id="content-type-filter"
                multiple
                value={filters.contentType}
                onChange={handleContentTypeChange}
                input={<OutlinedInput label="Content Type" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {Object.values(ContentType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="From Date"
                    value={filters.dateRange[0]}
                    onChange={(date) => handleDateRangeChange(0, date)}
                    slotProps={{
                      textField: { fullWidth: true, size: 'medium' },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="To Date"
                    value={filters.dateRange[1]}
                    onChange={(date) => handleDateRangeChange(1, date)}
                    slotProps={{
                      textField: { fullWidth: true, size: 'medium' },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>
        </Grid>

        {/* Filter Summary and Clear Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {getFilterSummary(filters)}
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
          >
            Clear All Filters
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}

// Helper function to generate filter summary text
function getFilterSummary(filters: FiltersType): string {
  const parts = [];

  if (filters.status.length > 0) {
    parts.push(`${filters.status.length} status(es)`);
  }

  if (filters.contentType.length > 0) {
    parts.push(`${filters.contentType.length} content type(s)`);
  }

  if (filters.dateRange[0] || filters.dateRange[1]) {
    parts.push('date range');
  }

  if (filters.searchQuery) {
    parts.push(`search: "${filters.searchQuery}"`);
  }

  return parts.length > 0
    ? `Filtering by: ${parts.join(', ')}`
    : 'No filters applied';
}
