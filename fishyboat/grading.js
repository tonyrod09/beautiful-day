/* ============ FishyBoat — Safety Grading for Small-Boat Fishing ============
 *
 * Three fishing scenarios — offshore, bay, and inlet/reef — each evaluated
 * for small-boat safety using wave height, wind, gusts, period, and rain.
 *
 * User-specified safety thresholds (small vessel like a 21' center console):
 *   Wave height: <1ft great · 1-2ft good · 3-5ft rough · 5+ft dangerous
 *   Wind:        0-5mph great · 5-10mph good · 10-15mph rough · 15+mph dangerous
 *
 * Wind values throughout the app are in KNOTS (marine standard).
 * 1 mph ≈ 0.868 kt, so converted thresholds:
 *   0-4 kt great · 4-9 kt good · 9-13 kt rough · 13+ kt dangerous
 *
 * Conditions object expected:
 *   waveHeight (ft), wavePeriod (s), windSpeed (kt), windGust (kt),
 *   precipitation (in), cloudCover (%), visibility (mi), temperature (°F)
 */

const Grading = (() => {

  // thresholds = [aMax, bMax, cMax, dMax]   (lower = better, smooth interpolation)
  function scoreLowerBetter(value, [a, b, c, d]) {
    if (value == null || isNaN(value)) return null;
    if (value <= a) return 100 - Math.max(0, (value / a) * 5);
    if (value <= b) return 85 - ((value - a) / (b - a)) * 10;
    if (value <= c) return 70 - ((value - b) / (c - b)) * 10;
    if (value <= d) return 55 - ((value - c) / (d - c)) * 15;
    return Math.max(0, 35 - (value - d) * 2);
  }

  function scoreHigherBetter(value, [a, b, c, d]) {
    if (value == null || isNaN(value)) return null;
    if (value >= a) return 95;
    if (value >= b) return 75 + ((value - b) / (a - b)) * 20;
    if (value >= c) return 60 + ((value - c) / (b - c)) * 15;
    if (value >= d) return 40 + ((value - d) / (c - d)) * 20;
    return Math.max(0, 35 + value * 2);
  }

  // Wind in knots. Mapping from user's mph spec:
  //   5 mph → 4 kt · 10 mph → 9 kt · 13 mph → 11 kt · 15 mph → 13 kt
  // Offshore is the most exposed scenario — wind thresholds applied straight.
  const WIND_OFFSHORE = [4, 9, 11, 13];

  // Bay is sheltered from open seas, but small craft still get pushed —
  // a touch more tolerant on wind because chop is the limiting factor.
  const WIND_BAY      = [5, 10, 13, 16];

  // Inlets and reef edges break in moderate wind — same as offshore.
  const WIND_REEF     = [4, 9, 11, 13];

  // Wave thresholds — user spec for the open ocean baseline.
  const WAVE_OFFSHORE = [1, 2, 3, 5];

  // Bay water is sheltered; bay "waves" are really chop. Tighter thresholds
  // because anything over 2 ft in a bay means it's blowing hard.
  const WAVE_BAY      = [0.5, 1, 1.5, 2.5];

  // Reef / inlet — steep seas break shallower. Slightly tighter than offshore.
  const WAVE_REEF     = [1, 1.5, 2.5, 4];

  const PROFILES = {

    "fishing-offshore": {
      name: "Offshore Fishing",
      blurb: "Past the inlet — open Atlantic, 5+ miles out",
      icon: "fishing-offshore",
      rules: [
        { label: "Seas",   weight: 4, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, WAVE_OFFSHORE),
          hint:  (c) => `${c.waveHeight?.toFixed(1)} ft seas` },
        { label: "Wind",   weight: 4, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, WIND_OFFSHORE),
          hint:  (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Gusts",  weight: 2, key: "windGust",
          score: (c) => scoreLowerBetter(c.windGust, [10, 15, 20, 25]),
          hint:  (c) => `${c.windGust?.toFixed(0)} kt gusts` },
        { label: "Period", weight: 1, key: "wavePeriod",
          score: (c) => scoreHigherBetter(c.wavePeriod, [8, 6, 5, 4]),
          hint:  (c) => `${c.wavePeriod?.toFixed(1)} s wave period` },
        { label: "Rain",   weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint:  (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "fishing-bay": {
      name: "Bay Fishing",
      blurb: "Biscayne Bay, ICW, flats — sheltered from open seas",
      icon: "fishing-bay",
      rules: [
        { label: "Wind",   weight: 4, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, WIND_BAY),
          hint:  (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Chop",   weight: 3, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, WAVE_BAY),
          hint:  (c) => `${c.waveHeight?.toFixed(1)} ft chop` },
        { label: "Gusts",  weight: 2, key: "windGust",
          score: (c) => scoreLowerBetter(c.windGust, [12, 18, 24, 30]),
          hint:  (c) => `${c.windGust?.toFixed(0)} kt gusts` },
        { label: "Rain",   weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint:  (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "fishing-reef": {
      name: "Inlet / Reef Fishing",
      blurb: "Government Cut, Haulover, reef edge — short, steep seas",
      icon: "fishing-reef",
      rules: [
        { label: "Seas",   weight: 4, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, WAVE_REEF),
          hint:  (c) => `${c.waveHeight?.toFixed(1)} ft seas` },
        { label: "Wind",   weight: 3, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, WIND_REEF),
          hint:  (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Gusts",  weight: 2, key: "windGust",
          score: (c) => scoreLowerBetter(c.windGust, [12, 18, 22, 28]),
          hint:  (c) => `${c.windGust?.toFixed(0)} kt gusts` },
        { label: "Period", weight: 2, key: "wavePeriod",
          // Short periods = steep, dangerous chop at the inlet mouth.
          score: (c) => scoreHigherBetter(c.wavePeriod, [7, 6, 5, 4]),
          hint:  (c) => `${c.wavePeriod?.toFixed(1)} s wave period` },
        { label: "Rain",   weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint:  (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

  };

  function scoreToLetter(score) {
    if (score >= 88) return "A";
    if (score >= 75) return "B";
    if (score >= 60) return "C";
    if (score >= 42) return "D";
    return "F";
  }

  function verdictForGrade(letter) {
    switch (letter) {
      case "A": return { tag: "GO",        text: "Great day to head out — calm and clear." };
      case "B": return { tag: "GO",        text: "Good conditions — go fishing." };
      case "C": return { tag: "CAUTION",   text: "Workable but not glass — keep an eye on the wind." };
      case "D": return { tag: "ROUGH",     text: "Rough — only if you and the boat are ready." };
      case "F": return { tag: "STAY HOME", text: "Dangerous for a small boat. Don't go." };
    }
  }

  function grade(activityKey, conditions) {
    const profile = PROFILES[activityKey];
    if (!profile) return null;

    let weightedSum = 0;
    let totalWeight = 0;
    const reasons = [];

    for (const rule of profile.rules) {
      const s = rule.score(conditions);
      if (s == null) continue;
      weightedSum += s * rule.weight;
      totalWeight += rule.weight;
      reasons.push({ label: rule.label, score: s, hint: rule.hint(conditions) });
    }

    const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const letter = scoreToLetter(finalScore);
    const verdict = verdictForGrade(letter);

    const concerns = reasons
      .filter((r) => r.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const highlights = reasons
      .filter((r) => r.score >= 85)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    return {
      key: activityKey,
      name: profile.name,
      blurb: profile.blurb,
      score: Math.round(finalScore),
      grade: letter,
      verdict,
      concerns,
      highlights,
    };
  }

  const ACTIVITY_KEYS = ["fishing-offshore", "fishing-reef", "fishing-bay"];

  function gradeAll(conditions) {
    return ACTIVITY_KEYS.map((k) => grade(k, conditions));
  }

  // Overall "go / no-go" headline = grade of the chosen scenario, or the
  // mildest of the three (since bay is usually easiest).
  function overallVerdict(grades) {
    const order = ["A", "B", "C", "D", "F"];
    const best = grades.reduce((acc, g) =>
      order.indexOf(g.grade) < order.indexOf(acc.grade) ? g : acc, grades[0]);
    return best;
  }

  return { grade, gradeAll, ACTIVITY_KEYS, scoreToLetter, overallVerdict };
})();
