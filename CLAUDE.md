# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Beautiful Day" — a single-page static site that grades offshore/bay activities (fishing, sailing, snorkeling, etc.) for a user-supplied location and date, using only free public APIs called directly from the browser.

No build step, no package manager, no backend. The whole app is plain HTML/CSS/JS files served as-is.

**Audience focus:** the "Quick picks" chips in `index.html` are South Florida / Florida Keys spots (Miami, Key Biscayne, Fort Lauderdale, Key Largo, Islamorada, Key West) — that's the primary user. The app itself works for any coastal location worldwide (geocoding, map click, and `lat, lon` entry all work globally), and the NDBC buoy reference data still covers all US coasts. When adding more example chips, default to the South Florida / Keys / Bahamas region unless the user asks otherwise.

## Running locally

A preview launch profile is committed at `.claude/launch.json`. To serve manually:

```
python3 -m http.server 8765
```

Open `http://localhost:8765/`. **Geolocation requires HTTPS or `localhost`** — opening `index.html` via `file://` will disable the auto-center-on-user feature.

There are no tests, lint config, or build commands.

## Architecture

### Script load order matters

`index.html` loads scripts in this exact order, and each later file depends on globals defined earlier:

1. `icons.js`   → defines global `Icons`
2. `buoys.js`   → defines globals `NDBC_BUOYS`, `nearestBuoys`, `distanceMi`
3. `grading.js` → defines global `Grading`
4. `app.js`     → defines global `App`, then calls `App.init()` on DOMContentLoaded

There is no module system. Each file is wrapped in an IIFE that returns a single namespace object; everything else inside is private. When adding a new feature, decide which namespace it belongs to and add to that file — don't introduce cross-file globals.

### Data flow on "Check Conditions"

`App.checkConditions()` in `app.js` orchestrates the pipeline:

1. Resolve `state.location` (set earlier by chip click, map click, Nominatim suggestion, or `lat, lon` parse).
2. In parallel, fetch:
   - **Open-Meteo Marine** (`marine-api.open-meteo.com/v1/marine`): wave height/period/direction, swell, wind-wave.
   - **Open-Meteo Forecast** (`api.open-meteo.com/v1/forecast`): temperature, weather code, precipitation, cloud cover, visibility, wind speed/direction/gusts, is_day.
   - Both requested for 7 days hourly with `timezone=auto`.
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

### NDBC buoys

`buoys.js` ships a curated list of well-known US NDBC stations (East/Gulf/West coasts, Great Lakes, Hawaii, Alaska). NDBC's realtime endpoints don't expose CORS headers, so the app intentionally **does not fetch live buoy data**; it shows the nearest 5 stations and links out to their NDBC station pages for ground truth. If extending: add stations to the `NDBC_BUOYS` array — the haversine ranking handles the rest.

### Map

Leaflet is loaded from CDN. The map lives in its own always-visible section above the results area (not inside the `hidden` results section), so it renders correctly without needing `invalidateSize()`. On init, `centerOnGeolocation()` requests `navigator.geolocation` and pans to the user — but skips the pan if `state.location` is already set (avoids yanking the view if geolocation resolves after a user pick).

### Visual conventions

- **Activity cards and snapshot tiles share the same background gradient** (`linear-gradient(135deg, var(--sky-1), #DAF1FA)`). If you change one, change both — they're meant to read as the same surface.
- **Grade colors are binary, not a gradient.** `--grade-a/b/c` are all the same blue (`#4A90D9`) and `--grade-d/f` are both the same red (`#E74C3C`). The letter inside the badge carries the granularity, not the color. Don't reintroduce per-grade hues without confirming.
- **Only the grade badge is grade-colored, not the card itself.** The grade-color rules are scoped as `.grade-badge.grade-X` so they only paint the circle. See gotcha below.

## Gotchas

- **CSS `display` overrides the `hidden` attribute.** Any rule like `.foo { display: flex }` will defeat `<div class="foo" hidden>`. `styles.css` includes `[hidden] { display: none !important; }` at the top to enforce the attribute — keep it.
- **The `grade-X` class is applied to *both* the badge and the activity card** (so the card can be selected by grade if needed). Any CSS rule targeting `.grade-X` directly will bleed into the card too. Always write grade-color rules as `.grade-badge.grade-X` (or another specific compound selector).
- **Browser caches `.css` and `.js` aggressively.** When iterating, hard-reload (or `location.reload(true)`) after edits — a soft reload may serve stale files.
- **Marine API rejects deep-inland coordinates.** Errors from `fetchMarine` are surfaced to the user with a hint to pick a coastal location.
- **Nominatim usage policy** asks for ≤1 req/sec. The search input debounces to 320 ms and aborts in-flight requests on new input — preserve that behavior if refactoring search.
