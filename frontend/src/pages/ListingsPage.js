import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './ListingsPage.css';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import PropertyImageCarousel from '../components/PropertyImageCarousel';

function ListingsPage() {
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

function PropertyCard({ property }) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/property/${property.L_ListingID}`);
    };

    return (
        <div className="property-card" onClick={handleClick}>
        <div className="property-image">
            <PropertyImageCarousel photos={property.L_Photos} address={property.L_Address} />
        </div>
        <div className="property-info">
        <div className="price">
            {property.L_SystemPrice ? `$${property.L_SystemPrice.toLocaleString()}` : 'Price unavailable'}
        </div>
        <div className="address">{property.L_Address}</div>
        <div className="city">{property.L_City}, {property.L_State}</div>

        <div className="property-details">
        <span>{property.L_Keyword2 ?? '-'} beds</span>
        <span>•</span>
        <span>{property.LM_Dec_3 ?? '-'} baths</span>
        {property.LM_Int2_3 && (
            <>
            <span>•</span>
            <span>{property.LM_Int2_3.toLocaleString()} sqft</span>
            </>
        )}
        </div>
        </div>
        </div>
    );
}
export default ListingsPage;