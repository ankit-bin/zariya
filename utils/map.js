import fetch from 'node-fetch';

export const searchLocation = async (query) => {
    try {
        // Using OpenStreetMap Nominatim API for location search
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
            {
                headers: {
                    'User-Agent': 'ZARIYA/1.0' // Required by Nominatim's usage policy
                }
            }
        );

        const data = await response.json();
        
        // Format the response to include only relevant information
        return data.map(location => ({
            displayName: location.display_name,
            lat: location.lat,
            lon: location.lon,
            type: location.type,
            importance: location.importance
        }));
    } catch (error) {
        console.error('Error searching location:', error);
        throw new Error('Failed to fetch location suggestions');
    }
};

export const validateLocation = async (location) => {
    try {
        const suggestions = await searchLocation(location);
        if (suggestions.length > 0) {
            // Return the most relevant result (highest importance)
            return suggestions[0];
        }
        return null;
    } catch (error) {
        console.error('Error validating location:', error);
        throw new Error('Failed to validate location');
    }
}; 