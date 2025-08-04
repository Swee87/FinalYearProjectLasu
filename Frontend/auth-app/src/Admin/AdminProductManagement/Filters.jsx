// src/components/Filters.jsx
import React from 'react';

export const Filters = ({ filters, onFilterChange }) => {
  const categories = ['fruits', 'vegetables', 'dairy', 'bakery', 'meat'];

  return (
    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-40 rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
          <select
            value={filters.soldOut}
            onChange={(e) => onFilterChange({ soldOut: e.target.value })}
            className="w-32 rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Sold Out</option>
            <option value="false">In Stock</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Min Stock</label>
          <input
            type="number"
            min="0"
            value={filters.stock}
            onChange={(e) => onFilterChange({ stock: e.target.value })}
            className="w-24 rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Min stock"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Items per page</label>
          <select
            value={filters.limit}
            onChange={(e) => onFilterChange({ limit: e.target.value })}
            className="w-20 rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <button
          onClick={() => onFilterChange({
            category: '',
            soldOut: '',
            stock: '',
            limit: 10
          })}
          className="text-blue-700 hover:text-blue-900 text-sm font-medium px-3 py-1 bg-blue-100 rounded-md transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

