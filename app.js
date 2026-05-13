/* ============ Beautiful Day — Main App ============ */

const App = (() => {

  const state = {
    location: null,          // { lat, lon, name, detail }
    map: null,
    locationMarker: null,
    buoyMarkers: [],
    lastSearchAbort: null,
    selectedDate: null,
  };

  const els = {};

  // ---------- Init ----------
  function init() {
    els.locInput      = document.getElementById("locInput");
    els.suggestions   = document.getElementById("suggestions");
    els.dateInput     = document.getElementById("dateInput");
    els.hourInput     = document.getElementById("hourInput");
    els.checkBtn      = document.getElementById("checkBtn");
    els.resultsArea   = document.getElementById("resultsArea");
    els.emptyState    = document.getElementById("emptyState");
    els.loading       = document.getElementById("loadingOverlay");
    els.errorBox      = document.getElementById("errorBox");
    els.locName       = document.getElementById("locName");
    els.locDetail     = document.getElementById("locDetail");
    els.snapshot      = document.getElementById("conditionsSnapshot");
    els.activityCards = document.getElementById("activityCards");
    els.hourlyStrip   = document.getElementById("hourlyStrip");
    els.buoyList      = document.getElementById("buoyList");
    els.tideStation   = document.getElementById("tideStation");
    els.tideChart     = document.getElementById("tideChart");
    els.tideList      = document.getElementById("tideList");
    els.nwsContent    = document.getElementById("nwsContent");
    els.nwsLink       = document.getElementById("nwsLink");

    setupDateInput();
    setupHourInput();
    setupSearch();
    setupQuickPicks();
    setupMap();
    els.checkBtn.addEventListener("click", checkConditions);
  }

  function setupDateInput() {
    const today = new Date();
    const minDate = today.toISOString().slice(0, 10);
    const max = new Date(today);
    max.setDate(max.getDate() + 7);
    els.dateInput.min = minDate;
    els.dateInput.max = max.toISOString().slice(0, 10);
    els.dateInput.value = minDate;
  }

  function setupHourInput() {
    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = String(h);
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ap = h < 12 ? "AM" : "PM";
      opt.textContent = `${hh}:00 ${ap}`;
      els.hourInput.appendChild(opt);
    }
  }

  function setupQuickPicks() {
    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const lat = parseFloat(chip.dataset.lat);
        const lon = parseFloat(chip.dataset.lon);
        const name = chip.dataset.name;
        setLocation({ lat, lon, name, detail: `${lat.toFixed(3)}, ${lon.toFixed(3)}` });
        els.locInput.value = name;
        hideSuggestions();
      });
    });
  }

  // ---------- Search ----------
  function setupSearch() {
    let debounceTimer = null;

    els.locInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const q = els.locInput.value.trim();

      // Try parsing "lat, lon" directly.
      const latlon = parseLatLon(q);
      if (latlon) {
        hideSuggestions();
        return;
      }

      if (q.length < 3) {
        hideSuggestions();
        return;
      }

      debounceTimer = setTimeout(() => geocode(q), 320);
    });

    els.locInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = els.locInput.value.trim();
        const latlon = parseLatLon(q);
        if (latlon) {
          setLocation({ lat: latlon.lat, lon: latlon.lon, name: `${latlon.lat.toFixed(3)}, ${latlon.lon.toFixed(3)}`, detail: "Coordinates" });
          hideSuggestions();
          checkConditions();
          return;
        }
        // If suggestions are open, pick first; otherwise geocode + pick.
        const first = els.suggestions.querySelector("li");
        if (first) {
          first.click();
        } else if (q.length >= 3) {
          geocode(q).then(() => {
            const f = els.suggestions.querySelector("li");
            if (f) f.click();
          });
        }
      } else if (e.key === "Escape") {
        hideSuggestions();
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-input-wrap")) hideSuggestions();
    });
  }

  function parseLatLon(s) {
    const m = s.match(/^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
    if (!m) return null;
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
  }

  async function geocode(query) {
    if (state.lastSearchAbort) state.lastSearchAbort.abort();
    state.lastSearchAbort = new AbortController();

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
      const res = await fetch(url, {
        signal: state.lastSearchAbort.signal,
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error("Geocoding failed");
      const results = await res.json();
      renderSuggestions(results);
    } catch (e) {
      if (e.name !== "AbortError") console.warn("Geocode error:", e);
    }
  }

  function renderSuggestions(results) {
    els.suggestions.innerHTML = "";
    if (!results.length) { hideSuggestions(); return; }
    for (const r of results) {
      const li = document.createElement("li");
      li.textContent = r.display_name;
      li.addEventListener("click", () => {
        setLocation({
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          name: r.display_name.split(",")[0],
          detail: r.display_name,
        });
        els.locInput.value = r.display_name.split(",")[0];
        hideSuggestions();
      });
      els.suggestions.appendChild(li);
    }
    els.suggestions.hidden = false;
  }

  function hideSuggestions() {
    els.suggestions.hidden = true;
    els.suggestions.innerHTML = "";
  }

  // ---------- Map ----------
  function setupMap() {
    state.map = L.map("map", { zoomControl: true }).setView([32.0, -80.0], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(state.map);

    state.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setLocation({
        lat, lon: lng,
        name: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        detail: "Map pick",
      });
      els.locInput.value = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
      hideSuggestions();
    });

    centerOnGeolocation();
  }

  function centerOnGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (state.location) return;  // user already picked a spot — don't yank the view
        state.map.setView([pos.coords.latitude, pos.coords.longitude], 9);
      },
      () => { /* permission denied or unavailable — keep default view */ },
      { timeout: 6000, maximumAge: 600000 }
    );
  }

  function updateMap(loc) {
    if (!state.map) return;
    state.map.setView([loc.lat, loc.lon], 9);

    // Location marker.
    const targetIcon = L.divIcon({
      className: "",
      html: `<div class="target-marker"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    if (state.locationMarker) state.map.removeLayer(state.locationMarker);
    state.locationMarker = L.marker([loc.lat, loc.lon], { icon: targetIcon })
      .addTo(state.map)
      .bindPopup(`<b>${escapeHtml(loc.name)}</b><br>${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)}`);

    // Buoy markers (nearest 5).
    state.buoyMarkers.forEach((m) => state.map.removeLayer(m));
    state.buoyMarkers = [];
    const near = nearestBuoys(loc.lat, loc.lon, 5);
    const buoyIcon = L.divIcon({
      className: "",
      html: Icons.buoyIcon(22),
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    for (const b of near) {
      const m = L.marker([b.lat, b.lon], { icon: buoyIcon })
        .addTo(state.map)
        .bindPopup(`<b>NDBC ${b.id}</b><br>${escapeHtml(b.name)}<br>${b.distanceMi.toFixed(0)} mi away<br><a href="https://www.ndbc.noaa.gov/station_page.php?station=${b.id}" target="_blank" rel="noopener">Live data ↗</a>`);
      state.buoyMarkers.push(m);
    }
  }

  // ---------- Location ----------
  function setLocation(loc) {
    state.location = loc;
  }

  // ---------- Check Conditions ----------
  async function checkConditions() {
    if (!state.location) {
      showError("Pick a location first — search, click the map, or use a quick pick.");
      return;
    }
    const date = els.dateInput.value;
    const hour = els.hourInput.value;
    if (!date) {
      showError("Pick a date.");
      return;
    }

    state.selectedDate = date;
    hideError();
    showLoading();

    try {
      const nearStation = TidesModule.nearestStation(state.location.lat, state.location.lon);

      const [marine, weather, tidePreds, nwsData] = await Promise.all([
        fetchMarine(state.location.lat, state.location.lon),
        fetchWeather(state.location.lat, state.location.lon),
        TidesModule.fetchTidePredictions(nearStation.id, date)
          .catch((e) => { console.warn("Tide fetch:", e.message); return null; }),
        fetchNWSForecast(state.location.lat, state.location.lon)
          .catch((e) => { console.warn("NWS fetch:", e.message); return null; }),
      ]);

      const slice = sliceForDate(marine, weather, date, hour);
      if (!slice) {
        throw new Error("Forecast doesn't cover the requested date/hour.");
      }

      render(slice, date, hour, tidePreds, nearStation, nwsData);
      updateMap(state.location);
      els.emptyState.hidden = true;
      els.resultsArea.hidden = false;
      els.resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      console.error(e);
      showError(`Couldn't load forecast: ${e.message || e}`);
    } finally {
      hideLoading();
    }
  }

  // ---------- NWS Marine Forecast ----------
  async function fetchNWSForecast(lat, lon) {
    const pt = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    // Try marine zone forecast first (coastal, then offshore).
    const zoneRes = await fetch(
      `https://api.weather.gov/zones?point=${pt}&type=coastal,offshore`,
      { headers: { "Accept": "application/geo+json" } }
    );
    if (zoneRes.ok) {
      const zd = await zoneRes.json();
      const zone = zd.features?.[0];
      if (zone) {
        const fcRes = await fetch(`${zone.id}/forecast`,
          { headers: { "Accept": "application/geo+json" } });
        if (fcRes.ok) {
          const fc = await fcRes.json();
          const periods = (fc.properties?.periods || []).slice(0, 4);
          if (periods.length) {
            return {
              source: "marine",
              zoneName: zone.properties.name,
              zoneId: zone.properties.id,
              periods,
            };
          }
        }
      }
    }

    // Fall back to regular point forecast.
    const ptRes = await fetch(`https://api.weather.gov/points/${pt}`,
      { headers: { "Accept": "application/geo+json" } });
    if (!ptRes.ok) return null;
    const ptData = await ptRes.json();
    const fcUrl = ptData.properties?.forecast;
    if (!fcUrl) return null;

    const fcRes = await fetch(fcUrl, { headers: { "Accept": "application/geo+json" } });
    if (!fcRes.ok) return null;
    const fcData = await fcRes.json();
    const periods = (fcData.properties?.periods || []).slice(0, 4);
    if (!periods.length) return null;

    const loc = ptData.properties?.relativeLocation?.properties;
    return {
      source: "general",
      zoneName: loc ? `${loc.city}, ${loc.state}` : null,
      zoneId: null,
      periods,
    };
  }

  function renderNWSForecast(data) {
    const { lat, lon } = state.location;
    const nwsUrl  = `https://forecast.weather.gov/MapClick.php?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&unit=0&lg=en&FcstType=text`;
    const marinUrl = `https://marine.weather.gov/MapClick.php?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&unit=0&lg=en&FcstType=text`;

    els.nwsLink.innerHTML =
      `<a href="${marinUrl}" target="_blank" rel="noopener">NWS Marine Forecast ↗</a>` +
      ` &nbsp;·&nbsp; <a href="${nwsUrl}" target="_blank" rel="noopener">Point Forecast ↗</a>`;

    if (!data?.periods?.length) {
      els.nwsContent.innerHTML =
        `<p class="nws-unavailable">Text forecast unavailable for this location.</p>`;
      return;
    }

    const badge = data.source === "marine"
      ? `<span class="nws-badge nws-badge-marine">Marine Zone</span>`
      : `<span class="nws-badge nws-badge-general">General</span>`;

    const zoneLine = data.zoneName
      ? `<p class="nws-zone">${badge} ${escapeHtml(data.zoneName)}</p>` : "";

    const cards = data.periods.map((p) => `
      <div class="nws-period">
        <div class="nws-period-name">${escapeHtml(p.name)}</div>
        <div class="nws-period-body">${escapeHtml(p.detailedForecast)}</div>
      </div>`).join("");

    els.nwsContent.innerHTML = zoneLine + `<div class="nws-periods">${cards}</div>`;
  }

  // ---------- Forecast fetches ----------
  async function fetchMarine(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      hourly: [
        "wave_height", "wave_direction", "wave_period",
        "wind_wave_height", "wind_wave_period",
        "swell_wave_height", "swell_wave_period",
      ].join(","),
      length_unit: "imperial",
      timezone: "auto",
      forecast_days: "7",
    });
    const url = `https://marine-api.open-meteo.com/v1/marine?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      // Some locations (deep inland) return errors — propagate.
      const txt = await res.text();
      throw new Error(`Marine forecast unavailable here (try a coastal location). ${txt}`);
    }
    return res.json();
  }

  async function fetchWeather(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      hourly: [
        "temperature_2m", "weather_code", "precipitation",
        "cloud_cover", "visibility",
        "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
        "is_day",
      ].join(","),
      temperature_unit: "fahrenheit",
      wind_speed_unit: "kn",
      precipitation_unit: "inch",
      timezone: "auto",
      forecast_days: "7",
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather forecast unavailable.");
    return res.json();
  }

  // ---------- Build conditions for selected window ----------
  function sliceForDate(marine, weather, dateStr, hour) {
    const wTimes = weather.hourly?.time;
    const mTimes = marine.hourly?.time;
    if (!wTimes || !mTimes) return null;

    // Find indices of requested date in weather array.
    const matchIdxs = [];
    for (let i = 0; i < wTimes.length; i++) {
      if (wTimes[i].slice(0, 10) === dateStr) matchIdxs.push(i);
    }
    if (matchIdxs.length === 0) return null;

    // Map weather indices to marine indices by matching ISO timestamps.
    const marineIdxMap = new Map(mTimes.map((t, i) => [t, i]));

    let selectedIdxs;
    if (hour === "all") {
      // Daylight only: 7am-7pm.
      selectedIdxs = matchIdxs.filter((i) => {
        const h = parseInt(wTimes[i].slice(11, 13), 10);
        return h >= 7 && h <= 19;
      });
      if (selectedIdxs.length === 0) selectedIdxs = matchIdxs;
    } else {
      const target = parseInt(hour, 10);
      const found = matchIdxs.find((i) => parseInt(wTimes[i].slice(11, 13), 10) === target);
      if (found == null) return null;
      selectedIdxs = [found];
    }

    // Build per-hour data array (for hourly strip).
    const dailyHours = matchIdxs.map((i) => buildHourData(i, marineIdxMap, marine, weather, wTimes));

    // Conditions used for grading = aggregate (mean) of selectedIdxs.
    const agg = aggregate(selectedIdxs, marineIdxMap, marine, weather);

    return {
      conditions: agg,
      dailyHours,
      selectedIdxs,
    };
  }

  function buildHourData(idx, marineIdxMap, marine, weather, wTimes) {
    const mIdx = marineIdxMap.get(wTimes[idx]);
    return {
      time: wTimes[idx],
      hour: parseInt(wTimes[idx].slice(11, 13), 10),
      temperature: weather.hourly.temperature_2m[idx],
      weatherCode: weather.hourly.weather_code[idx],
      isDay: weather.hourly.is_day[idx],
      precipitation: weather.hourly.precipitation[idx],
      cloudCover: weather.hourly.cloud_cover[idx],
      visibility: weather.hourly.visibility[idx] != null ? weather.hourly.visibility[idx] / 1609.344 : null,
      windSpeed: weather.hourly.wind_speed_10m[idx],
      windGust: weather.hourly.wind_gusts_10m[idx],
      windDirection: weather.hourly.wind_direction_10m[idx],
      waveHeight: mIdx != null ? marine.hourly.wave_height[mIdx] : null,
      wavePeriod: mIdx != null ? marine.hourly.wave_period[mIdx] : null,
      waveDirection: mIdx != null ? marine.hourly.wave_direction[mIdx] : null,
      swellHeight: mIdx != null ? marine.hourly.swell_wave_height[mIdx] : null,
      swellPeriod: mIdx != null ? marine.hourly.swell_wave_period[mIdx] : null,
    };
  }

  function aggregate(idxs, marineIdxMap, marine, weather) {
    const wTimes = weather.hourly.time;
    const mean = (arr) => {
      const vals = arr.filter((v) => v != null && !isNaN(v));
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const sum = (arr) => arr.filter((v) => v != null).reduce((a, b) => a + b, 0);
    const max = (arr) => {
      const vals = arr.filter((v) => v != null && !isNaN(v));
      return vals.length ? Math.max(...vals) : null;
    };

    const temps = [], waves = [], periods = [], winds = [], gusts = [], clouds = [], vis = [], precip = [], dirs = [];
    let weatherCodeRep = null, repHour = idxs[Math.floor(idxs.length / 2)];

    for (const i of idxs) {
      temps.push(weather.hourly.temperature_2m[i]);
      winds.push(weather.hourly.wind_speed_10m[i]);
      gusts.push(weather.hourly.wind_gusts_10m[i]);
      clouds.push(weather.hourly.cloud_cover[i]);
      vis.push(weather.hourly.visibility[i] != null ? weather.hourly.visibility[i] / 1609.344 : null);
      precip.push(weather.hourly.precipitation[i]);
      dirs.push(weather.hourly.wind_direction_10m[i]);

      const mIdx = marineIdxMap.get(wTimes[i]);
      if (mIdx != null) {
        waves.push(marine.hourly.wave_height[mIdx]);
        periods.push(marine.hourly.wave_period[mIdx]);
      }
    }
    weatherCodeRep = weather.hourly.weather_code[repHour];

    return {
      temperature: mean(temps),
      waveHeight: mean(waves),
      wavePeriod: mean(periods),
      windSpeed: mean(winds),
      windGust: max(gusts),                                  // worst-gust matters most
      cloudCover: mean(clouds),
      visibility: mean(vis),
      precipitation: sum(precip),
      windDirection: mean(dirs),
      weatherCode: weatherCodeRep,
      isDay: weather.hourly.is_day[repHour],
    };
  }

  // ---------- Render ----------
  function render(slice, dateStr, hour, tidePreds, nearStation, nwsData) {
    const c = slice.conditions;
    renderHeader(dateStr, hour);
    renderSnapshot(c);
    renderActivities(c);
    renderHourly(slice.dailyHours);
    renderNWSForecast(nwsData);
    renderTides(tidePreds, nearStation, dateStr);
    renderBuoys();
  }

  function renderHeader(dateStr, hour) {
    const loc = state.location;
    els.locName.textContent = loc.name;
    const d = new Date(dateStr + "T12:00:00");
    const dateLabel = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    const hourLabel = hour === "all" ? "Daytime average" : formatHour(parseInt(hour, 10));
    els.locDetail.textContent = `${dateLabel} · ${hourLabel} · ${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)}`;
  }

  function renderSnapshot(c) {
    const items = [
      { icon: Icons.smallWeatherIcon(c.weatherCode, 36), label: "Sky", value: weatherDesc(c.weatherCode) },
      { icon: Icons.thermometer(28),                     label: "Air Temp", value: fmt(c.temperature, "°F", 0) },
      { icon: Icons.seaStateIcon(c.waveHeight),          label: "Seas", value: fmt(c.waveHeight, " ft", 1) },
      { icon: Icons.wind(28),                            label: "Wind", value: c.windSpeed != null ? `${c.windSpeed.toFixed(0)} kt ${degToCompass(c.windDirection)}` : "—" },
      { icon: Icons.wind(28),                            label: "Gusts", value: fmt(c.windGust, " kt", 0) },
      { icon: Icons.compass(28),                         label: "Period", value: fmt(c.wavePeriod, " s", 1) },
      { icon: Icons.droplet(28),                         label: "Rain", value: fmt(c.precipitation, "″", 2) },
      { icon: Icons.eye(28),                             label: "Visibility", value: fmt(c.visibility, " mi", 0) },
    ];

    els.snapshot.innerHTML = items.map((it) => `
      <div class="snapshot-item">
        <div class="icon">${it.icon}</div>
        <div>
          <div class="label">${it.label}</div>
          <div class="value">${it.value}</div>
        </div>
      </div>
    `).join("");
  }

  function renderActivities(c) {
    const grades = Grading.gradeAll(c);
    els.activityCards.innerHTML = grades.map((g) => `
      <div class="activity-card grade-${g.grade}">
        <div class="grade-badge grade-${g.grade}">${g.grade}</div>
        <div class="activity-icon">${Icons.activityIcon(g.key, 44)}</div>
        <div class="activity-name">${escapeHtml(g.name)}</div>
        <div class="activity-summary">${escapeHtml(g.summary)}</div>
        <ul class="activity-reasons">
          ${(g.concerns.length ? g.concerns : g.highlights).map((r) =>
            `<li>${escapeHtml(r.label)}: ${escapeHtml(r.hint)}</li>`
          ).join("")}
        </ul>
      </div>
    `).join("");
  }

  function renderHourly(hours) {
    els.hourlyStrip.innerHTML = hours.map((h) => `
      <div class="hour-card">
        <div class="hour-label">${formatHour(h.hour)}</div>
        <div class="hour-icon">${Icons.smallWeatherIcon(h.weatherCode, 36)}</div>
        <div class="hour-temp">${h.temperature?.toFixed(0)}°F</div>
        <div class="hour-detail">
          ${h.waveHeight != null ? `${h.waveHeight.toFixed(1)} ft<br>` : ""}
          ${h.windSpeed?.toFixed(0)} kt ${degToCompass(h.windDirection)}
        </div>
      </div>
    `).join("");
  }

  function renderTides(predictions, station, dateStr) {
    if (!predictions || !predictions.length) {
      els.tideStation.innerHTML = station
        ? `Station: <a href="https://tidesandcurrents.noaa.gov/stationhome.html?id=${station.id}" target="_blank" rel="noopener">${escapeHtml(station.name)}</a> &middot; ${station.distanceMi.toFixed(0)} mi &middot; <em>No predictions available</em>`
        : "Tide data unavailable for this location.";
      els.tideChart.innerHTML = "";
      els.tideList.innerHTML  = "";
      return;
    }

    els.tideStation.innerHTML =
      `Station: <a href="https://tidesandcurrents.noaa.gov/stationhome.html?id=${station.id}" target="_blank" rel="noopener">${escapeHtml(station.name)}</a> &middot; ${station.distanceMi.toFixed(0)} mi`;

    const isToday = dateStr === new Date().toISOString().slice(0, 10);
    const nowHours = isToday ? (new Date().getHours() + new Date().getMinutes() / 60) : null;

    drawTideChart(predictions, nowHours);

    // Find the next upcoming tide (if today).
    let nextIdx = -1;
    if (isToday) {
      nextIdx = predictions.findIndex((p) => p.hours > nowHours);
    }

    els.tideList.innerHTML = predictions.map((p, i) => {
      const isNext = i === nextIdx;
      const arrow  = p.type === "H" ? "↑" : "↓";
      const label  = p.type === "H" ? "HIGH" : "LOW";
      const t12    = formatTideTime(p.time);
      return `<div class="tide-item ${p.type === "H" ? "tide-high" : "tide-low"}${isNext ? " tide-next" : ""}">
        <span class="tide-arrow">${arrow}</span>
        <span class="tide-label">${label}</span>
        <span class="tide-time">${t12}</span>
        <span class="tide-ht">${p.v.toFixed(1)} ft</span>
        ${isNext ? '<span class="tide-next-badge">Next</span>' : ""}
      </div>`;
    }).join("");
  }

  function drawTideChart(predictions, nowHours) {
    const W = 400, H = 70, PAD = 18;
    const allV  = predictions.map((p) => p.v);
    const maxV  = Math.max(...allV) + 0.4;
    const minV  = Math.min(...allV) - 0.2;
    const range = maxV - minV || 1;

    const px = (hours) => PAD + (hours / 24) * (W - PAD * 2);
    const py = (v) => H - PAD / 2 - ((v - minV) / range) * (H - PAD);

    // Generate 96 interpolated points (every 15 min).
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * 24;
      pts.push([px(t), py(TidesModule.interpolateTideAt(t, predictions))]);
    }
    const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const fillD = `${pathD} L${px(24)},${H} L${px(0)},${H} Z`;

    // H/L markers and labels.
    const markers = predictions.map((p) => {
      const x = px(p.hours).toFixed(1);
      const y = py(p.v).toFixed(1);
      const isHigh = p.type === "H";
      const labelY = isHigh ? (+y - 8).toFixed(1) : (+y + 16).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="4" fill="${isHigh ? "#4A90D9" : "#87CEEB"}" stroke="#fff" stroke-width="1.5"/>
              <text x="${x}" y="${labelY}" text-anchor="middle" class="tide-label-text">${formatTideTime(p.time)} · ${p.v.toFixed(1)}ft</text>`;
    }).join("");

    // "Now" cursor.
    const nowLine = nowHours != null
      ? `<line x1="${px(nowHours).toFixed(1)}" y1="0" x2="${px(nowHours).toFixed(1)}" y2="${H}" stroke="#E74C3C" stroke-width="1.5" stroke-dasharray="3,2"/>`
      : "";

    // Hour tick labels (6am, 12pm, 6pm).
    const ticks = [[6, "6 AM"], [12, "12 PM"], [18, "6 PM"]].map(([h, lbl]) =>
      `<text x="${px(h).toFixed(1)}" y="${H + 12}" text-anchor="middle" class="tide-tick-text">${lbl}</text>`
    ).join("");

    els.tideChart.innerHTML =
      `<svg viewBox="0 -4 ${W} ${H + 18}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
        <path d="${fillD}" fill="#4A90D9" fill-opacity="0.12"/>
        <path d="${pathD}" fill="none" stroke="#4A90D9" stroke-width="2" stroke-linejoin="round"/>
        ${nowLine}
        ${markers}
        ${ticks}
      </svg>`;
  }

  function formatTideTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const hh = h % 12 === 0 ? 12 : h % 12;
    const mm = m > 0 ? `:${String(m).padStart(2, "0")}` : "";
    return `${hh}${mm} ${h < 12 ? "AM" : "PM"}`;
  }

  function renderBuoys() {
    const near = nearestBuoys(state.location.lat, state.location.lon, 5);
    els.buoyList.innerHTML = near.map((b) => `
      <li>
        <a href="https://www.ndbc.noaa.gov/station_page.php?station=${b.id}" target="_blank" rel="noopener">
          <span class="buoy-id">${b.id}</span>
          <span class="buoy-name">${escapeHtml(b.name)}</span>
          <span class="buoy-dist">${b.distanceMi.toFixed(0)} mi</span>
        </a>
      </li>
    `).join("");
  }

  // ---------- Helpers ----------
  function fmt(v, suffix, digits) {
    if (v == null || isNaN(v)) return "—";
    return `${v.toFixed(digits)}${suffix}`;
  }

  function formatHour(h) {
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh} ${h < 12 ? "AM" : "PM"}`;
  }

  function degToCompass(deg) {
    if (deg == null || isNaN(deg)) return "";
    const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  function weatherDesc(code) {
    const map = {
      0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
      45: "Fog", 48: "Rime fog",
      51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
      61: "Light rain", 63: "Rain", 65: "Heavy rain",
      71: "Light snow", 73: "Snow", 75: "Heavy snow",
      80: "Showers", 81: "Heavy showers", 82: "Violent showers",
      95: "Thunderstorm", 96: "Storm w/ hail", 99: "Severe storm",
    };
    return map[code] || "—";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // ---------- UI feedback ----------
  function showLoading() { els.loading.hidden = false; }
  function hideLoading() { els.loading.hidden = true; }
  function showError(msg) { els.errorBox.textContent = msg; els.errorBox.hidden = false; }
  function hideError() { els.errorBox.hidden = true; }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);
