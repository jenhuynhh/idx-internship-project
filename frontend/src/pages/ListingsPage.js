import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import './ListingsPage.css';

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
    
    useEffect(() => {
        loadProperties();
    }, []);
 
    async function loadProperties() {
        try {
            setLoading(true);
            setError(null);

            const data = await fetchProperties({ limit: 20, offset: 0 });

            setProperties(data.results);
            setTotal(data.total);
        } catch (err) {
            setError('Failed to load properties. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    if (loading) {
        return <div className="loading">Loading properties...</div>;
    }
    if (error) {
        return <div className="error">{error}</div>;
    }
    return (
        <div className="listings-page">
        <h1>Property Listings</h1>
        <p>Showing {properties.length} of {total} properties</p>

        <div className="property-grid">
        {properties.map(property => (
            <PropertyCard key={property.L_ListingID} property={property} />
        ))}
        </div>
    </div>
 );
}

function PropertyCard({ property }) {
    const photos = parsePhotos(property.L_Photos);
    return (
        <div className="property-card">
        <div className="property-image">
        {photos.length > 0 ? (
            <img src={photos[0]} alt={property.L_Address} />
        ) : (
        <div className="no-image">No photo</div>
        )}

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