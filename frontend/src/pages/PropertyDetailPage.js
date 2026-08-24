import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPropertyDetail, fetchOpenHouses } from '../api/client';
import PropertyImageGallery from '../components/PropertyImageGallery';
import PropertyMap from '../components/PropertyMap';
import './PropertyDetailPage.css';

function getOpenHouseRemarks(rawAllData) {
    if (!rawAllData) return null;
    try {
        const data = JSON.parse(rawAllData);
        return data?.OpenHouseRemarks || null;
    } catch {
        return null;
    }
}

function PropertyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [openHouses, setOpenHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPropertyData() {
            try {
                setLoading(true);
                setError(null);
                const [propertyData, openHousesData] = await Promise.all([
                    fetchPropertyDetail(id),
                    fetchOpenHouses(id)
                ]);
                setProperty(propertyData);
                setOpenHouses(openHousesData.openhouses || []);
            } catch (err) {
                setError(err.message || 'Failed to load property details');
            } finally {
                setLoading(false);
            }
        }
        loadPropertyData();
    }, [id]);

    if (loading) return <div className="loading">Loading property details...</div>;
    if (error) {
        return (
            <div className="error-container">
                <div className="error">{error}</div>
                <button onClick={() => navigate('/')} className="btn-back">Back to Listings</button>
            </div>
        );
    }
    if (!property) return null;

    return (
        <div className="property-detail-page">
            <button onClick={() => navigate('/')} className="btn-back">← Back to Listings</button>

            <div className="property-header">
                <h1>
                    {property.L_SystemPrice ? `$${property.L_SystemPrice.toLocaleString()}` : 'Price unavailable'}
                </h1>
                <p className="property-address">{property.L_Address}</p>
                <p className="property-location">
                    {property.L_City}, {property.L_State} {property.L_Zip}
                </p>
            </div>
            <PropertyImageGallery photos={property.L_Photos} address={property.L_Address} />

            <div className="property-stats">
                <div className="stat">
                    <div className="stat-value">{property.L_Keyword2 ?? '-'}</div>
                    <div className="stat-label">Bedrooms</div>
                </div>
                <div className="stat">
                    <div className="stat-value">{property.LM_Dec_3 ?? '-'}</div>
                    <div className="stat-label">Bathrooms</div>
                </div>
                {property.LM_Int2_3 && (
                    <div className="stat">
                        <div className="stat-value">{property.LM_Int2_3.toLocaleString()}</div>
                        <div className="stat-label">Sq Ft</div>
                    </div>
                )}
                {property.YearBuilt && (
                    <div className="stat">
                        <div className="stat-value">{property.YearBuilt}</div>
                        <div className="stat-label">Year Built</div>
                    </div>
                )}
            </div>

            {property.L_Remarks && (
                <div className="property-section">
                    <h2>Description</h2>
                    <p className="property-description">{property.L_Remarks}</p>
                </div>
            )}
            {property.LMD_MP_Latitude && property.LMD_MP_Longitude && (
                <div className="property-section">
                    <h2>Location</h2>
                    <PropertyMap
                        lat={property.LMD_MP_Latitude}
                        lng={property.LMD_MP_Longitude}
                        address={property.L_Address}
                        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                    />
                </div>
            )}
            <div className="property-section">
                <h2>Open Houses</h2>
                {openHouses.length > 0 ? (
                    <div className="open-houses-list">
                        {openHouses.map((oh, index) => (
                            <div key={index} className="open-house-item">
                                <div className="oh-date">
                                    {new Date(oh.OpenHouseDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="oh-time">
                                    {oh.OH_StartTime} – {oh.OH_EndTime}
                                </div>
                                {getOpenHouseRemarks(oh.all_data) && (
                                    <div className="oh-remarks">{getOpenHouseRemarks(oh.all_data)}</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-open-houses">No open houses scheduled</p>
                )}
            </div>
        </div>
    );
}

export default PropertyDetailPage;