/* ============ Beautiful Day — SVG Icon Library ============ */
/* All icons are cartoon-style, marine sunny-day themed. */

const Icons = (() => {

  // ---------- Weather icons ----------
  const sunny = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <g stroke="#F0A929" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="4" x2="32" y2="12"/>
        <line x1="32" y1="52" x2="32" y2="60"/>
        <line x1="4" y1="32" x2="12" y2="32"/>
        <line x1="52" y1="32" x2="60" y2="32"/>
        <line x1="12" y1="12" x2="18" y2="18"/>
        <line x1="46" y1="46" x2="52" y2="52"/>
        <line x1="12" y1="52" x2="18" y2="46"/>
        <line x1="46" y1="18" x2="52" y2="12"/>
      </g>
      <circle cx="32" cy="32" r="14" fill="#FFD93D" stroke="#F0A929" stroke-width="2"/>
      <circle cx="28" cy="29" r="2" fill="#7B5800"/>
      <circle cx="36" cy="29" r="2" fill="#7B5800"/>
      <path d="M27 36 Q32 40 37 36" stroke="#7B5800" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;

  const partlyCloudy = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <circle cx="22" cy="24" r="11" fill="#FFD93D" stroke="#F0A929" stroke-width="2"/>
      <g stroke="#F0A929" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="6" x2="22" y2="10"/>
        <line x1="4" y1="24" x2="8" y2="24"/>
        <line x1="9" y1="11" x2="12" y2="14"/>
      </g>
      <path d="M44 30 Q50 30 50 36 Q56 36 56 42 Q56 48 50 48 L24 48 Q18 48 18 42 Q18 36 24 36 Q24 30 30 30 Q32 26 38 26 Q44 26 44 30 Z"
            fill="#FFFFFF" stroke="#A8C5DD" stroke-width="2"/>
    </svg>`;

  const cloudy = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <path d="M46 24 Q52 24 52 30 Q58 30 58 36 Q58 44 50 44 L18 44 Q10 44 10 36 Q10 30 16 30 Q16 22 24 22 Q28 16 36 16 Q46 16 46 24 Z"
            fill="#FFFFFF" stroke="#A8C5DD" stroke-width="2"/>
    </svg>`;

  const rainy = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <path d="M46 18 Q52 18 52 24 Q58 24 58 30 Q58 38 50 38 L18 38 Q10 38 10 30 Q10 24 16 24 Q16 16 24 16 Q28 10 36 10 Q46 10 46 18 Z"
            fill="#C9D8E6" stroke="#7A95B0" stroke-width="2"/>
      <g fill="#4A90D9">
        <path d="M22 44 L18 54 L20 56 L24 46 Z"/>
        <path d="M34 44 L30 54 L32 56 L36 46 Z"/>
        <path d="M46 44 L42 54 L44 56 L48 46 Z"/>
      </g>
    </svg>`;

  const stormy = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <path d="M46 18 Q52 18 52 24 Q58 24 58 30 Q58 38 50 38 L18 38 Q10 38 10 30 Q10 24 16 24 Q16 16 24 16 Q28 10 36 10 Q46 10 46 18 Z"
            fill="#6F7E8E" stroke="#3D4D5E" stroke-width="2"/>
      <polygon points="30,40 24,52 30,52 26,60 38,46 32,46 36,40" fill="#FFD93D" stroke="#F0A929" stroke-width="1.5"/>
    </svg>`;

  const foggy = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <g stroke="#A8C5DD" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85">
        <line x1="8" y1="20" x2="56" y2="20"/>
        <line x1="6" y1="32" x2="54" y2="32"/>
        <line x1="10" y1="44" x2="58" y2="44"/>
      </g>
    </svg>`;

  // ---------- Wave / Sea state icons ----------
  const wavesCalm = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <circle cx="48" cy="14" r="6" fill="#FFD93D"/>
      <path d="M4 38 Q12 34 20 38 T36 38 T52 38 T64 38" stroke="#4A90D9" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M4 48 Q12 44 20 48 T36 48 T52 48 T64 48" stroke="#2E6FB5" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;

  const wavesModerate = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <path d="M4 32 Q14 22 24 32 T44 32 T64 32" stroke="#4A90D9" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M4 44 Q14 34 24 44 T44 44 T64 44" stroke="#2E6FB5" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M4 56 Q14 46 24 56 T44 56 T64 56" stroke="#1E4F8C" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;

  const wavesRough = (size = 56) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}">
      <path d="M2 28 Q12 8 22 28 T42 28 T62 28" stroke="#2E6FB5" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M2 42 Q12 22 22 42 T42 42 T62 42" stroke="#1E4F8C" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M14 14 Q18 8 22 14" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M34 14 Q38 8 42 14" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;

  // ---------- Wind icon ----------
  const wind = (size = 28) => `
    <svg viewBox="0 0 32 32" width="${size}" height="${size}">
      <g stroke="#4A90D9" stroke-width="2.5" fill="none" stroke-linecap="round">
        <path d="M4 10 L22 10 Q26 10 26 6"/>
        <path d="M4 16 L26 16 Q30 16 30 20"/>
        <path d="M4 22 L20 22 Q24 22 24 26"/>
      </g>
    </svg>`;

  const thermometer = (size = 28) => `
    <svg viewBox="0 0 32 32" width="${size}" height="${size}">
      <rect x="13" y="4" width="6" height="18" rx="3" fill="#FFFFFF" stroke="#E74C3C" stroke-width="2"/>
      <circle cx="16" cy="24" r="5" fill="#E74C3C"/>
      <rect x="15" y="8" width="2" height="14" fill="#E74C3C"/>
    </svg>`;

  const compass = (size = 28) => `
    <svg viewBox="0 0 32 32" width="${size}" height="${size}">
      <circle cx="16" cy="16" r="12" fill="#FFFFFF" stroke="#4A90D9" stroke-width="2"/>
      <polygon points="16,6 19,16 16,14 13,16" fill="#E74C3C"/>
      <polygon points="16,26 19,16 16,18 13,16" fill="#2E6FB5"/>
    </svg>`;

  const eye = (size = 28) => `
    <svg viewBox="0 0 32 32" width="${size}" height="${size}">
      <path d="M2 16 Q16 4 30 16 Q16 28 2 16 Z" fill="#FFFFFF" stroke="#4A90D9" stroke-width="2"/>
      <circle cx="16" cy="16" r="5" fill="#4A90D9"/>
      <circle cx="16" cy="16" r="2" fill="#0F2A47"/>
    </svg>`;

  const droplet = (size = 28) => `
    <svg viewBox="0 0 32 32" width="${size}" height="${size}">
      <path d="M16 4 Q8 16 8 22 Q8 28 16 28 Q24 28 24 22 Q24 16 16 4 Z" fill="#4A90D9" stroke="#2E6FB5" stroke-width="2"/>
    </svg>`;

  // ---------- Activity icons ----------
  const fishingRod = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <line x1="8" y1="40" x2="40" y2="6" stroke="#8B5A2B" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="10" x2="36" y2="32" stroke="#666" stroke-width="1.5"/>
      <path d="M30 32 Q32 36 36 34 Q38 32 36 28 Q33 30 30 32 Z M28 32 L24 31" fill="#4A90D9" stroke="#2E6FB5" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="34" cy="30" r="1.2" fill="#0F2A47"/>
      <path d="M2 42 Q8 38 14 42 T26 42 T46 42" stroke="#4A90D9" stroke-width="2" fill="none"/>
    </svg>`;

  const sandbar = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <circle cx="38" cy="10" r="6" fill="#FFD93D"/>
      <path d="M2 38 Q12 30 24 36 T46 32 L46 44 L2 44 Z" fill="#FFE89C" stroke="#E8B900" stroke-width="1.5"/>
      <ellipse cx="14" cy="32" rx="6" ry="2" fill="#E8B900" opacity="0.4"/>
      <line x1="26" y1="14" x2="26" y2="34" stroke="#8B5A2B" stroke-width="2"/>
      <path d="M16 20 Q26 8 36 20 Z" fill="#E74C3C" stroke="#8B2D2D" stroke-width="1.5"/>
      <path d="M16 20 L36 20" stroke="#8B2D2D" stroke-width="1"/>
    </svg>`;

  const snorkel = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <path d="M8 18 L8 28 Q8 36 18 36 L30 36 Q40 36 40 28 L40 18 Q40 12 30 12 L18 12 Q8 12 8 18 Z" fill="#4A90D9" stroke="#2E6FB5" stroke-width="2"/>
      <ellipse cx="18" cy="22" rx="5" ry="4" fill="#CFEAF7"/>
      <ellipse cx="30" cy="22" rx="5" ry="4" fill="#CFEAF7"/>
      <line x1="38" y1="14" x2="38" y2="4" stroke="#E74C3C" stroke-width="3" stroke-linecap="round"/>
      <rect x="36" y="4" width="4" height="3" fill="#E74C3C"/>
    </svg>`;

  const diving = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <rect x="18" y="6" width="12" height="18" rx="3" fill="#FFD93D" stroke="#F0A929" stroke-width="2"/>
      <rect x="20" y="24" width="8" height="4" fill="#666"/>
      <circle cx="24" cy="34" r="6" fill="#FFE0BD" stroke="#0F2A47" stroke-width="1.5"/>
      <path d="M18 30 Q20 26 24 28 Q28 26 30 30" stroke="#0F2A47" stroke-width="1.5" fill="none"/>
      <path d="M30 36 L40 32 L40 40 L36 38 Z" fill="#4A90D9" stroke="#2E6FB5" stroke-width="1.5"/>
      <circle cx="6" cy="14" r="2" fill="#A8C5DD" opacity="0.7"/>
      <circle cx="4" cy="22" r="1.5" fill="#A8C5DD" opacity="0.6"/>
    </svg>`;

  const sailing = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <line x1="24" y1="4" x2="24" y2="32" stroke="#8B5A2B" stroke-width="2"/>
      <polygon points="24,6 24,30 8,30" fill="#FFFFFF" stroke="#A8C5DD" stroke-width="1.5"/>
      <polygon points="26,10 26,30 40,30" fill="#FFD93D" stroke="#F0A929" stroke-width="1.5"/>
      <path d="M6 34 L42 34 L36 42 L12 42 Z" fill="#8B5A2B" stroke="#5C3A1A" stroke-width="1.5"/>
      <path d="M2 44 Q12 40 22 44 T42 44" stroke="#4A90D9" stroke-width="2" fill="none"/>
    </svg>`;

  const paddleboard = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <ellipse cx="24" cy="34" rx="20" ry="5" fill="#FFD93D" stroke="#F0A929" stroke-width="2"/>
      <line x1="14" y1="8" x2="22" y2="32" stroke="#8B5A2B" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="14" cy="8" rx="3" ry="2" fill="#8B5A2B"/>
      <circle cx="22" cy="20" r="4" fill="#FFE0BD" stroke="#0F2A47" stroke-width="1.5"/>
      <rect x="20" y="24" width="4" height="8" fill="#4A90D9"/>
      <path d="M2 42 Q12 38 24 42 T46 42" stroke="#4A90D9" stroke-width="2" fill="none"/>
    </svg>`;

  const kayaking = (size = 44) => `
    <svg viewBox="0 0 48 48" width="${size}" height="${size}">
      <ellipse cx="24" cy="28" rx="20" ry="6" fill="#E74C3C" stroke="#8B2D2D" stroke-width="2"/>
      <ellipse cx="24" cy="28" rx="14" ry="3" fill="#8B2D2D"/>
      <circle cx="24" cy="22" r="4" fill="#FFE0BD" stroke="#0F2A47" stroke-width="1.5"/>
      <line x1="6" y1="16" x2="42" y2="34" stroke="#8B5A2B" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="6" cy="16" rx="3" ry="2" fill="#8B5A2B" transform="rotate(-20 6 16)"/>
      <ellipse cx="42" cy="34" rx="3" ry="2" fill="#8B5A2B" transform="rotate(-20 42 34)"/>
    </svg>`;

  const buoyIcon = (size = 28) => `
    <svg viewBox="0 0 32 32" width="${size}" height="${size}">
      <path d="M16 4 L22 16 L10 16 Z" fill="#E74C3C" stroke="#8B2D2D" stroke-width="1.5"/>
      <rect x="14" y="16" width="4" height="6" fill="#FFD93D" stroke="#F0A929" stroke-width="1"/>
      <path d="M4 26 Q10 22 16 26 T28 26" stroke="#4A90D9" stroke-width="2" fill="none"/>
    </svg>`;

  // ---------- Helpers ----------
  // Map Open-Meteo weather codes to a category.
  // See: https://open-meteo.com/en/docs (WMO codes)
  function weatherIconForCode(code, isDay = true) {
    if (code === 0) return isDay ? sunny() : sunny();
    if (code === 1 || code === 2) return partlyCloudy();
    if (code === 3) return cloudy();
    if (code === 45 || code === 48) return foggy();
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return rainy();
    if (code >= 71 && code <= 77) return cloudy();
    if (code >= 95) return stormy();
    return partlyCloudy();
  }

  function smallWeatherIcon(code, size = 32) {
    if (code === 0) return sunny(size);
    if (code === 1 || code === 2) return partlyCloudy(size);
    if (code === 3) return cloudy(size);
    if (code === 45 || code === 48) return foggy(size);
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return rainy(size);
    if (code >= 71 && code <= 77) return cloudy(size);
    if (code >= 95) return stormy(size);
    return partlyCloudy(size);
  }

  function seaStateIcon(waveHeightFt) {
    if (waveHeightFt == null) return wavesCalm();
    if (waveHeightFt < 2) return wavesCalm();
    if (waveHeightFt < 4) return wavesModerate();
    return wavesRough();
  }

  function activityIcon(key, size = 44) {
    switch (key) {
      case "fishing-offshore": return fishingRod(size);
      case "fishing-bay":      return fishingRod(size);
      case "sandbar":          return sandbar(size);
      case "snorkeling":       return snorkel(size);
      case "diving":           return diving(size);
      case "sailing":          return sailing(size);
      case "paddleboarding":   return paddleboard(size);
      case "kayaking":         return kayaking(size);
      default: return sunny(size);
    }
  }

  return {
    sunny, partlyCloudy, cloudy, rainy, stormy, foggy,
    wavesCalm, wavesModerate, wavesRough,
    wind, thermometer, compass, eye, droplet, buoyIcon,
    weatherIconForCode, smallWeatherIcon, seaStateIcon,
    activityIcon,
  };
})();
