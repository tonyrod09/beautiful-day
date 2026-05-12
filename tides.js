/* ============ Beautiful Day — NOAA Tide Predictions ============
 * Uses the NOAA CO-OPS Tides & Currents API (CORS-enabled, no key required).
 * https://api.tidesandcurrents.noaa.gov/api/prod/datagetter
 *
 * Relies on distanceMi() from buoys.js (must be loaded first).
 */

const TidesModule = (() => {

  // Curated NOAA CO-OPS tide-prediction stations. FL-focused; major US coasts included.
  const STATIONS = [
    // ── Florida Keys & South FL ──────────────────────────────────────────────
    { id: "8724580", name: "Key West, FL",             lat: 24.551, lon: -81.808 },
    { id: "8723970", name: "Vaca Key, FL",             lat: 24.711, lon: -81.106 },
    { id: "8723214", name: "Virginia Key, FL",         lat: 25.731, lon: -80.162 },
    { id: "8722956", name: "Lake Worth Pier, FL",      lat: 26.612, lon: -80.034 },
    { id: "8722669", name: "Lake Worth, FL",           lat: 26.668, lon: -80.037 },
    // ── Florida East Coast ───────────────────────────────────────────────────
    { id: "8721604", name: "Trident Pier, FL",         lat: 28.415, lon: -80.593 },
    { id: "8720587", name: "St. Augustine, FL",        lat: 29.869, lon: -81.312 },
    { id: "8720218", name: "Mayport, FL",              lat: 30.397, lon: -81.428 },
    // ── Florida Gulf Coast ───────────────────────────────────────────────────
    { id: "8726384", name: "Port Manatee, FL",         lat: 27.639, lon: -82.563 },
    { id: "8726520", name: "St. Petersburg, FL",       lat: 27.760, lon: -82.627 },
    { id: "8727520", name: "Cedar Key, FL",            lat: 29.135, lon: -83.032 },
    { id: "8729108", name: "Panama City, FL",          lat: 30.152, lon: -85.666 },
    { id: "8729840", name: "Pensacola, FL",            lat: 30.404, lon: -87.211 },
    // ── Southeast / Mid-Atlantic ─────────────────────────────────────────────
    { id: "8735180", name: "Dauphin Island, AL",       lat: 30.250, lon: -88.075 },
    { id: "8747437", name: "Bay Waveland, MS",         lat: 30.325, lon: -89.324 },
    { id: "8670870", name: "Fort Pulaski, GA",         lat: 32.035, lon: -80.902 },
    { id: "8665530", name: "Charleston, SC",           lat: 32.782, lon: -79.925 },
    { id: "8661070", name: "Springmaid Pier, SC",      lat: 33.655, lon: -78.918 },
    { id: "8658120", name: "Wilmington, NC",           lat: 34.227, lon: -77.953 },
    { id: "8656483", name: "Beaufort, NC",             lat: 34.717, lon: -76.667 },
    { id: "8651370", name: "Duck, NC",                 lat: 36.183, lon: -75.747 },
    { id: "8638610", name: "Sewells Point, VA",        lat: 36.947, lon: -76.330 },
    { id: "8570283", name: "Ocean City Inlet, MD",     lat: 38.329, lon: -75.091 },
    { id: "8557380", name: "Lewes, DE",                lat: 38.782, lon: -75.119 },
    { id: "8531680", name: "Sandy Hook, NJ",           lat: 40.467, lon: -74.009 },
    { id: "8518750", name: "The Battery, NY",          lat: 40.700, lon: -74.014 },
    { id: "8516945", name: "Kings Point, NY",          lat: 40.810, lon: -73.765 },
    // ── New England ──────────────────────────────────────────────────────────
    { id: "8461490", name: "New London, CT",           lat: 41.360, lon: -72.090 },
    { id: "8452660", name: "Newport, RI",              lat: 41.505, lon: -71.327 },
    { id: "8449130", name: "Nantucket, MA",            lat: 41.285, lon: -70.097 },
    { id: "8443970", name: "Boston, MA",               lat: 42.360, lon: -71.052 },
    { id: "8410140", name: "Eastport, ME",             lat: 44.904, lon: -66.985 },
    // ── Gulf of Mexico ───────────────────────────────────────────────────────
    { id: "8761724", name: "Grand Isle, LA",           lat: 29.263, lon: -89.957 },
    { id: "8771450", name: "Galveston Pier 21, TX",    lat: 29.310, lon: -94.793 },
    { id: "8775870", name: "Corpus Christi, TX",       lat: 27.580, lon: -97.216 },
    // ── West Coast ───────────────────────────────────────────────────────────
    { id: "9410230", name: "La Jolla, CA",             lat: 32.867, lon: -117.257 },
    { id: "9410660", name: "Los Angeles, CA",          lat: 33.720, lon: -118.272 },
    { id: "9413450", name: "Monterey, CA",             lat: 36.605, lon: -121.889 },
    { id: "9414290", name: "San Francisco, CA",        lat: 37.806, lon: -122.465 },
    { id: "9418767", name: "North Spit, CA",           lat: 40.767, lon: -124.217 },
    { id: "9419750", name: "Crescent City, CA",        lat: 41.745, lon: -124.184 },
    { id: "9435380", name: "South Beach, OR",          lat: 44.625, lon: -124.044 },
    { id: "9439040", name: "Astoria, OR",              lat: 46.207, lon: -123.768 },
    { id: "9441102", name: "Westport, WA",             lat: 46.904, lon: -124.105 },
    { id: "9447130", name: "Seattle, WA",              lat: 47.603, lon: -122.339 },
    { id: "9444900", name: "Port Townsend, WA",        lat: 48.113, lon: -122.760 },
    // ── Hawaii ───────────────────────────────────────────────────────────────
    { id: "1612340", name: "Honolulu, HI",             lat: 21.307, lon: -157.867 },
    { id: "1617760", name: "Hilo, HI",                 lat: 19.730, lon: -155.060 },
    // ── Alaska ───────────────────────────────────────────────────────────────
    { id: "9452210", name: "Juneau, AK",               lat: 58.300, lon: -134.412 },
    { id: "9455920", name: "Anchorage, AK",            lat: 61.238, lon: -149.890 },
    // ── Puerto Rico ──────────────────────────────────────────────────────────
    { id: "9755371", name: "San Juan, PR",             lat: 18.459, lon: -66.116 },
  ];

  function nearestStation(lat, lon) {
    return STATIONS
      .map((s) => ({ ...s, distanceMi: distanceMi(lat, lon, s.lat, s.lon) }))
      .sort((a, b) => a.distanceMi - b.distanceMi)[0];
  }

  async function fetchTidePredictions(stationId, dateStr) {
    const d = dateStr.replace(/-/g, "");
    const url =
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
      `?station=${stationId}` +
      `&begin_date=${d}&end_date=${d}` +
      `&product=predictions&datum=MLLW&time_zone=lst_ldt` +
      `&interval=hilo&units=english` +
      `&application=BeautifulDay&format=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`NOAA HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return (data.predictions || []).map((p) => ({
      time:  p.t.slice(11, 16),                  // "HH:MM" station local time
      hours: timeToHours(p.t.slice(11, 16)),
      v:     parseFloat(p.v),
      type:  p.type,                              // "H" or "L"
    }));
  }

  function timeToHours(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  }

  // Piecewise cosine interpolation — the standard approximation for tidal curves.
  function interpolateTideAt(tHours, predictions) {
    if (!predictions.length) return null;
    if (tHours <= predictions[0].hours) return predictions[0].v;
    if (tHours >= predictions[predictions.length - 1].hours)
      return predictions[predictions.length - 1].v;

    let i = 0;
    while (i < predictions.length - 1 && predictions[i + 1].hours <= tHours) i++;
    const p0 = predictions[i];
    const p1 = predictions[i + 1];
    const frac = (tHours - p0.hours) / (p1.hours - p0.hours);
    return (p0.v + p1.v) / 2 + (p0.v - p1.v) / 2 * Math.cos(Math.PI * frac);
  }

  return { nearestStation, fetchTidePredictions, interpolateTideAt, timeToHours };
})();
