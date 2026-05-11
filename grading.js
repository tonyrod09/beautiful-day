/* ============ Beautiful Day — Activity Grading ============
 *
 * Each activity profile defines a set of weighted rules. Each rule scores a
 * single condition (e.g. wave height) from 0-100. Rules can be lower-is-better,
 * higher-is-better, or band-shaped (sailing wants 8-15kt wind, not 0 or 30).
 *
 * Final letter grade comes from the weighted average score.
 *
 * Conditions object expected by grade():
 *   waveHeight (ft), wavePeriod (s), windSpeed (kt), windGust (kt),
 *   precipitation (in), cloudCover (%), visibility (km), temperature (F)
 */

const Grading = (() => {

  // ---------- Threshold scorers ----------
  // thresholds = [aMax, bMax, cMax, dMax]   (lower = better)
  function scoreLowerBetter(value, [a, b, c, d]) {
    if (value == null || isNaN(value)) return null;
    if (value <= a) return 100 - Math.max(0, (value / a) * 5);   // 95-100
    if (value <= b) return 85 - ((value - a) / (b - a)) * 10;    // 75-85
    if (value <= c) return 70 - ((value - b) / (c - b)) * 10;    // 60-70
    if (value <= d) return 55 - ((value - c) / (d - c)) * 15;    // 40-55
    // Beyond D — degrade to floor based on overshoot.
    return Math.max(0, 35 - (value - d) * 2);
  }

  // thresholds = [aMin, bMin, cMin, dMin]   (higher = better)
  function scoreHigherBetter(value, [a, b, c, d]) {
    if (value == null || isNaN(value)) return null;
    if (value >= a) return 95;
    if (value >= b) return 75 + ((value - b) / (a - b)) * 20;
    if (value >= c) return 60 + ((value - c) / (b - c)) * 15;
    if (value >= d) return 40 + ((value - d) / (c - d)) * 20;
    return Math.max(0, 35 + value * 2);
  }

  // band-shaped: ideal range [low, high]; outside fades.
  // half-widths control how fast score falls off below low / above high.
  function scoreBand(value, low, high, fadeBelow, fadeAbove) {
    if (value == null || isNaN(value)) return null;
    if (value >= low && value <= high) return 95;
    if (value < low) {
      const deficit = low - value;
      return Math.max(0, 95 - (deficit / fadeBelow) * 60);
    }
    const excess = value - high;
    return Math.max(0, 95 - (excess / fadeAbove) * 60);
  }

  // ---------- Activity profiles ----------
  // Each rule: { label, weight, score: (c) => number|null, hint: (c, score) => string }
  const PROFILES = {

    "fishing-offshore": {
      name: "Offshore Fishing",
      blurb: "Going past the inlet for the big stuff",
      rules: [
        { label: "Seas", weight: 3, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [2, 3, 4, 5]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft seas` },
        { label: "Wind", weight: 2, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [10, 15, 20, 25]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Gusts", weight: 1, key: "windGust",
          score: (c) => scoreLowerBetter(c.windGust, [15, 22, 28, 35]),
          hint: (c) => `${c.windGust?.toFixed(0)} kt gusts` },
        { label: "Period", weight: 1, key: "wavePeriod",
          score: (c) => scoreHigherBetter(c.wavePeriod, [8, 6, 5, 4]),
          hint: (c) => `${c.wavePeriod?.toFixed(1)} s period` },
        { label: "Rain", weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "fishing-bay": {
      name: "Bay / Inshore Fishing",
      blurb: "Inside the inlet — bays, sounds, harbors",
      rules: [
        { label: "Wind", weight: 3, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [8, 12, 18, 25]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Chop", weight: 2, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [1, 1.5, 2.5, 3.5]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft chop` },
        { label: "Rain", weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "sandbar": {
      name: "Sand Bar Day",
      blurb: "Anchor up, swim around, soak up sun",
      rules: [
        { label: "Sun", weight: 2, key: "cloudCover",
          score: (c) => scoreLowerBetter(c.cloudCover, [30, 50, 70, 90]),
          hint: (c) => `${c.cloudCover?.toFixed(0)}% clouds` },
        { label: "Warmth", weight: 1, key: "temperature",
          score: (c) => scoreHigherBetter(c.temperature, [78, 72, 65, 55]),
          hint: (c) => `${c.temperature?.toFixed(0)}°F air` },
        { label: "Wind", weight: 2, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [8, 12, 16, 20]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Waves", weight: 2, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [1, 2, 3, 4]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft waves` },
        { label: "Rain", weight: 2, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.05, 0.1, 0.25]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "snorkeling": {
      name: "Snorkeling",
      blurb: "Clear water, calm surface, sunshine",
      rules: [
        { label: "Surface calm", weight: 3, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [1, 1.5, 2.5, 4]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft surface` },
        { label: "Wind", weight: 2, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [8, 12, 16, 20]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Period (clarity)", weight: 1, key: "wavePeriod",
          score: (c) => scoreHigherBetter(c.wavePeriod, [7, 6, 5, 4]),
          hint: (c) => `${c.wavePeriod?.toFixed(1)} s period` },
        { label: "Visibility (air)", weight: 1, key: "visibility",
          score: (c) => scoreHigherBetter(c.visibility, [9, 6, 4, 2]),
          hint: (c) => `${c.visibility?.toFixed(0)} mi visibility` },
        { label: "Rain", weight: 2, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "diving": {
      name: "Scuba Diving",
      blurb: "Surface conditions and clarity",
      rules: [
        { label: "Seas", weight: 3, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [2, 3, 4, 5]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft seas` },
        { label: "Wind", weight: 2, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [10, 15, 20, 25]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Period", weight: 1, key: "wavePeriod",
          score: (c) => scoreHigherBetter(c.wavePeriod, [8, 6, 5, 4]),
          hint: (c) => `${c.wavePeriod?.toFixed(1)} s period` },
        { label: "Visibility", weight: 1, key: "visibility",
          score: (c) => scoreHigherBetter(c.visibility, [9, 6, 4, 2]),
          hint: (c) => `${c.visibility?.toFixed(0)} mi visibility` },
        { label: "Rain", weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "sailing": {
      name: "Sailing",
      blurb: "Needs wind — but not too much",
      rules: [
        { label: "Wind", weight: 3, key: "windSpeed",
          score: (c) => scoreBand(c.windSpeed, 8, 18, 8, 12),
          hint: (c) => {
            const w = c.windSpeed;
            if (w == null) return "no wind data";
            if (w < 5) return `${w.toFixed(0)} kt — too light`;
            if (w > 25) return `${w.toFixed(0)} kt — overpowered`;
            return `${w.toFixed(0)} kt wind`;
          } },
        { label: "Gusts", weight: 1, key: "windGust",
          score: (c) => scoreLowerBetter(c.windGust, [18, 25, 30, 38]),
          hint: (c) => `${c.windGust?.toFixed(0)} kt gusts` },
        { label: "Seas", weight: 2, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [3, 5, 7, 9]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft seas` },
        { label: "Rain", weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.1, 0.25, 0.5, 1]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "paddleboarding": {
      name: "Paddleboarding",
      blurb: "Wants glass — no wind, no chop",
      rules: [
        { label: "Wind", weight: 3, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [6, 10, 14, 18]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Waves", weight: 3, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [1, 1.5, 2, 3]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft chop` },
        { label: "Warmth", weight: 1, key: "temperature",
          score: (c) => scoreHigherBetter(c.temperature, [72, 65, 58, 50]),
          hint: (c) => `${c.temperature?.toFixed(0)}°F` },
        { label: "Rain", weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.02, 0.1, 0.25, 0.5]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
      ],
    },

    "kayaking": {
      name: "Kayaking",
      blurb: "Forgiving but still wants calm",
      rules: [
        { label: "Wind", weight: 3, key: "windSpeed",
          score: (c) => scoreLowerBetter(c.windSpeed, [8, 14, 18, 22]),
          hint: (c) => `${c.windSpeed?.toFixed(0)} kt wind` },
        { label: "Waves", weight: 3, key: "waveHeight",
          score: (c) => scoreLowerBetter(c.waveHeight, [1, 2, 3, 4]),
          hint: (c) => `${c.waveHeight?.toFixed(1)} ft waves` },
        { label: "Rain", weight: 1, key: "precipitation",
          score: (c) => scoreLowerBetter(c.precipitation, [0.05, 0.15, 0.3, 0.6]),
          hint: (c) => `${c.precipitation?.toFixed(2)}″ rain` },
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

  function summaryForGrade(letter) {
    switch (letter) {
      case "A": return "Beautiful day — go for it!";
      case "B": return "Solid conditions, minor caveats.";
      case "C": return "Workable but not ideal.";
      case "D": return "Rough — only if you're prepared.";
      case "F": return "Stay home. Not safe or fun.";
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

    // Top concerns: rules scoring below 70 (sorted worst-first).
    const concerns = reasons
      .filter((r) => r.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    // Highlights (if grade is good): rules scoring 85+.
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
      summary: summaryForGrade(letter),
      concerns,
      highlights,
    };
  }

  const ACTIVITY_KEYS = [
    "fishing-offshore",
    "fishing-bay",
    "sailing",
    "sandbar",
    "snorkeling",
    "diving",
    "paddleboarding",
    "kayaking",
  ];

  function gradeAll(conditions) {
    return ACTIVITY_KEYS.map((k) => grade(k, conditions));
  }

  return { grade, gradeAll, ACTIVITY_KEYS, scoreToLetter };
})();
