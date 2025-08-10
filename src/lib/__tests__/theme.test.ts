// Mock Mantine core theming creation to avoid version differences in tests
jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core');
  return {
    ...actual,
    createTheme: (input: any) => input,
  };
});

import { customTheme } from '../theme';
import { generateColorShades, isValidHexColor } from '../theme-utils';

describe('Theme Configuration', () => {
  describe('customTheme', () => {
    it('should have the correct primary color', () => {
      expect(customTheme.colors?.terracotta).toBeDefined();
      expect(customTheme.colors?.terracotta[6]).toBe('#c96442');
    });

    it('should have the correct secondary color', () => {
      expect(customTheme.colors?.cream).toBeDefined();
      expect(customTheme.colors?.cream[6]).toBe('#e9e6dc');
    });

    it('should have shadows configured', () => {
      expect(customTheme.shadows).toBeDefined();
      expect(customTheme.shadows.xs).toBeDefined();
      expect(customTheme.shadows.sm).toBeDefined();
      expect(customTheme.shadows.md).toBeDefined();
      expect(customTheme.shadows.lg).toBeDefined();
      expect(customTheme.shadows.xl).toBeDefined();
    });

    it('should have border radius configured', () => {
      expect(customTheme.radius).toBeDefined();
      expect(customTheme.radius.xs).toBeDefined();
      expect(customTheme.radius.sm).toBeDefined();
      expect(customTheme.radius.md).toBeDefined();
      expect(customTheme.radius.lg).toBeDefined();
      expect(customTheme.radius.xl).toBeDefined();
    });

    it('should have font family configured', () => {
      expect(customTheme.fontFamily).toBeDefined();
      expect(customTheme.fontFamilyMonospace).toBeDefined();
      expect(customTheme.headings?.fontFamily).toBeDefined();
    });

    it('should have dark mode colors configured', () => {
      expect(customTheme.colors?.dark).toBeDefined();
      expect(customTheme.colors?.dark).toHaveLength(10);
    });

    it('should have CSS variables configured', () => {
      expect(customTheme.other).toBeDefined();
      expect(customTheme.other.customColors.background).toBe('#faf9f5');
      expect(customTheme.other.customColors.foreground).toBe('#3d3929');
      expect(customTheme.other.customColors.sidebar).toBe('#f5f4ee');
      expect(customTheme.other.customColors.sidebarBorder).toBe('#ebebeb');
      expect(customTheme.other.customColors.sidebarPrimary).toBe('#c96442');
    });
  });

  describe('generateColorShades', () => {
    it('should generate 10 shades for a hex color', () => {
      const shades = generateColorShades('#c96442');
      expect(shades).toHaveLength(10);
    });

    it('should use the main color at index 6', () => {
      const shades = generateColorShades('#c96442');
      expect(shades[6]).toBe('#c96442');
    });

    it('should generate lighter shades for indices 0-5', () => {
      const shades = generateColorShades('#c96442');
      for (let i = 0; i < 6; i++) {
        expect(shades[i]).toBeDefined();
        expect(shades[i]).not.toBe('#c96442');
      }
    });

    it('should generate darker shades for indices 7-9', () => {
      const shades = generateColorShades('#c96442');
      for (let i = 7; i < 10; i++) {
        expect(shades[i]).toBeDefined();
        expect(shades[i]).not.toBe('#c96442');
      }
    });
  });

  describe('isValidHexColor', () => {
    it('should validate correct hex colors', () => {
      expect(isValidHexColor('#c96442')).toBe(true);
      expect(isValidHexColor('#e9e6dc')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#ffffff')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('c96442')).toBe(false);
      expect(isValidHexColor('#c9644')).toBe(false);
      expect(isValidHexColor('#c96442g')).toBe(false);
      expect(isValidHexColor('')).toBe(false);
      expect(isValidHexColor('not-a-color')).toBe(false);
    });
  });
});
