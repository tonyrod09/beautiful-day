/* ============ FishyBoat — NDBC Buoy Reference (South FL focus) ============
 * Curated NDBC stations relevant to South Florida small-boat fishing.
 * NDBC realtime endpoints don't expose CORS — buoys are shown as reference
 * links to NDBC station pages for live ground-truth conditions.
 */

const NDBC_BUOYS = [
  // ── Miami / South FL Atlantic ──────────────────────────────────────────
  { id: "FWYF1", name: "Fowey Rocks, FL (Miami offshore reef light)", lat: 25.591, lon: -80.097 },
  { id: "41122", name: "Hollywood Beach, FL",                         lat: 25.992, lon: -80.097 },
  { id: "41114", name: "Fort Pierce, FL",                             lat: 27.551, lon: -80.222 },
  { id: "41113", name: "Cape Canaveral Nearshore, FL",                lat: 28.400, lon: -80.530 },
  { id: "41009", name: "Cape Canaveral, FL (20 NM E)",                lat: 28.508, lon: -80.185 },
  { id: "41010", name: "Canaveral East, FL (120 NM offshore)",        lat: 28.878, lon: -78.485 },

  // ── Florida Keys ───────────────────────────────────────────────────────
  { id: "MLRF1", name: "Molasses Reef, FL Keys",                      lat: 25.012, lon: -80.376 },
  { id: "LONF1", name: "Long Key, FL",                                lat: 24.843, lon: -80.862 },
  { id: "SMKF1", name: "Sombrero Key, FL",                            lat: 24.628, lon: -81.110 },
  { id: "SANF1", name: "Sand Key, FL",                                lat: 24.456, lon: -81.876 },

  // ── Florida Gulf approaches ────────────────────────────────────────────
  { id: "42013", name: "Tampa Bay, FL",                               lat: 27.173, lon: -82.924 },
  { id: "42036", name: "West Tampa, FL (106 NM offshore)",            lat: 28.500, lon: -84.508 },
];

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
