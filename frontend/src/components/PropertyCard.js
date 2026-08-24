import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import PropertyImageCarousel from './PropertyImageCarousel';

function PropertyCard({ property }) {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(property.L_ListingID);

    const handleClick = () => {
        navigate(`/property/${property.L_ListingID}`);
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        toggleFavorite(property.L_ListingID);
    };

    return (
        <div className="property-card" onClick={handleClick}>
            <div className="property-image">
                <button
                    className={`favorite-btn ${favorite ? 'is-favorite' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <svg viewBox="0 0 24 24" className="heart-icon">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
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

export default PropertyCard;