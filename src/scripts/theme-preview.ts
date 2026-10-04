import type { ThemeDefinition } from '../data/themes';

const previewVariables = [
  ['--bg', 'bg'],
  ['--card', 'card'],
  ['--text', 'text'],
  ['--muted', 'muted'],
  ['--accent', 'accent'],
  ['--accent-contrast', 'accentContrast'],
  ['--accent-10', 'accent10'],
  ['--muted-border', 'mutedBorder'],
] as const;

export const applyThemePreviewPalette = (preview: HTMLElement, theme: ThemeDefinition) => {
  const elements = [preview, ...Array.from(preview.querySelectorAll<HTMLElement>('*'))];
  elements.forEach((element) => {
    previewVariables.forEach(([property, token]) => {
      element.style.setProperty(property, theme.preview[token], 'important');
    });
  });
};
