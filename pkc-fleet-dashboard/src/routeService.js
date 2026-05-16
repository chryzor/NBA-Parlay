/**
 * PKC LLC — Route Service
 * ============================================
 * Uses OSRM (Open Source Routing Machine) for real road-based routing.
 * Uses Nominatim for geocoding city names to coordinates.
 * Both APIs are FREE with no API key required.
 * 
 * PRODUCTION NOTES:
 * - For high-volume production use, consider self-hosting OSRM
 * - Or swap to Google Maps / Mapbox APIs with your API keys
 * - The interface remains the same regardless of backend
 */

const OSRM_BASE = 'https://router.project-osrm.org';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Geocode a city name to coordinates
 * @param {string} cityName - e.g., "Dallas, TX"
 * @returns {Promise<{lat: number, lng: number, display: string}>}
 */
export async function geocodeCity(cityName) {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(cityName)}&countrycodes=us&limit=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display: data[0].display_name,
      };
    }
    throw new Error(`City not found: ${cityName}`);
  } catch (err) {
    console.error('Geocode error:', err);
    return null;
  }
}

/**
 * Reverse geocode coordinates to a city name
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.county || 'Unknown';
      const state = data.address.state || '';
      return `${city}, ${state}`;
    }
    return 'Unknown Location';
  } catch {
    return 'Unknown Location';
  }
}

/**
 * Calculate a route between two points using OSRM
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {string} profile - "fastest" or "shortest" (OSRM uses "driving")
 * @returns {Promise<{ distance: number, duration: number, geometry: [number, number][] }>}
 *   distance in miles, duration in hours, geometry as [lat, lng] pairs
 */
export async function calculateRoute(origin, destination, profile = 'fastest') {
  try {
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Pick the route based on profile
    let route;
    if (profile === 'shortest' && data.routes.length > 1) {
      // Pick the route with shortest distance
      route = data.routes.reduce((a, b) => a.distance < b.distance ? a : b);
    } else {
      // Default: fastest (first route from OSRM is typically fastest)
      route = data.routes[0];
    }

    const distanceMiles = route.distance * 0.000621371; // meters to miles
    const durationHours = route.duration / 3600; // seconds to hours

    // Convert GeoJSON coordinates [lng, lat] to [lat, lng] for Leaflet
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      distance: Math.round(distanceMiles),
      duration: durationHours,
      durationFormatted: formatDuration(durationHours),
      geometry,
      fuelEstimate: Math.round(distanceMiles / 6.5), // ~6.5 mpg for semi truck
      fuelCost: (Math.round(distanceMiles / 6.5) * 3.50).toFixed(2), // $3.50/gal avg
      alternatives: data.routes.length,
    };
  } catch (err) {
    console.error('Route calculation error:', err);
    return null;
  }
}

/**
 * Calculate route between two city names (combines geocoding + routing)
 */
export async function calculateRouteByCity(originCity, destCity) {
  const origin = await geocodeCity(originCity);
  const dest = await geocodeCity(destCity);

  if (!origin || !dest) {
    return { error: 'Could not geocode one or both cities' };
  }

  const fastest = await calculateRoute(origin, dest, 'fastest');
  
  if (!fastest) {
    return { error: 'Could not calculate route' };
  }

  return {
    origin: { ...origin, city: originCity },
    destination: { ...dest, city: destCity },
    ...fastest,
  };
}

function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/**
 * Haversine distance between two points (straight line, in miles)
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
