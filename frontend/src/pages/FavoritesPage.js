import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { fetchPropertyDetail } from '../api/client';
import './ListingsPage.css';

function FavoritesPage() {
    const navigate = useNavigate();
    const { favorites } = useFavorites();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFavorites() {
            setLoading(true);
            try {
                // Fetch each favorited property by its ID, in parallel
                const results = await Promise.all(
                    favorites.map((id) => fetchPropertyDetail(id).catch(() => null))
                );
                // Drop any that failed (e.g. a favorited property that no longer exists)
                setProperties(results.filter((p) => p !== null));
            } catch (err) {
                setProperties([]);
            } finally {
                setLoading(false);
            }
        }
        loadFavorites();
    }, [favorites]);

    return (
        <div className="listings-page">
            <button onClick={() => navigate('/')} className="btn-back">← Back to Listings</button>
            <h1>My Favorites</h1>

            {loading ? (
                <div className="loading">Loading your favorites...</div>
            ) : properties.length === 0 ? (
                <p className="no-results">You haven't saved any favorites yet. Click the heart on a property to save it.</p>
            ) : (
                <>
                    <p>{properties.length} saved {properties.length === 1 ? 'property' : 'properties'}</p>
                    <div className="property-grid">
                        {properties.map((property) => (
                            <FavoriteCard key={property.L_ListingID} property={property} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function FavoriteCard({ property }) {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(property.L_ListingID);

    return (
        <div className="property-card" onClick={() => navigate(`/property/${property.L_ListingID}`)}>
            <div className="property-image">
                <button
                    className={`favorite-btn ${favorite ? 'is-favorite' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(property.L_ListingID); }}
                    aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <svg viewBox="0 0 24 24" className="heart-icon">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
                <img
                    src={JSON.parse(property.L_Photos || '[]')[0] || ''}
                    alt={property.L_Address}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className="property-info">
                <div className="price">
                    {property.L_SystemPrice ? `$${property.L_SystemPrice.toLocaleString()}` : 'Price unavailable'}
                </div>
                <div className="address">{property.L_Address}</div>
                <div className="city">{property.L_City}, {property.L_State}</div>
            </div>
        </div>
    );
}

export default FavoritesPage;