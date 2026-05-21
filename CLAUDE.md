# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This repository hosts **two sibling single-page static sites** that grade water-activity conditions using only free public APIs called from the browser. Same architectural pattern (IIFE namespaces, no build, free APIs), but they **share no source files** — each app has its own `index.html`, `app.js`, `grading.js`, `icons.js`, `buoys.js`, `tides.js`, `styles.css`.

1. **Beautiful Day** (repo root) — broad audience, eight activities (offshore/bay fishing, sailing, sandbar, snorkeling, diving, paddleboarding, kayaking). Works globally, South FL–biased quick picks.
2. **FishyBoat** (`fishyboat/` subdirectory) — narrow small-boat fishing safety tool. Three scenarios (offshore / inlet–reef / bay), Miami-focused, GO/CAUTION/ROUGH/STAY-HOME verdict UI. See the FishyBoat section below for what differs.

When working on one app, do not edit the other unless the user explicitly asks to sync them.

No build step, no package manager, no backend. Plain HTML/CSS/JS served as-is.

**Audience focus (Beautiful Day):** the "Quick picks" chips in `index.html` are South Florida / Florida Keys spots (Miami, Key Biscayne, Fort Lauderdale, Key Largo, Islamorada, Key West) — that's the primary user. The app itself works for any coastal location worldwide (geocoding, map click, and `lat, lon` entry all work globally), and the NDBC buoy reference data still covers all US coasts. When adding more example chips, default to the South Florida / Keys / Bahamas region unless the user asks otherwise.

## Running locally

Two preview launch profiles are committed at `.claude/launch.json`. Manual serve commands:

```
python3 -m http.server 8765                              # Beautiful Day → http://localhost:8765/
python3 -m http.server 8766 --directory fishyboat        # FishyBoat     → http://localhost:8766/
```

**Geolocation requires HTTPS or `localhost`** — opening `index.html` via `file://` will disable the auto-center-on-user feature.

There are no tests, lint config, or build commands.

## Architecture (Beautiful Day)

### Script load order matters

`index.html` loads scripts in this exact order, and each later file depends on globals defined earlier:

1. `icons.js`   → defines global `Icons`
2. `buoys.js`   → defines globals `NDBC_BUOYS`, `nearestBuoys`, `distanceMi`
3. `tides.js`   → defines global `TidesModule` (depends on `distanceMi` from buoys.js)
4. `grading.js` → defines global `Grading`
5. `app.js`     → defines global `App`, then calls `App.init()` on DOMContentLoaded

There is no module system. Each file is wrapped in an IIFE that returns a single namespace object; everything else inside is private. When adding a new feature, decide which namespace it belongs to and add to that file — don't introduce cross-file globals.

### Data flow on "Check Conditions"

`App.checkConditions()` in `app.js` orchestrates the pipeline:

1. Resolve `state.location` (set earlier by chip click, map click, Nominatim suggestion, or `lat, lon` parse).
2. In parallel, fetch:
   - **Open-Meteo Marine** (`marine-api.open-meteo.com/v1/marine`): wave height/period/direction, swell, wind-wave.
   - **Open-Meteo Forecast** (`api.open-meteo.com/v1/forecast`): temperature, weather code, precipitation, cloud cover, visibility, wind speed/direction/gusts, is_day.
   - Both requested for 7 days hourly with `timezone=auto`.
   - **NOAA CO-OPS** (`api.tidesandcurrents.noaa.gov/api/prod/datagetter`): high/low tide predictions for the nearest station in `tides.js`. This fetch is wrapped in `.catch()` so a NOAA failure never blocks the main result.
   - **NWS** (`api.weather.gov`): text marine/weather forecast via `fetchNWSForecast()` in `app.js`. Also wrapped in `.catch()` — never blocks the main result.
3. `sliceForDate()` finds hourly indices matching the requested date. For "All day", it averages daytime hours (7–19); for a specific hour, it uses that single hour. Marine and weather hourly arrays are aligned by matching ISO timestamps (timestamps may diverge — never assume index parity).
4. `aggregate()` produces a single `conditions` object used for grading. Most fields are means; **gusts use max** (worst gust matters more than average); precipitation is summed.
5. `Grading.gradeAll(conditions)` returns one result per activity in `Grading.ACTIVITY_KEYS`.
6. Renderers populate snapshot, activity cards, hourly strip, and buoy list. `updateMap()` pans Leaflet and drops the target marker plus nearest-5 NDBC markers.

### Grading system (`grading.js`)

Each activity is a `PROFILES` entry with weighted rules. Each rule scores one condition 0–100 via one of three scorers:

- `scoreLowerBetter(value, [aMax, bMax, cMax, dMax])` — for "less is better" (waves, wind, rain).
- `scoreHigherBetter(value, [aMin, bMin, cMin, dMin])` — for "more is better" (wave period, visibility, temperature).
- `scoreBand(value, low, high, fadeBelow, fadeAbove)` — for sweet-spot values (sailing wants 8–18 kt wind, not 0 and not 30).

