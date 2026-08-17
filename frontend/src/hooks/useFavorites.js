import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('favoriteProperties');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (propertyId) => {
        setFavorites((prev) =>
            prev.includes(propertyId) ? prev : [...prev, propertyId]
        );
    };

    const removeFavorite = (propertyId) => {
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
    };

    const toggleFavorite = (propertyId) => {
    // Read the freshest value from localStorage, not stale React state
    let current = [];
    try {
        const stored = localStorage.getItem('favoriteProperties');
        current = stored ? JSON.parse(stored) : [];
    } catch {
        current = [];
    }

    const updated = current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId];

    localStorage.setItem('favoriteProperties', JSON.stringify(updated));
    setFavorites(updated);
};

    const isFavorite = (propertyId) => favorites.includes(propertyId);

    return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}