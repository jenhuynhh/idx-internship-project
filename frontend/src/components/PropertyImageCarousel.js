import { useState } from 'react';
import './PropertyImageCarousel.css';

function parsePhotos(rawPhotos) {
    if (!rawPhotos) return [];
    try {
        const parsed = JSON.parse(rawPhotos);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function PropertyImageCarousel({ photos: rawPhotos, address }) {
    const photos = parsePhotos(rawPhotos);
    const [index, setIndex] = useState(0);

    if (photos.length === 0) {
        return <div className="carousel-no-image">No photo</div>;
    }

    const goPrev = (e) => {
        e.stopPropagation();   // don't trigger the card's navigation
        setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    };
    const goNext = (e) => {
        e.stopPropagation();
        setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
    };

    return (
        <div className="carousel">
            <img src={photos[index]} alt={address} className="carousel-image" />

            {photos.length > 1 && (
                <>
                    <button className="carousel-arrow left" onClick={goPrev}>‹</button>
                    <button className="carousel-arrow right" onClick={goNext}>›</button>
                    <div className="carousel-counter">{index + 1} / {photos.length}</div>
                </>
            )}
        </div>
    );
}

export default PropertyImageCarousel;