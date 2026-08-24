import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
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
                            <PropertyCard key={property.L_ListingID} property={property} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default FavoritesPage;