/**
 * PKC LLC — Fleet Driver Data
 * ============================================
 * SWAP-READY ARCHITECTURE:
 * This file contains simulated driver data for development.
 * To connect to real drivers in production:
 *   1. Replace getDrivers() with your real API call
 *   2. Ensure your API returns objects matching the DRIVER_SCHEMA below
 *   3. Everything else in the app works automatically
 * 
 * DRIVER_SCHEMA:
 * {
 *   id: string,              // Unique driver ID (e.g., "DRV-001")
 *   name: string,            // Full name
 *   cdl: string,             // CDL license number
 *   phone: string,           // Contact phone
 *   truckId: string,         // Truck unit number
 *   trailerType: string,     // "Dry Van" | "Flatbed" | "Reefer" | "Tanker"
 *   status: string,          // "driving" | "break" | "off" | "delivery"
 *   position: { lat, lng },  // Current GPS position
 *   origin: { lat, lng, city },       // Route start
 *   destination: { lat, lng, city },  // Route end
 *   routeProgress: number,   // 0-100 percent
 *   hoursWorkedToday: number,
 *   hoursWorkedWeek: number,
 *   driveTimeRemaining: number, // hours
 *   weeksWillingOut: number,    // max weeks driver will stay on road
 *   weeksOut: number,           // current weeks away from home
 *   currentCity: string,
 *   eta: string,                // e.g., "6h 22m"
 *   milesTotal: number,         // total route miles
 *   milesDriven: number,
 *   milesRemaining: number,
 *   fuelLevel: number,          // 0-100
 *   speed: number,              // current mph
 *   lastUpdate: Date,
 *   deliveries: [{ id, pickup, dropoff, status, eta }]
 * }
 */

