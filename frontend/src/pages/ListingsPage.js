import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import { useNavigate } from 'react-router-dom';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import PropertyCard from '../components/PropertyCard';
import './ListingsPage.css';

function ListingsPage() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(21);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('ASC');

    useEffect(() => {
        async function loadProperties() {
            try {
                setLoading(true);
                setError(null);
                // offset tells the API how many rows to skip. Page 1 skips 0, page 2 skips itemsPerPage, etc.
                const offset = (currentPage - 1) * itemsPerPage;
                const params = { ...filters, limit: itemsPerPage, offset, ...(sortBy && { sortBy, sortOrder })};
                const data = await fetchProperties(params);
                setProperties(data.results);
                setTotal(data.total);
            } catch (err) {
                setError('Failed to load properties. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        loadProperties();
    }, [filters, currentPage, sortBy, sortOrder, itemsPerPage]);

    const handleSearch = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        setSortBy('');
        setSortOrder('ASC');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    return (
        <div className="listings-page">
            <h1>Property Listings</h1>
            <button onClick={() => navigate('/favorites')} className="btn-favorites">
                ♡ My Favorites
            </button>
            <PropertyFilters onSearch={handleSearch} />

            {loading ? (
                <div className="loading">Loading properties...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : properties.length === 0 ? (
                <p className="no-results">No properties found matching your criteria.</p>
            ) : (
                <>
                <div className="sort-controls">
                    <label htmlFor="sortBy">Sort by: </label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Default</option>
                        <option value="L_SystemPrice">Price</option>
                        <option value="ListingContractDate">Date Listed</option>
                        <option value="LM_Int2_3">Size (Sq Ft)</option>
                        <option value="L_Keyword2">Bedrooms</option>
                    </select>

                    {sortBy && (
                        <select
                            value={sortOrder}
                            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ASC">Low to High</option>
                            <option value="DESC">High to Low</option>
                        </select>
                    )}
                </div>    
                    <p>
                        Showing {(currentPage - 1) * itemsPerPage + 1}
                        –{(currentPage - 1) * itemsPerPage + properties.length} of {total} properties
                    </p>
                    <div className="property-grid">
                        {properties.map(property => (
                            <PropertyCard key={property.L_ListingID} property={property} />
                        ))}
                    </div>
                    
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}

export default ListingsPage;