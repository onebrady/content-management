// Color utility functions for Mantine theme integration

/**
 * Type for custom colors in our theme
 */
export interface CustomColors {
  // Light theme colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;

  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  // Sidebar colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;

  // Dark theme colors
  backgroundDark: string;
  foregroundDark: string;
  cardDark: string;
  cardForegroundDark: string;
  popoverDark: string;
  popoverForegroundDark: string;
  primaryDark: string;
  primaryForegroundDark: string;
  secondaryDark: string;
  secondaryForegroundDark: string;
  mutedDark: string;
  mutedForegroundDark: string;
  accentDark: string;
  accentForegroundDark: string;
  destructiveDark: string;
  destructiveForegroundDark: string;
  borderDark: string;
  inputDark: string;
  ringDark: string;

  // Dark chart colors
  chart1Dark: string;
  chart2Dark: string;
  chart3Dark: string;
  chart4Dark: string;
  chart5Dark: string;

  // Dark sidebar colors
  sidebarDark: string;
  sidebarForegroundDark: string;
  sidebarPrimaryDark: string;
  sidebarPrimaryForegroundDark: string;
  sidebarAccentDark: string;
  sidebarAccentForegroundDark: string;
  sidebarBorderDark: string;
  sidebarRingDark: string;
}

/**
 * Converts a hex color to HSL for manipulation
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove the # if present
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates a 10-shade color tuple for Mantine from a base hex color
 */
export function generateColorShades(
  baseHex: string
): readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] {
  const { h, s, l } = hexToHsl(baseHex);

  // Generate 10 shades with varying lightness
  const shades: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Create a progression from very light to very dark
    let newL: number;

    if (i === 6) {
      // Index 6 is the main color
      newL = l;
    } else if (i < 6) {
      // Lighter shades (0-5)
      newL = l + (95 - l) * (1 - i / 6);
    } else {
      // Darker shades (7-9)
      newL = l * 0.9 ** (i - 6);
    }

    // Ensure lightness stays within bounds
    newL = Math.max(0, Math.min(100, newL));

    // Adjust saturation for lighter/darker shades
    let newS = s;
    if (i < 6) {
      // Reduce saturation for lighter shades
      newS = s * (0.5 + (i / 6) * 0.5);
    }

    shades.push(hslToHex(h, newS, newL));
  }

  return shades as readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
}

/**
 * Generates a simple color array (for backward compatibility)
 */
export function hexToShades(hex: string): string[] {
  return generateColorShades(hex) as string[];
}

/**
 * Validates if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Get custom colors from theme
 */
export function getCustomColors(theme: any): CustomColors {
  return (
    theme.other?.customColors || {
      // Light theme colors
      background: '#faf9f5',
      foreground: '#3d3929',
      card: '#faf9f5',
      cardForeground: '#141413',
      popover: '#ffffff',
      popoverForeground: '#28261b',
      primary: '#c96442',
      primaryForeground: '#ffffff',
      secondary: '#e9e6dc',
      secondaryForeground: '#535146',
      muted: '#ede9de',
      mutedForeground: '#83827d',
      accent: '#e9e6dc',
      accentForeground: '#28261b',
      destructive: '#141413',
      destructiveForeground: '#ffffff',
      border: '#dad9d4',
      input: '#b4b2a7',
      ring: '#c96442',

      // Chart colors
      chart1: '#b05730',
      chart2: '#9c87f5',
      chart3: '#ded8c4',
      chart4: '#dbd3f0',
      chart5: '#b4552d',

      // Sidebar colors
      sidebar: '#f5f4ee',
      sidebarForeground: '#3d3d3a',
      sidebarPrimary: '#c96442',
      sidebarPrimaryForeground: '#fbfbfb',
      sidebarAccent: '#e9e6dc',
      sidebarAccentForeground: '#343434',
      sidebarBorder: '#ebebeb',
      sidebarRing: '#b5b5b5',

      // Dark theme colors
      backgroundDark: '#262624',
      foregroundDark: '#c3c0b6',
      cardDark: '#262624',
      cardForegroundDark: '#faf9f5',
      popoverDark: '#30302e',
      popoverForegroundDark: '#e5e5e2',
      primaryDark: '#d97757',
      primaryForegroundDark: '#ffffff',
      secondaryDark: '#faf9f5',
      secondaryForegroundDark: '#30302e',
      mutedDark: '#1b1b19',
      mutedForegroundDark: '#b7b5a9',
      accentDark: '#1a1915',
      accentForegroundDark: '#f5f4ee',
      destructiveDark: '#ef4444',
      destructiveForegroundDark: '#ffffff',
      borderDark: '#3e3e38',
      inputDark: '#52514a',
      ringDark: '#d97757',

      // Dark chart colors
      chart1Dark: '#b05730',
      chart2Dark: '#9c87f5',
      chart3Dark: '#1a1915',
      chart4Dark: '#2f2b48',
      chart5Dark: '#b4552d',

      // Dark sidebar colors
      sidebarDark: '#1f1e1d',
      sidebarForegroundDark: '#c3c0b6',
      sidebarPrimaryDark: '#343434',
      sidebarPrimaryForegroundDark: '#fbfbfb',
      sidebarAccentDark: '#0f0f0e',
      sidebarAccentForegroundDark: '#c3c0b6',
      sidebarBorderDark: '#ebebeb',
      sidebarRingDark: '#b5b5b5',
    }
  );
}
