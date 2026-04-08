import React from 'react';
import { Search } from 'lucide-react';

export const SearchActionBar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  actions,
  className,
}) => {
  return (
    <div className={`toolbar ${className || ''}`}>
      <div className="toolbar-left">
        <div className="search-field">
          <Search size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        {filters.map((filter, index) => (
          <select key={filter.label || index} className="filter-select" value={filter.value} onChange={(e) => filter.onChange(e.target.value)}>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="toolbar-right">
        {actions}
      </div>
    </div>
  );
};
