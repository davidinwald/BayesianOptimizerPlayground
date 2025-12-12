/**
 * Theme system for light/dark/high-contrast modes
 */

export type Theme = 'light' | 'dark' | 'high-contrast';

export interface ThemeConfig {
  name: Theme;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#0066cc',
      secondary: '#666666',
      accent: '#ff6600',
      error: '#cc0000',
      warning: '#ff9900',
      success: '#00cc00',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#1a1a1a',
      foreground: '#ffffff',
      primary: '#4da6ff',
      secondary: '#999999',
      accent: '#ff9933',
      error: '#ff6666',
      warning: '#ffcc66',
      success: '#66ff66',
    },
  },
  'high-contrast': {
    name: 'high-contrast',
    colors: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#00ffff',
      secondary: '#ffffff',
      accent: '#ffff00',
      error: '#ff0000',
      warning: '#ffff00',
      success: '#00ff00',
    },
  },
};