// Major US city coordinates for realistic routes
const US_CITIES = {
  'Dallas, TX':        { lat: 32.7767, lng: -96.7970 },
  'Chicago, IL':       { lat: 41.8781, lng: -87.6298 },
  'Los Angeles, CA':   { lat: 34.0522, lng: -118.2437 },
  'Atlanta, GA':       { lat: 33.7490, lng: -84.3880 },
  'Houston, TX':       { lat: 29.7604, lng: -95.3698 },
  'Phoenix, AZ':       { lat: 33.4484, lng: -112.0740 },
  'Philadelphia, PA':  { lat: 39.9526, lng: -75.1652 },
  'Denver, CO':        { lat: 39.7392, lng: -104.9903 },
  'Seattle, WA':       { lat: 47.6062, lng: -122.3321 },
  'Miami, FL':         { lat: 25.7617, lng: -80.1918 },
  'Nashville, TN':     { lat: 36.1627, lng: -86.7816 },
  'Memphis, TN':       { lat: 35.1495, lng: -90.0490 },
  'Kansas City, MO':   { lat: 39.0997, lng: -94.5786 },
  'Indianapolis, IN':  { lat: 39.7684, lng: -86.1581 },
  'Columbus, OH':      { lat: 39.9612, lng: -82.9988 },
  'Charlotte, NC':     { lat: 35.2271, lng: -80.8431 },
  'San Antonio, TX':   { lat: 29.4241, lng: -98.4936 },
  'Jacksonville, FL':  { lat: 30.3322, lng: -81.6557 },
  'Louisville, KY':    { lat: 38.2527, lng: -85.7585 },
  'Milwaukee, WI':     { lat: 43.0389, lng: -87.9065 },
  'Oklahoma City, OK': { lat: 35.4676, lng: -97.5164 },
  'Las Vegas, NV':     { lat: 36.1699, lng: -115.1398 },
  'Portland, OR':      { lat: 45.5152, lng: -122.6784 },
  'St. Louis, MO':     { lat: 38.6270, lng: -90.1994 },
  'New York, NY':      { lat: 40.7128, lng: -74.0060 },
  'Boston, MA':        { lat: 42.3601, lng: -71.0589 },
  'Detroit, MI':       { lat: 42.3314, lng: -83.0458 },
  'Minneapolis, MN':   { lat: 44.9778, lng: -93.2650 },
  'Salt Lake City, UT':{ lat: 40.7608, lng: -111.8910 },
  'Albuquerque, NM':   { lat: 35.0844, lng: -106.6504 },
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolatePosition(origin, destination, progress) {
  const t = progress / 100;
  return {
    lat: lerp(origin.lat, destination.lat, t),
    lng: lerp(origin.lng, destination.lng, t),
  };
}

function formatHours(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

// The 10 simulated CDL drivers
const INITIAL_DRIVERS = [
  {
    id: 'DRV-001', name: 'Marcus Johnson', cdl: 'TX-CDL-884721', phone: '(214) 555-0147',
    truckId: 'TRK-4482', trailerType: 'Dry Van', status: 'driving',
    origin: US_CITIES['Dallas, TX'], originCity: 'Dallas, TX',
    destination: US_CITIES['Chicago, IL'], destCity: 'Chicago, IL',
    routeProgress: 42, hoursWorkedToday: 6.5, hoursWorkedWeek: 38,
    driveTimeRemaining: 4.37, weeksWillingOut: 4, weeksOut: 2,
    milesTotal: 920, fuelLevel: 68, speed: 64,
  },
  {
    id: 'DRV-002', name: 'Angela Williams', cdl: 'CA-CDL-339201', phone: '(310) 555-0293',
    truckId: 'TRK-7710', trailerType: 'Reefer', status: 'driving',
    origin: US_CITIES['Los Angeles, CA'], originCity: 'Los Angeles, CA',
    destination: US_CITIES['Atlanta, GA'], destCity: 'Atlanta, GA',
    routeProgress: 28, hoursWorkedToday: 4.2, hoursWorkedWeek: 22,
    driveTimeRemaining: 6.8, weeksWillingOut: 3, weeksOut: 1,
    milesTotal: 2175, fuelLevel: 81, speed: 67,
  },
  {
    id: 'DRV-003', name: 'Robert Chen', cdl: 'WA-CDL-551087', phone: '(206) 555-0418',
    truckId: 'TRK-2255', trailerType: 'Flatbed', status: 'break',
    origin: US_CITIES['Seattle, WA'], originCity: 'Seattle, WA',
    destination: US_CITIES['Denver, CO'], destCity: 'Denver, CO',
    routeProgress: 55, hoursWorkedToday: 7.8, hoursWorkedWeek: 45,
    driveTimeRemaining: 2.2, weeksWillingOut: 2, weeksOut: 2,
    milesTotal: 1321, fuelLevel: 45, speed: 0,
  },
  {
    id: 'DRV-004', name: 'Patricia Davis', cdl: 'FL-CDL-774509', phone: '(305) 555-0562',
    truckId: 'TRK-9901', trailerType: 'Dry Van', status: 'delivery',
    origin: US_CITIES['Miami, FL'], originCity: 'Miami, FL',
    destination: US_CITIES['Philadelphia, PA'], destCity: 'Philadelphia, PA',
    routeProgress: 91, hoursWorkedToday: 9.5, hoursWorkedWeek: 52,
    driveTimeRemaining: 1.1, weeksWillingOut: 5, weeksOut: 3,
    milesTotal: 1280, fuelLevel: 32, speed: 0,
  },
  {
    id: 'DRV-005', name: 'James Mitchell', cdl: 'MO-CDL-228634', phone: '(816) 555-0781',
    truckId: 'TRK-3347', trailerType: 'Tanker', status: 'driving',
    origin: US_CITIES['Kansas City, MO'], originCity: 'Kansas City, MO',
    destination: US_CITIES['Houston, TX'], destCity: 'Houston, TX',
    routeProgress: 63, hoursWorkedToday: 5.1, hoursWorkedWeek: 30,
    driveTimeRemaining: 5.9, weeksWillingOut: 6, weeksOut: 1,
    milesTotal: 750, fuelLevel: 55, speed: 61,
  },
  {
    id: 'DRV-006', name: 'Diana Torres', cdl: 'AZ-CDL-663198', phone: '(602) 555-0935',
    truckId: 'TRK-6623', trailerType: 'Reefer', status: 'off',
    origin: US_CITIES['Phoenix, AZ'], originCity: 'Phoenix, AZ',
    destination: US_CITIES['Las Vegas, NV'], destCity: 'Las Vegas, NV',
    routeProgress: 0, hoursWorkedToday: 0, hoursWorkedWeek: 48,
    driveTimeRemaining: 11, weeksWillingOut: 3, weeksOut: 3,
    milesTotal: 300, fuelLevel: 92, speed: 0,
  },
  {
    id: 'DRV-007', name: 'Kevin Brown', cdl: 'TN-CDL-419875', phone: '(615) 555-0127',
    truckId: 'TRK-1198', trailerType: 'Dry Van', status: 'driving',
    origin: US_CITIES['Nashville, TN'], originCity: 'Nashville, TN',
    destination: US_CITIES['New York, NY'], destCity: 'New York, NY',
    routeProgress: 35, hoursWorkedToday: 3.8, hoursWorkedWeek: 18,
    driveTimeRemaining: 7.2, weeksWillingOut: 4, weeksOut: 0,
    milesTotal: 886, fuelLevel: 73, speed: 69,
  },
  {
    id: 'DRV-008', name: 'Sandra Lopez', cdl: 'IN-CDL-887432', phone: '(317) 555-0649',
    truckId: 'TRK-5540', trailerType: 'Flatbed', status: 'driving',
    origin: US_CITIES['Indianapolis, IN'], originCity: 'Indianapolis, IN',
    destination: US_CITIES['Charlotte, NC'], destCity: 'Charlotte, NC',
    routeProgress: 72, hoursWorkedToday: 8.1, hoursWorkedWeek: 42,
    driveTimeRemaining: 2.9, weeksWillingOut: 5, weeksOut: 4,
    milesTotal: 536, fuelLevel: 41, speed: 58,
  },
  {
    id: 'DRV-009', name: 'William Harris', cdl: 'MN-CDL-220184', phone: '(612) 555-0372',
    truckId: 'TRK-8874', trailerType: 'Dry Van', status: 'break',
    origin: US_CITIES['Minneapolis, MN'], originCity: 'Minneapolis, MN',
    destination: US_CITIES['St. Louis, MO'], destCity: 'St. Louis, MO',
    routeProgress: 48, hoursWorkedToday: 7.0, hoursWorkedWeek: 35,
    driveTimeRemaining: 3.5, weeksWillingOut: 2, weeksOut: 1,
    milesTotal: 559, fuelLevel: 60, speed: 0,
  },
  {
    id: 'DRV-010', name: 'Lisa Thompson', cdl: 'OR-CDL-556290', phone: '(503) 555-0814',
    truckId: 'TRK-4419', trailerType: 'Reefer', status: 'driving',
    origin: US_CITIES['Portland, OR'], originCity: 'Portland, OR',
    destination: US_CITIES['Salt Lake City, UT'], destCity: 'Salt Lake City, UT',
    routeProgress: 18, hoursWorkedToday: 2.3, hoursWorkedWeek: 12,
    driveTimeRemaining: 8.7, weeksWillingOut: 4, weeksOut: 0,
    milesTotal: 768, fuelLevel: 88, speed: 63,
  },
];

/**
 * Get computed driver state with derived fields.
 * This function builds the full driver object from raw data.
 */
export function buildDriverState(raw) {
  const milesDriven = Math.round(raw.milesTotal * (raw.routeProgress / 100));
  const milesRemaining = raw.milesTotal - milesDriven;
  const avgSpeed = raw.status === 'driving' ? raw.speed : 0;
  const etaHours = avgSpeed > 0 ? milesRemaining / avgSpeed : milesRemaining / 55;
  const position = interpolatePosition(raw.origin, raw.destination, raw.routeProgress);
  const currentCity = estimateCity(position);

  return {
    ...raw,
    position,
    milesDriven,
    milesRemaining,
    eta: formatHours(etaHours),
    currentCity,
    lastUpdate: new Date(),
    deliveries: generateDeliveries(raw),
  };
}

function estimateCity(pos) {
  let closest = 'En Route';
  let minDist = Infinity;
  for (const [city, coords] of Object.entries(US_CITIES)) {
    const d = Math.sqrt((pos.lat - coords.lat) ** 2 + (pos.lng - coords.lng) ** 2);
    if (d < minDist) { minDist = d; closest = city; }
  }
  return minDist < 2 ? `Near ${closest}` : closest;
}

function generateDeliveries(driver) {
  return [
    {
      id: `DEL-${driver.id.split('-')[1]}01`,
      pickup: driver.originCity,
      dropoff: driver.destCity,
      status: driver.routeProgress >= 90 ? 'delivered' : driver.routeProgress > 0 ? 'transit' : 'pending',
      milesRemaining: driver.milesTotal - Math.round(driver.milesTotal * (driver.routeProgress / 100)),
    }
  ];
}

/**
 * GET ALL DRIVERS
 * ================================================
 * PRODUCTION SWAP: Replace this function body with:
 *   const res = await fetch('https://your-api.pkc-llc.com/api/drivers');
 *   const data = await res.json();
 *   return data.map(buildDriverState);
 * ================================================
 */
export function getInitialDrivers() {
  return INITIAL_DRIVERS.map(buildDriverState);
}

/**
 * SIMULATE REAL-TIME UPDATES
 * In production, replace with WebSocket or polling from your API.
 */
export function simulateDriverUpdate(driver) {
  const updated = { ...driver };

  if (updated.status === 'driving') {
    // Advance progress
    updated.routeProgress = Math.min(100, updated.routeProgress + (Math.random() * 0.3 + 0.05));
    updated.hoursWorkedToday = Math.min(11, updated.hoursWorkedToday + 0.01);
    updated.hoursWorkedWeek = Math.min(60, updated.hoursWorkedWeek + 0.01);
    updated.driveTimeRemaining = Math.max(0, updated.driveTimeRemaining - 0.01);
    updated.fuelLevel = Math.max(5, updated.fuelLevel - 0.02);
    updated.speed = 55 + Math.floor(Math.random() * 15);

    // Auto transitions
    if (updated.driveTimeRemaining <= 0) updated.status = 'break';
    if (updated.routeProgress >= 98) { updated.status = 'delivery'; updated.speed = 0; }
    if (updated.fuelLevel < 10) updated.speed = Math.max(45, updated.speed - 10);
  }
  else if (updated.status === 'break') {
    updated.speed = 0;
    // Randomly resume driving
    if (Math.random() < 0.005) {
      updated.status = 'driving';
      updated.driveTimeRemaining = 8;
    }
  }
  else if (updated.status === 'delivery') {
    updated.speed = 0;
    // Randomly complete delivery and start new route
    if (Math.random() < 0.002) {
      updated.status = 'driving';
      updated.routeProgress = 0;
      updated.driveTimeRemaining = 11;
      const cities = Object.keys(US_CITIES);
      const newDest = cities[Math.floor(Math.random() * cities.length)];
      updated.origin = updated.destination;
      updated.originCity = updated.destCity;
      updated.destination = US_CITIES[newDest];
      updated.destCity = newDest;
      updated.milesTotal = 400 + Math.floor(Math.random() * 1800);
      updated.fuelLevel = 95;
    }
  }
  else if (updated.status === 'off') {
    updated.speed = 0;
    if (Math.random() < 0.003) {
      updated.status = 'driving';
      updated.hoursWorkedToday = 0;
      updated.driveTimeRemaining = 11;
    }
  }

  return buildDriverState(updated);
}

export { US_CITIES };
