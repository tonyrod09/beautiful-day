/* ============ FishyBoat — NOAA Tide Predictions (South FL focus) ============
 * Uses NOAA CO-OPS Tides & Currents API (CORS-enabled, no key required).
 * Depends on distanceMi() from buoys.js (must be loaded first).
 */

const TidesModule = (() => {

  const STATIONS = [
    // ── South Florida (Miami area) ───────────────────────────────────────
    { id: "8723214", name: "Virginia Key, FL (Miami)",  lat: 25.731, lon: -80.162 },
    { id: "8723170", name: "Miami, Government Cut",     lat: 25.768, lon: -80.131 },
    { id: "8722956", name: "Lake Worth Pier, FL",       lat: 26.612, lon: -80.034 },
    { id: "8722669", name: "Lake Worth, FL",            lat: 26.668, lon: -80.037 },
    // ── Florida Keys ─────────────────────────────────────────────────────
    { id: "8723970", name: "Vaca Key, FL",              lat: 24.711, lon: -81.106 },
    { id: "8724580", name: "Key West, FL",              lat: 24.551, lon: -81.808 },
    // ── Florida East Coast ───────────────────────────────────────────────
    { id: "8721604", name: "Trident Pier, FL",          lat: 28.415, lon: -80.593 },
    { id: "8720587", name: "St. Augustine, FL",         lat: 29.869, lon: -81.312 },
    // ── Florida Gulf Coast ───────────────────────────────────────────────
    { id: "8725110", name: "Naples, FL",                lat: 26.131, lon: -81.808 },
    { id: "8726384", name: "Port Manatee, FL",          lat: 27.639, lon: -82.563 },
    { id: "8726520", name: "St. Petersburg, FL",        lat: 27.760, lon: -82.627 },
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
      `&application=FishyBoat&format=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`NOAA HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return (data.predictions || []).map((p) => ({
      time:  p.t.slice(11, 16),
      hours: timeToHours(p.t.slice(11, 16)),
      v:     parseFloat(p.v),
      type:  p.type,
    }));
  }

  function timeToHours(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  }

  // Piecewise cosine interpolation — standard tidal approximation.
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