Weighted average → `scoreToLetter()` → A/B/C/D/F. Rules scoring `<70` surface as "concerns"; rules scoring `≥85` surface as "highlights". Only one of those lists is shown per card (concerns take priority).

To add an activity: add a `PROFILES[key]` entry, add the key to `ACTIVITY_KEYS`, then add a corresponding case in `Icons.activityIcon()` (and a new icon function if needed).

### Units

All user-facing numbers are imperial: feet, knots, miles, °F, inches. The API calls explicitly request these via `length_unit=imperial`, `wind_speed_unit=kn`, `precipitation_unit=inch`, `temperature_unit=fahrenheit`. The one exception is Open-Meteo's `visibility`, which always returns meters — `app.js` converts to miles by dividing by `1609.344` in both `buildHourData` and `aggregate`. Buoy distances use `distanceMi` (haversine with `R = 3958.756`).

If a unit threshold ever changes from km to mi (or similar), update **three** places: the conversion in `app.js`, the snapshot label in `renderSnapshot()`, and the grading thresholds + hint text in `grading.js`.

### NWS Marine Forecast (`app.js` — `fetchNWSForecast`)

Uses the [Weather.gov API](https://www.weather.gov/documentation/services-web-api) — CORS-enabled, no key needed. Two-tier fetch strategy in `fetchNWSForecast()`:

1. **Marine zone** (preferred): `GET api.weather.gov/zones?point={lat},{lon}&type=coastal,offshore` → finds the containing zone → `GET {zone.id}/forecast` → returns marine-specific text with winds in knots and seas in feet.
2. **Point forecast** (fallback): `GET api.weather.gov/points/{lat},{lon}` → `GET {properties.forecast}` → returns standard NWS forecast periods. Used when the coordinates don't fall in a marine zone (most inland/nearshore points).

The section renders up to 4 forecast periods (name + detailed text) and shows two links: **NWS Marine Forecast** (`marine.weather.gov/MapClick.php`) and **Point Forecast** (`forecast.weather.gov/MapClick.php`), both built from the selected coordinates. A `MARINE ZONE` or `GENERAL` badge indicates which data source was used. The section appears between the hourly strip and the tides section in the results layout.

### Tides (`tides.js`)

`TidesModule.nearestStation(lat, lon)` finds the closest entry in a curated list of ~50 NOAA CO-OPS stations and returns it with a `distanceMi` field. `fetchTidePredictions(stationId, dateStr)` calls the NOAA API for that date's high/low events (`interval=hilo`, `units=english`, `datum=MLLW`, `time_zone=lst_ldt`). Times are station-local. `interpolateTideAt(t, predictions)` uses piecewise cosine interpolation between H/L extrema — the standard tidal approximation. The rendered tide chart is an inline SVG generated by `drawTideChart()` in `app.js`. If the NOAA fetch fails (inland location, API down), the section shows a graceful error; the rest of the dashboard is unaffected.

### NDBC buoys

`buoys.js` ships a curated list of well-known US NDBC stations (East/Gulf/West coasts, Great Lakes, Hawaii, Alaska). NDBC's realtime endpoints don't expose CORS headers, so the app intentionally **does not fetch live buoy data**; it shows the nearest 5 stations and links out to their NDBC station pages for ground truth. If extending: add stations to the `NDBC_BUOYS` array — the haversine ranking handles the rest.

### Map

Leaflet is loaded from CDN. The map lives in its own always-visible section above the results area (not inside the `hidden` results section), so it renders correctly without needing `invalidateSize()`. On init, `centerOnGeolocation()` requests `navigator.geolocation` and pans to the user — but skips the pan if `state.location` is already set (avoids yanking the view if geolocation resolves after a user pick).

### Visual conventions

- **Activity cards and snapshot tiles share the same background gradient** (`linear-gradient(135deg, var(--sky-1), #DAF1FA)`). If you change one, change both — they're meant to read as the same surface.
- **Grade colors are binary, not a gradient.** `--grade-a/b/c` are all the same blue (`#4A90D9`) and `--grade-d/f` are both the same red (`#E74C3C`). The letter inside the badge carries the granularity, not the color. Don't reintroduce per-grade hues without confirming.
- **Only the grade badge is grade-colored, not the card itself.** The grade-color rules are scoped as `.grade-badge.grade-X` so they only paint the circle. See gotcha below.
- **Logo (`BD_logo_trnsp.png`)** is a transparent-background PNG with black and white art pixels — no CSS `filter` is needed. It is displayed with `filter: drop-shadow(...)` for contrast against the light sky. Do NOT apply `filter: invert(1)` (that turns the white art black) or `filter: brightness(0) invert(1)` (makes everything white and invisible against the light sky). The tagline below the logo uses the `.tagline` class.

## FishyBoat (`fishyboat/`)

FishyBoat is a self-contained variant. Same script-load pattern, same Open-Meteo + NOAA CO-OPS + NWS fetch pipeline, same `sliceForDate` / `aggregate` logic as Beautiful Day — only the differences worth knowing about are listed here.

### Three fishing scenarios, not eight activities

`Grading.ACTIVITY_KEYS` is `["fishing-offshore", "fishing-reef", "fishing-bay"]`. Each scenario uses different wave/wind threshold tuples defined as constants at the top of `grading.js` (`WIND_OFFSHORE`/`WIND_BAY`/`WIND_REEF`, `WAVE_OFFSHORE`/`WAVE_BAY`/`WAVE_REEF`):

- **Bay** uses *tighter* wave thresholds (`WAVE_BAY = [0.5, 1, 1.5, 2.5]`) because in a sheltered bay anything over ~2 ft means it's already blowing hard — and *slightly more lenient* wind (`WIND_BAY = [5, 10, 13, 16]`) because chop, not wind, is the limit.
- **Inlet/reef** adds wave-period sensitivity (short steep seas break at the inlet mouth).
- **Offshore** is the baseline — directly reflects the user's stated thresholds (waves <1ft great / 1–2ft good / 3–5ft rough / 5+ft dangerous; wind 0–5kt / 5–9kt / 9–13kt / 13+kt).

If you tune these constants, all three scenarios pull from the same place — change once, propagates to grading and to the empty-state explainer.

### Verdict box (the headline UI feature)

`renderVerdict()` in `app.js` displays a colored headline above the activity cards. Two important pieces:

- **`Grading.overallVerdict(grades)`** picks the **best (mildest) of the three** scenarios as the "Best option" — by design, not a bug. Bay fishing is usually safe even when offshore is rough, so showing the worst would be misleading.
- A "Toughest scenario" subline appears only when worst ≠ best.
- Each grade letter maps to a `{ tag, text }` pair in `verdictForGrade()`: `A/B → "GO"`, `C → "CAUTION"`, `D → "ROUGH"`, `F → "STAY HOME"`. The tag class is `verdict-tag-<lowercased-tag-with-hyphens>` — `STAY HOME` becomes `verdict-tag-stay-home`.

### Grade colors are NOT binary here

Unlike Beautiful Day, FishyBoat uses **per-grade colors** because this is a safety tool — the user needs to read severity at a glance, not just the letter:

```
--grade-a: #2E6FB5  (deep blue, safe)
--grade-b: #4A90D9  (lighter blue, safe)
--grade-c: #F0A929  (amber, caution)
--grade-d: #E67E22  (orange, rough)
--grade-f: #E74C3C  (red, dangerous)
```

Both the grade badge AND the `.verdict-headline` element pick up these colors (the headline via `.verdict-headline.grade-X` rules, the badge via `.grade-badge.grade-X` rules — the badge rules in particular are still compound selectors to avoid card bleed, same gotcha as Beautiful Day).

### Wind is in knots; thresholds were converted from a mph spec

User originally specified mph (0–5/5–10/10–15/15+). The site displays knots throughout because that's marine standard. Conversion: 5 mph → 4 kt, 10 mph → 9 kt, 13 mph → 11 kt, 15 mph → 13 kt. The empty-state explainer card uses the **knot** numbers — keep them in sync with the constants in `grading.js` if either changes.

### Curated South FL data

`buoys.js` and `tides.js` ship trimmed lists (~12 buoys, ~11 tide stations, all Florida + Gulf Coast). The map defaults to Miami (25.7617, -80.1918) at zoom 10. `setupMap` does **not** call geolocation here (unlike Beautiful Day) — the Miami default is intentional.

### Map zooms on every location pick

`setupQuickPicks` and the suggestion-click handler call `state.map.setView(..., 11)` after `setLocation`, so the map follows the user's selection without waiting for "Check Conditions". Beautiful Day delays the pan until `updateMap()` runs after a successful fetch.

## Gotchas

- **CSS `display` overrides the `hidden` attribute.** Any rule like `.foo { display: flex }` will defeat `<div class="foo" hidden>`. `styles.css` includes `[hidden] { display: none !important; }` at the top to enforce the attribute — keep it.
- **The `grade-X` class is applied to *both* the badge and the activity card** (so the card can be selected by grade if needed). Any CSS rule targeting `.grade-X` directly will bleed into the card too. Always write grade-color rules as `.grade-badge.grade-X` (or another specific compound selector).
- **Browser caches `.css` and `.js` aggressively.** When iterating, hard-reload (or `location.reload(true)`) after edits — a soft reload may serve stale files.
- **Marine API rejects deep-inland coordinates.** Errors from `fetchMarine` are surfaced to the user with a hint to pick a coastal location.
- **Nominatim usage policy** asks for ≤1 req/sec. The search input debounces to 320 ms and aborts in-flight requests on new input — preserve that behavior if refactoring search.
