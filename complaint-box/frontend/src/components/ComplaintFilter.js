import React, { useCallback, useState } from 'react';
import { Checkbox, Input, Button, Select } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  SortAscendingOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from '../utils/constants';

const CATEGORY_ICONS = {
  infrastructure: '🏗️',
  safety: '🛡️',
  water_quality: '💧',
  sanitation: '🧹',
  traffic: '🚦',
  noise_pollution: '🔊',
  other: '📋',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  in_progress: '#003893',
  resolved: '#059669',
  rejected: '#dc2626',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
];

const ComplaintFilter = ({ onFilterChange, currentFilters }) => {
  const handleCategoryChange = useCallback((selected) => {
    onFilterChange({ ...currentFilters, categories: selected });
  }, [onFilterChange, currentFilters]);

  const handleStatusChange = useCallback((selected) => {
    onFilterChange({ ...currentFilters, statuses: selected });
  }, [onFilterChange, currentFilters]);

  const handleLocationChange = useCallback((e) => {
    onFilterChange({ ...currentFilters, location: e.target.value });
  }, [onFilterChange, currentFilters]);

  const handleSortChange = useCallback((value) => {
    onFilterChange({ ...currentFilters, sortBy: value });
  }, [onFilterChange, currentFilters]);

  const handleClear = useCallback(() => {
    onFilterChange({ categories: [], statuses: [], location: '', sortBy: 'newest' });
  }, [onFilterChange]);

  const hasActiveFilters =
    currentFilters.categories.length > 0 ||
    currentFilters.statuses.length > 0 ||
    currentFilters.location !== '';

  const activeCount = currentFilters.categories.length + currentFilters.statuses.length + (currentFilters.location ? 1 : 0);

  return (
    <div className="filter-sidebar" role="complementary" aria-label="Complaint filters">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-red-700" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-700 m-0">Filters</h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent px-2 py-1 rounded hover:bg-red-50"
            aria-label="Clear all filters"
          >
            <ClearOutlined style={{ fontSize: 10 }} />
            Clear
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <SortAscendingOutlined style={{ fontSize: 11 }} aria-hidden="true" />
          Sort By
        </h4>
        <Select
          value={currentFilters.sortBy || 'newest'}
          onChange={handleSortChange}
          options={SORT_OPTIONS}
          style={{ width: '100%' }}
          size="middle"
        />
      </div>

      {/* Location Search */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Location
        </h4>
        <Input
          prefix={<SearchOutlined className="text-slate-300" />}
          placeholder="Search by location..."
          value={currentFilters.location}
          onChange={handleLocationChange}
          allowClear
          size="middle"
          aria-label="Filter by location"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Category
        </h4>
        <Checkbox.Group
          value={currentFilters.categories}
          onChange={handleCategoryChange}
          className="flex flex-col gap-1.5"
        >
          {COMPLAINT_CATEGORIES.map((cat) => (
            <Checkbox key={cat} value={cat} className="!ml-0">
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <span className="text-xs" aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
                {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Status
        </h4>
        <Checkbox.Group
          value={currentFilters.statuses}
          onChange={handleStatusChange}
          className="flex flex-col gap-1.5"
        >
          {COMPLAINT_STATUS.map((status) => (
            <Checkbox key={status} value={status} className="!ml-0">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                  style={{ background: STATUS_COLORS[status] }}
                  aria-hidden="true"
                />
                {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    </div>
  );
};

// Mobile filter trigger button for use in parent
export const MobileFilterButton = ({ activeCount, onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer w-full justify-center"
    aria-label={`Open filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
  >
    <FilterOutlined aria-hidden="true" />
    Filters
    {activeCount > 0 && (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
        {activeCount}
      </span>
    )}
  </button>
);

export default ComplaintFilter;
