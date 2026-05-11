/* ============ NDBC Buoy Station Reference ============
 * Curated list of well-known NDBC stations along US coasts.
 * Coordinates and station IDs verified from NDBC station pages.
 * Link format: https://www.ndbc.noaa.gov/station_page.php?station=<id>
 */

const NDBC_BUOYS = [
  // East Coast (North)
  { id: "44011", name: "Georges Bank, MA",            lat: 41.105, lon: -66.586 },
  { id: "44008", name: "Nantucket, MA (54 NM SE)",    lat: 40.502, lon: -69.247 },
  { id: "44017", name: "Montauk Point, NY",           lat: 40.694, lon: -72.049 },
  { id: "44025", name: "Long Island, NY (33 NM S)",   lat: 40.251, lon: -73.164 },
  { id: "44065", name: "New York Harbor Entrance",    lat: 40.369, lon: -73.703 },
  { id: "44091", name: "Barnegat, NJ",                lat: 39.778, lon: -73.769 },
  { id: "44009", name: "Delaware Bay (26 NM SE)",     lat: 38.457, lon: -74.702 },
  { id: "44089", name: "Wallops Island, VA",          lat: 37.756, lon: -75.334 },
  { id: "44014", name: "Virginia Beach, VA (64 NM E)",lat: 36.611, lon: -74.842 },

  // East Coast (Carolinas / Southeast)
  { id: "44095", name: "Oregon Inlet, NC",            lat: 35.751, lon: -75.330 },
  { id: "41001", name: "East Hatteras, NC (150 NM E)",lat: 34.704, lon: -72.317 },
  { id: "41013", name: "Frying Pan Shoals, NC",       lat: 33.441, lon: -77.764 },
  { id: "41110", name: "Masonboro Inlet, NC",         lat: 34.141, lon: -77.717 },
  { id: "41004", name: "Edisto, SC (41 NM SE)",       lat: 32.501, lon: -79.099 },
  { id: "41008", name: "Grays Reef, GA",              lat: 31.402, lon: -80.866 },
  { id: "41112", name: "Fernandina Beach, FL",        lat: 30.709, lon: -81.292 },
  { id: "41117", name: "St. Augustine, FL",           lat: 29.999, lon: -81.079 },

  // Florida East / Bahamas approaches
  { id: "41009", name: "Canaveral, FL (20 NM E)",     lat: 28.508, lon: -80.185 },
  { id: "41010", name: "Canaveral East, FL (120 NM)", lat: 28.878, lon: -78.485 },
  { id: "41114", name: "Fort Pierce, FL",             lat: 27.551, lon: -80.222 },
  { id: "41113", name: "Cape Canaveral Nearshore",    lat: 28.400, lon: -80.530 },
  { id: "41009", name: "Cape Canaveral, FL",          lat: 28.508, lon: -80.185 },
  { id: "41122", name: "Hollywood Beach, FL",         lat: 25.992, lon: -80.097 },

  // Florida Keys / Straits
  { id: "41043", name: "NE Puerto Rico (170 NM)",     lat: 21.124, lon: -64.856 },
  { id: "MLRF1", name: "Molasses Reef, FL Keys",      lat: 25.012, lon: -80.376 },
  { id: "LONF1", name: "Long Key, FL",                lat: 24.843, lon: -80.862 },
  { id: "SANF1", name: "Sand Key, FL",                lat: 24.456, lon: -81.876 },
  { id: "SMKF1", name: "Sombrero Key, FL",            lat: 24.628, lon: -81.110 },
  { id: "FWYF1", name: "Fowey Rocks, FL",             lat: 25.591, lon: -80.097 },

  // Gulf of Mexico
  { id: "42036", name: "West Tampa, FL (106 NM)",     lat: 28.500, lon: -84.508 },
  { id: "42013", name: "Tampa Bay, FL",               lat: 27.173, lon: -82.924 },
  { id: "42022", name: "Cape San Blas, FL",           lat: 27.503, lon: -83.741 },
  { id: "42039", name: "Pensacola, FL (115 NM SE)",   lat: 28.788, lon: -86.008 },
  { id: "42040", name: "Mobile South, AL (64 NM)",    lat: 29.205, lon: -88.226 },
  { id: "42007", name: "Biloxi, MS",                  lat: 30.090, lon: -88.769 },
  { id: "42012", name: "Orange Beach, AL",            lat: 30.064, lon: -87.555 },
  { id: "42001", name: "Mid Gulf",                    lat: 25.897, lon: -89.667 },
  { id: "42002", name: "West Gulf",                   lat: 26.094, lon: -93.758 },
  { id: "42019", name: "Freeport, TX (60 NM S)",      lat: 27.910, lon: -95.345 },
  { id: "42020", name: "Corpus Christi, TX (60 NM)",  lat: 26.967, lon: -96.694 },
  { id: "42035", name: "Galveston, TX (22 NM E)",     lat: 29.234, lon: -94.413 },
  { id: "42043", name: "Matagorda Bay, TX",           lat: 28.310, lon: -96.408 },
  { id: "42045", name: "Pensacola South, FL",         lat: 30.041, lon: -88.207 },

  // West Coast (CA)
  { id: "46232", name: "Point Loma South, CA",        lat: 32.530, lon: -117.434 },
  { id: "46086", name: "San Clemente Basin, CA",      lat: 32.499, lon: -118.034 },
  { id: "46222", name: "San Pedro, CA",               lat: 33.618, lon: -118.317 },
  { id: "46221", name: "Santa Monica Bay, CA",        lat: 33.855, lon: -118.633 },
  { id: "46219", name: "San Nicolas Is., CA",         lat: 33.224, lon: -119.881 },
  { id: "46025", name: "Santa Monica Basin, CA",      lat: 33.755, lon: -119.045 },
  { id: "46054", name: "West Santa Barbara, CA",      lat: 34.265, lon: -120.477 },
  { id: "46053", name: "East Santa Barbara, CA",      lat: 34.241, lon: -119.840 },
  { id: "46011", name: "Santa Maria, CA",             lat: 34.956, lon: -121.019 },
  { id: "46028", name: "Cape San Martin, CA",         lat: 35.741, lon: -121.884 },
  { id: "46042", name: "Monterey Bay, CA",            lat: 36.785, lon: -122.398 },
  { id: "46026", name: "San Francisco, CA",           lat: 37.755, lon: -122.839 },
  { id: "46237", name: "SF Bar, CA",                  lat: 37.787, lon: -122.633 },
  { id: "46013", name: "Bodega Bay, CA",              lat: 38.253, lon: -123.317 },
  { id: "46014", name: "Pt. Arena, CA",               lat: 39.235, lon: -123.974 },

  // Pacific Northwest
  { id: "46022", name: "Eel River, CA",               lat: 40.703, lon: -124.577 },
  { id: "46027", name: "St. Georges, CA",             lat: 41.852, lon: -124.382 },
  { id: "46015", name: "Port Orford, OR",             lat: 42.764, lon: -124.832 },
  { id: "46050", name: "Stonewall Bank, OR",          lat: 44.669, lon: -124.546 },
  { id: "46089", name: "Tillamook, OR",               lat: 45.893, lon: -125.819 },
  { id: "46029", name: "Columbia River Bar",          lat: 46.144, lon: -124.485 },
  { id: "46087", name: "Neah Bay, WA",                lat: 48.494, lon: -124.728 },
  { id: "46088", name: "New Dungeness, WA",           lat: 48.334, lon: -123.180 },

  // Hawaii
  { id: "51001", name: "NW Hawaii",                   lat: 24.453, lon: -162.008 },
  { id: "51002", name: "SW Hawaii",                   lat: 17.043, lon: -157.696 },
  { id: "51003", name: "Western Hawaii",              lat: 19.196, lon: -160.582 },
  { id: "51004", name: "SE Hawaii",                   lat: 17.538, lon: -152.235 },
  { id: "51101", name: "NW Hawaii Outer",             lat: 24.359, lon: -162.075 },

  // Great Lakes
  { id: "45001", name: "Mid Superior",                lat: 48.061, lon: -87.793 },
  { id: "45002", name: "N. Michigan",                 lat: 45.344, lon: -86.411 },
  { id: "45003", name: "N. Huron",                    lat: 45.351, lon: -82.840 },
  { id: "45004", name: "E. Superior",                 lat: 47.585, lon: -86.586 },
  { id: "45005", name: "W. Erie",                     lat: 41.677, lon: -82.398 },
  { id: "45007", name: "S. Michigan",                 lat: 42.674, lon: -87.026 },
  { id: "45012", name: "Lake Ontario",                lat: 43.619, lon: -77.405 },

  // Alaska
  { id: "46001", name: "Gulf of Alaska",              lat: 56.232, lon: -147.949 },
  { id: "46066", name: "S. Kodiak",                   lat: 52.785, lon: -155.047 },
];

/* Distance in miles between two lat/lon points (haversine) */
function distanceMi(lat1, lon1, lat2, lon2) {
  const R = 3958.756;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestBuoys(lat, lon, n = 5) {
  return NDBC_BUOYS
    .map((b) => ({ ...b, distanceMi: distanceMi(lat, lon, b.lat, b.lon) }))
    .sort((a, b) => a.distanceMi - b.distanceMi)
    .slice(0, n);
}
