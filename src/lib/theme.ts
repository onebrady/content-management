import { createTheme, CSSVariablesResolver } from '@mantine/core';
import { generateColorShades } from './theme-utils';

// Create the base theme with colors and styling
export const customTheme = createTheme({
  // Set primary color to use our custom terracotta color
  primaryColor: 'terracotta',

  // Define colors following Mantine's structure
  colors: {
    // Custom terracotta color as primary
    terracotta: generateColorShades('#c96442'),

    // Custom cream color
    cream: generateColorShades('#e9e6dc'),

    // Custom background color
    background: generateColorShades('#faf9f5'),

    // Override default blue to use our terracotta
    blue: generateColorShades('#c96442'),

    // Override default gray to use our muted colors
    gray: generateColorShades('#83827d'),

    // Dark mode colors for Mantine
    dark: [
      '#c3c0b6', // 0: Light text color in dark mode
      '#b7b5a9', // 1: Muted text color in dark mode
      '#9c9990', // 2
      '#82807a', // 3
      '#686763', // 4
      '#4e4d49', // 5
      '#3e3e38', // 6
      '#30302e', // 7
      '#262624', // 8: Background color in dark mode
      '#1f1e1d', // 9: Sidebar background in dark mode
    ],
  },

  // Shadows
  shadows: {
    '2xs': '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
    xs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
    sm: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
    md: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)',
    lg: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)',
    xl: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)',
    '2xl': '0 1px 3px 0px hsl(0 0% 0% / 0.25)',
  },

  // Border radius
  radius: {
    xs: 'calc(0.5rem - 4px)',
    sm: 'calc(0.5rem - 2px)',
    md: '0.5rem',
    lg: 'calc(0.5rem + 4px)',
    xl: 'calc(0.5rem + 8px)',
  },

  // Font families
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  // Headings configuration
  headings: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontWeight: '600',
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  // Default radius
  defaultRadius: 'md',

  // Focus ring configuration
  focusRing: 'auto',

  // Auto contrast for better accessibility
  autoContrast: true,
  luminanceThreshold: 0.3,

  // Custom properties for additional theming
  other: {
    // Custom color references for use in components
    customColors: {
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

      // Sidebar specific colors
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

      // Dark sidebar specific colors
      sidebarDark: '#1f1e1d',
      sidebarForegroundDark: '#c3c0b6',
      sidebarPrimaryDark: '#343434',
      sidebarPrimaryForegroundDark: '#fbfbfb',
      sidebarAccentDark: '#0f0f0e',
      sidebarAccentForegroundDark: '#c3c0b6',
      sidebarBorderDark: '#ebebeb',
      sidebarRingDark: '#b5b5b5',
    },
  },
});

// CSS variables resolver to map our theme to CSS custom properties
export const cssVariablesResolver: CSSVariablesResolver = (theme) => {
  const colors = theme.other?.customColors || {};

  return {
    // Variables shared across light/dark modes
    variables: {
      '--font-sans': theme.fontFamily,
      '--font-serif':
        'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      '--font-mono': theme.fontFamilyMonospace,
      '--radius': '0.5rem',
      '--radius-sm': theme.radius.sm,
      '--radius-md': theme.radius.md,
      '--radius-lg': theme.radius.lg,
      '--radius-xl': theme.radius.xl,
      '--shadow-2xs': theme.shadows['2xs'],
      '--shadow-xs': theme.shadows.xs,
      '--shadow-sm': theme.shadows.sm,
      '--shadow': theme.shadows.md,
      '--shadow-md': theme.shadows.md,
      '--shadow-lg': theme.shadows.lg,
      '--shadow-xl': theme.shadows.xl,
      '--shadow-2xl': theme.shadows['2xl'],
      '--tracking-normal': '0em',
      '--spacing': theme.spacing.xs,
    },

    // Light theme variables
    light: {
      '--background': colors.background,
      '--foreground': colors.foreground,
      '--card': colors.card,
      '--card-foreground': colors.cardForeground,
      '--popover': colors.popover,
      '--popover-foreground': colors.popoverForeground,
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--secondary': colors.secondary,
      '--secondary-foreground': colors.secondaryForeground,
      '--muted': colors.muted,
      '--muted-foreground': colors.mutedForeground,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--destructive': colors.destructive,
      '--destructive-foreground': colors.destructiveForeground,
      '--border': colors.border,
      '--input': colors.input,
      '--ring': colors.ring,
      '--chart-1': colors.chart1,
      '--chart-2': colors.chart2,
      '--chart-3': colors.chart3,
      '--chart-4': colors.chart4,
      '--chart-5': colors.chart5,
      '--sidebar': colors.sidebar,
      '--sidebar-foreground': colors.sidebarForeground,
      '--sidebar-primary': colors.sidebarPrimary,
      '--sidebar-primary-foreground': colors.sidebarPrimaryForeground,
      '--sidebar-accent': colors.sidebarAccent,
      '--sidebar-accent-foreground': colors.sidebarAccentForeground,
      '--sidebar-border': colors.sidebarBorder,
      '--sidebar-ring': colors.sidebarRing,

      // Mantine compatibility for sidebar colors
      '--mantine-color-sidebar': colors.sidebar,
      '--mantine-color-sidebar-text': colors.sidebarForeground,
      '--mantine-color-sidebar-primary': colors.sidebarPrimary,
    },

    // Dark theme variables
    dark: {
      '--background': colors.backgroundDark,
      '--foreground': colors.foregroundDark,
      '--card': colors.cardDark,
      '--card-foreground': colors.cardForegroundDark,
      '--popover': colors.popoverDark,
      '--popover-foreground': colors.popoverForegroundDark,
      '--primary': colors.primaryDark,
      '--primary-foreground': colors.primaryForegroundDark,
      '--secondary': colors.secondaryDark,
      '--secondary-foreground': colors.secondaryForegroundDark,
      '--muted': colors.mutedDark,
      '--muted-foreground': colors.mutedForegroundDark,
      '--accent': colors.accentDark,
      '--accent-foreground': colors.accentForegroundDark,
      '--destructive': colors.destructiveDark,
      '--destructive-foreground': colors.destructiveForegroundDark,
      '--border': colors.borderDark,
      '--input': colors.inputDark,
      '--ring': colors.ringDark,
      '--chart-1': colors.chart1Dark,
      '--chart-2': colors.chart2Dark,
      '--chart-3': colors.chart3Dark,
      '--chart-4': colors.chart4Dark,
      '--chart-5': colors.chart5Dark,
      '--sidebar': colors.sidebarDark,
      '--sidebar-foreground': colors.sidebarForegroundDark,
      '--sidebar-primary': colors.sidebarPrimaryDark,
      '--sidebar-primary-foreground': colors.sidebarPrimaryForegroundDark,
      '--sidebar-accent': colors.sidebarAccentDark,
      '--sidebar-accent-foreground': colors.sidebarAccentForegroundDark,
      '--sidebar-border': colors.sidebarBorderDark,
      '--sidebar-ring': colors.sidebarRingDark,

      // Mantine compatibility for sidebar colors
      '--mantine-color-sidebar': colors.sidebarDark,
      '--mantine-color-sidebar-text': colors.sidebarForegroundDark,
      '--mantine-color-sidebar-primary': colors.sidebarPrimaryDark,
    },
  };
};
