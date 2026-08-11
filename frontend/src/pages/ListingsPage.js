import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './ListingsPage.css';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import PropertyImageCarousel from '../components/PropertyImageCarousel';

function parsePhotos(rawPhotos) {
  if (!rawPhotos) return [];
  try {
    const parsed = JSON.parse(rawPhotos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(21);

    useEffect(() => {
        loadProperties();
    }, [filters, currentPage]);

    async function loadProperties() {
        try {
            setLoading(true);
            setError(null);
            const offset = (currentPage - 1) * itemsPerPage;
            const data = await fetchProperties({ ...filters, limit: itemsPerPage, offset });
            setProperties(data.results);
            setTotal(data.total);
        } catch (err) {
            setError('Failed to load properties. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
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

    const photos = parsePhotos(property.L_Photos);
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