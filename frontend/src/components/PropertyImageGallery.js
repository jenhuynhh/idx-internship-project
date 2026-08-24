// src/components/PropertyImageGallery.js
import { useState, useEffect } from 'react';
import { parsePhotos } from '../utils/parsePhotos';
import './PropertyImageGallery.css';

function PropertyImageGallery({ photos, address }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const photoList = parsePhotos(photos);

    // Close on Escape / navigate with arrows — attached to document so it fires without focus
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === 0 ? photoList.length - 1 : i - 1));
            if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === photoList.length - 1 ? 0 : i + 1));
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, photoList.length]);

    if (photoList.length === 0) {
        return <div className="gallery-no-image">No photos available</div>;
    }

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };
    const closeLightbox = () => setLightboxOpen(false);
    const lightboxPrev = (e) => {
        e.stopPropagation();
        setLightboxIndex((i) => (i === 0 ? photoList.length - 1 : i - 1));
    };
    const lightboxNext = (e) => {
        e.stopPropagation();
        setLightboxIndex((i) => (i === photoList.length - 1 ? 0 : i + 1));
    };

    return (
        <>
            {/* Main large image */}
            <div className="gallery-main" onClick={() => openLightbox(activeIndex)}>
                <img src={photoList[activeIndex]} alt={address} />
                <div className="gallery-count">{photoList.length} photos — click to view</div>
            </div>

            {/* Thumbnail strip */}
            {photoList.length > 1 && (
                <div className="gallery-thumbnails">
                    {photoList.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`Thumbnail ${i + 1}`}
                            className={`thumbnail ${i === activeIndex ? 'active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ))}
                </div>
            )}

            {/* Lightbox overlay */}
            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>✕</button>
                    <button className="lightbox-arrow left" onClick={lightboxPrev}>‹</button>
                    <img
                        className="lightbox-image"
                        src={photoList[lightboxIndex]}
                        alt={address}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="lightbox-arrow right" onClick={lightboxNext}>›</button>
                    <div className="lightbox-counter">{lightboxIndex + 1} / {photoList.length}</div>
                </div>
            )}
        </>
    );
}

export default PropertyImageGallery;