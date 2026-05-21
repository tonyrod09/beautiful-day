# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FishyBoat is a static, zero-build, vanilla-JS web app that grades whether it's safe to take a small boat out fishing in the South Florida area. It pulls live data from public APIs (no keys, no backend) and renders a single-page dashboard.

There is no package manager, no bundler, no test framework. Edits to `.js`, `.css`, or `.html` are picked up by reloading the browser.

## Running locally

A `.claude/launch.json` is configured for two static servers:

- `beautiful-day` — serves the repo root on `http://localhost:8765` (this is the live app)
- `fishyboat` — serves the `fishyboat/` subdirectory on `http://localhost:8766` (see note below)

From the shell, either of these works:

```bash
python3 -m http.server 8765                       # serves repo root
python3 -m http.server 8766 --directory fishyboat # serves the subdir
```

Opening `index.html` directly via `file://` will break the external API calls (CORS / `fetch`) — always go through a local server.

## Repo layout note

The root directory and the `fishyboat/` subdirectory currently contain **byte-identical copies** of the app (`app.js`, `index.html`, `styles.css`, etc.). The most recent commit (`FishyBoat app moved to root folder`) moved the canonical copy to the root; the `fishyboat/` subdir is a leftover duplicate. Treat the root files as the source of truth — if you edit the app, edit at the root and don't try to keep the subdir in sync. (Consider asking the user whether to delete `fishyboat/` before making non-trivial changes, to avoid divergence.)

## Architecture

The app is split into IIFE-style modules attached to globals, loaded in order by `index.html`. Load order matters — later files depend on earlier ones:

1. `icons.js` → `Icons` global. SVG factory functions (logo, weather, sea state, activity icons).
2. `buoys.js` → `NDBC_BUOYS` array plus top-level `distanceMi()` and `nearestBuoys()` helpers. `distanceMi` is used by `tides.js`, so this must load before tides.
3. `tides.js` → `TidesModule`. Curated list of NOAA CO-OPS tide stations + fetcher + cosine interpolation for plotting the daily curve.
4. `grading.js` → `Grading`. Scoring engine.
5. `app.js` → `App`. Orchestrates DOM, map, fetches, and rendering. Boots from `DOMContentLoaded`.

### Data flow (`App.checkConditions`)

When the user clicks **Check Conditions**, four fetches run in parallel:

- `fetchMarine` → Open-Meteo marine API (wave height/period/direction, swell)
- `fetchWeather` → Open-Meteo forecast API (temp, wind in **knots**, gusts, precip, visibility, weather codes)
- `TidesModule.fetchTidePredictions` → NOAA CO-OPS hi/lo predictions for the nearest station
- `fetchNWSForecast` → NWS API (api.weather.gov): tries coastal → offshore → marine zone forecasts, then falls back to point/grid forecast. Also pulls `waveHeight` from the grid data and averages it for the day.

The two Open-Meteo responses are aligned by timestamp in `sliceForDate` (using `marineIdxMap`), then either a single hour is picked or daytime hours `7–19` are aggregated (mean for most, **max for gusts**, sum for precip).

The aggregated `conditions` object is fed to `Grading.gradeAll()`, which returns one grade per scenario.

### Grading model (`grading.js`)

Three fishing scenarios, each with its own weighted rule set: `fishing-offshore`, `fishing-bay`, `fishing-reef`. Each rule scores a metric on a 0–100 scale (`scoreLowerBetter` / `scoreHigherBetter` do smooth interpolation across A/B/C/D thresholds), then a weighted average maps to a letter A–F via `scoreToLetter`.

Key conventions:

- **Wind is always in knots throughout the app.** The user-facing threshold spec is in mph in the file header comment, but the constants (`WIND_OFFSHORE`, `WIND_BAY`, `WIND_REEF`) are the converted knot values that the code actually uses. Don't reintroduce mph anywhere — `fetchWeather` requests `wind_speed_unit: "kn"` for this reason.
- **Wave thresholds are in feet.** Open-Meteo is called with `length_unit: "imperial"`. NWS grid wave height comes back in meters or feet depending on the station — the code checks `uom.includes("ft")` and converts otherwise.
- "Bay" thresholds are looser on wind but tighter on waves (sheltered chop vs. open seas); "reef/inlet" is similar to offshore but with a short-period penalty for steep breaking seas.
- The headline verdict uses the **best** scenario (since bay is usually the safe option even when offshore is rough). The "toughest scenario" line surfaces the worst grade for context.

### Tides

`tides.js` keeps a curated list of NOAA stations (currently South Florida + Keys + a few Gulf/East Coast). `nearestStation` picks one by great-circle distance. `interpolateTideAt` uses piecewise cosine interpolation between hi/lo predictions to draw the smooth tide curve in `drawTideChart` (inline SVG).

### Buoys

NDBC realtime endpoints don't expose CORS, so buoys are **reference-only** — `nearestBuoys` finds the closest 5 and renders link-outs to `ndbc.noaa.gov`. Don't try to fetch live buoy observations from the client.

### Map

Leaflet 1.9.4 loaded via unpkg CDN. Map clicks call `setLocation` with the latlng; quick-pick chips and geocoded search results do the same. `updateMap` repaints the location marker and nearby buoy markers after a successful "Check Conditions".

## When editing

- Adding a new scenario: add a profile to `PROFILES` in `grading.js`, add its key to `ACTIVITY_KEYS`, add an icon case to `Icons.activityIcon` in `icons.js`. The rendering loop in `App.renderActivities` is data-driven and needs no changes.
- Adding a new condition metric: add it to the `hourly=` param list in `fetchMarine` or `fetchWeather`, expose it on the `conditions` object in `aggregate`, then reference it from grading rules and/or the snapshot grid in `renderSnapshot`.
- Adding tide stations or buoys: append to the `STATIONS` / `NDBC_BUOYS` arrays. Both lookups are nearest-by-distance, so ordering doesn't matter.
- All external API calls are unauthenticated public endpoints. Don't add API keys without first confirming with the user how they want secrets handled — there's no backend to hide them behind.
