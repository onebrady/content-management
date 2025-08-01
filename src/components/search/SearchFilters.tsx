'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ContentStatus, ContentType, Priority } from '@prisma/client';
import { SearchFilters as SearchFiltersType } from '@/lib/search';
import { getAllTags, getAllUsers } from '@/lib/search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: Partial<SearchFiltersType>) => void;
  onResetFilters: () => void;
}

export function SearchFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  // Fetch tags and users for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [tagsData, usersData] = await Promise.all([
          getAllTags(),
          getAllUsers(),
        ]);
        setTags(tagsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Handle search query submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ query: searchQuery });
  };

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
  const handleTypeChange = (event: any) => {
    const {
      target: { value },
    } = event;
    onFilterChange({
      types: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle priority filter change
  const handlePriorityChange = (event: any) => {
    const {
      target: { value },
    } = event;
    onFilterChange({
      priorities: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle tags filter change
  const handleTagsChange = (event: any) => {
    const {
      target: { value },
    } = event;
    onFilterChange({
      tags: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle author filter change
  const handleAuthorChange = (event: any) => {
    onFilterChange({ author: event.target.value });
  };

  // Handle assignee filter change
  const handleAssigneeChange = (event: any) => {
    onFilterChange({ assignee: event.target.value });
  };

  // Handle date range change
  const handleStartDateChange = (date: Date | null) => {
    onFilterChange({ startDate: date });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFilterChange({ endDate: date });
  };

  // Handle sort change
  const handleSortByChange = (event: any) => {
    onFilterChange({ sortBy: event.target.value });
  };

  const handleSortOrderChange = (event: any) => {
    onFilterChange({ sortOrder: event.target.value });
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
    onFilterChange({ query: '' });
  };

  // Generate filter summary text
  const getFilterSummary = () => {
    const parts = [];

    if (filters.status && filters.status.length > 0) {
      parts.push(`${filters.status.length} status(es)`);
    }

    if (filters.types && filters.types.length > 0) {
      parts.push(`${filters.types.length} type(s)`);
    }

    if (filters.priorities && filters.priorities.length > 0) {
      parts.push(`${filters.priorities.length} priority(ies)`);
    }

    if (filters.tags && filters.tags.length > 0) {
      parts.push(`${filters.tags.length} tag(s)`);
    }

    if (filters.author) {
      parts.push('author');
    }

    if (filters.assignee) {
      parts.push('assignee');
    }

    if (filters.startDate || filters.endDate) {
      parts.push('date range');
    }

    if (filters.sortBy && filters.sortBy !== 'updatedAt') {
      parts.push(`sorted by ${filters.sortBy}`);
    }

    return parts.length > 0
      ? `Filtering by: ${parts.join(', ')}`
      : 'No filters applied';
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* Search Bar */}
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ mb: 3, display: 'flex', gap: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Search by title or content..."
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
                <IconButton size="small" onClick={handleClearSearch}>
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
          {/* Status Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                multiple
                value={filters.status || []}
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
                {Object.values(ContentStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Content Type Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="type-filter-label">Content Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                multiple
                value={filters.types || []}
                onChange={handleTypeChange}
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

          {/* Priority Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                id="priority-filter"
                multiple
                value={filters.priorities || []}
                onChange={handlePriorityChange}
                input={<OutlinedInput label="Priority" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {Object.values(Priority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tags Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="tags-filter-label">Tags</InputLabel>
              <Select
                labelId="tags-filter-label"
                id="tags-filter"
                multiple
                value={filters.tags || []}
                onChange={handleTagsChange}
                input={<OutlinedInput label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Author Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="author-filter-label">Author</InputLabel>
              <Select
                labelId="author-filter-label"
                id="author-filter"
                value={filters.author || ''}
                onChange={handleAuthorChange}
                input={<OutlinedInput label="Author" />}
                displayEmpty
              >
                <MenuItem value="">Any Author</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Assignee Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="assignee-filter-label">Assignee</InputLabel>
              <Select
                labelId="assignee-filter-label"
                id="assignee-filter"
                value={filters.assignee || ''}
                onChange={handleAssigneeChange}
                input={<OutlinedInput label="Assignee" />}
                displayEmpty
              >
                <MenuItem value="">Any Assignee</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="From Date"
                    value={filters.startDate || null}
                    onChange={handleStartDateChange}
                    slotProps={{
                      textField: { fullWidth: true, size: 'medium' },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="To Date"
                    value={filters.endDate || null}
                    onChange={handleEndDateChange}
                    slotProps={{
                      textField: { fullWidth: true, size: 'medium' },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>

          {/* Sort Options */}
          <Grid item xs={12} md={6} lg={3}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    value={filters.sortBy || 'updatedAt'}
                    onChange={handleSortByChange}
                    input={<OutlinedInput label="Sort By" />}
                  >
                    <MenuItem value="updatedAt">Last Updated</MenuItem>
                    <MenuItem value="createdAt">Created Date</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="sort-order-label">Order</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    id="sort-order"
                    value={filters.sortOrder || 'desc'}
                    onChange={handleSortOrderChange}
                    input={<OutlinedInput label="Order" />}
                  >
                    <MenuItem value="desc">Desc</MenuItem>
                    <MenuItem value="asc">Asc</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Filter Summary and Reset Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {getFilterSummary()}
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={onResetFilters}
            startIcon={<ClearIcon />}
          >
            Reset All Filters
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
