import React, { useState } from 'react';
import './PropertyFilters.css';

function PropertyFilters({ onSearch }) {
  const [filters, setFilters] = useState({
    city: '',
    zipcode: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clean up empty strings so they aren't sent as empty params to the API
    const cleanFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() !== '') {
        cleanFilters[key] = filters[key].trim();
      }
    });

    onSearch(cleanFilters);
  };

  const handleClear = () => {
    const reset = {
      city: '',
      zipcode: '',
      minPrice: '',
      maxPrice: '',
      beds: '',
      baths: ''
    };
    setFilters(reset);
    onSearch({}); // Reset results
  };

  return (
    <form className="property-filters" onSubmit={handleSubmit}>
      <div className="filter-group">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          value={filters.city}
          onChange={handleChange}
          placeholder="e.g. Beverly Hills"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="zipcode">Zip Code</label>
        <input
          id="zipcode"
          name="zipcode"
          type="text"
          value={filters.zipcode}
          onChange={handleChange}
          placeholder="e.g. 97201"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="minPrice">Min Price</label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="Min $"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="maxPrice">Max Price</label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="Max $"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="beds">Beds</label>
        <select id="beds" name="beds" value={filters.beds} onChange={handleChange}>
          <option value="">Any Beds</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="baths">Baths</label>
        <select id="baths" name="baths" value={filters.baths} onChange={handleChange}>
          <option value="">Any Baths</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>
      </div>

      <div className="filter-actions">
        <button type="submit" className="btn-search">Search</button>
        <button type="button" className="btn-clear" onClick={handleClear}>
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters; 