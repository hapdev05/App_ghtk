import axios from 'axios';

const API_KEY = "iH79Oa5yjwAgU0hiDV23Ezc3F0rvdF8iZkj92dFa_Jw";

interface GeoLocation {
  lat: number;
  long: number;
}

interface GeocodingResult {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  items: any[];
}

/**
 * Convert coordinates to address using HERE Reverse Geocoding API
 */
export const reverseGeoCode = async ({ lat, long }: GeoLocation): Promise<GeocodingResult | null> => {
  const api = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${long}&lang=en-US&apiKey=${API_KEY}`;
  
  try {
    const res = await axios.get(api);
    
    if (res && res.status === 200 && res.data) {
      const items = res.data.items;
      
      if (items && items.length > 0) {
        const item = items[0];
        return {
          address: item.address?.label || '',
          city: item.address?.city || '',
          country: item.address?.countryName || '',
          postalCode: item.address?.postalCode || '',
          items: items
        };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error in reverse geocoding:', error);
    return null;
  }
};

/**
 * Convert address to coordinates using HERE Geocoding API
 */
export const forwardGeoCode = async (address: string): Promise<GeoLocation | null> => {
  // Ensure address is properly encoded for URL
  const encodedAddress = encodeURIComponent(address);
  const api = `https://geocode.search.hereapi.com/v1/geocode?q=${encodedAddress}&apiKey=${API_KEY}`;
  
  try {
    const res = await axios.get(api);
    
    if (res && res.status === 200 && res.data && res.data.items && res.data.items.length > 0) {
      const position = res.data.items[0].position;
      if (position && position.lat && position.lng) {
        return {
          lat: position.lat,
          long: position.lng
        };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error in forward geocoding:', error);
    return null;
  }
}; 