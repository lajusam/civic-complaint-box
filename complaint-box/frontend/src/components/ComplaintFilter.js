// ComplaintFilter Component
// Filter complaints by category, location, and status
// Provides a sidebar filter interface for the complaint feed

import React from 'react';
import { Card, Checkbox, Input, Button, Space, Row, Col } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from '../utils/constants';

/**
 * ComplaintFilter Component
 * @param {Function} onFilterChange - Callback when filters are updated
 * @param {Object} currentFilters - Current filter state
 */
const ComplaintFilter = ({ onFilterChange, currentFilters }) => {
  const handleCategoryChange = (selectedCategories) => {
    onFilterChange({
      ...currentFilters,
      categories: selectedCategories,
    });
  };

  const handleStatusChange = (selectedStatuses) => {
    onFilterChange({
      ...currentFilters,
      statuses: selectedStatuses,
    });
  };

  const handleLocationChange = (e) => {
    onFilterChange({
      ...currentFilters,
      location: e.target.value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      categories: [],
      statuses: [],
      location: '',
    });
  };

  return (
    <Card title="Filter Complaints" className="filter-card">
      {/* Category Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Categories</h4>
        <Checkbox.Group
          options={COMPLAINT_CATEGORIES.map((cat) => ({
            label: cat.replace('_', ' ').toUpperCase(),
            value: cat,
          }))}
          value={currentFilters.categories}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Status</h4>
        <Checkbox.Group
          options={COMPLAINT_STATUS.map((status) => ({
            label: status.replace('_', ' ').toUpperCase(),
            value: status,
          }))}
          value={currentFilters.statuses}
          onChange={handleStatusChange}
        />
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Location</h4>
        <Input
          placeholder="Search by location..."
          value={currentFilters.location}
          onChange={handleLocationChange}
          size="large"
        />
      </div>

      {/* Clear Filters Button */}
      <Button
        icon={<ClearOutlined />}
        onClick={handleClearFilters}
        block
        danger
      >
        Clear All Filters
      </Button>
    </Card>
  );
};

export default ComplaintFilter;
