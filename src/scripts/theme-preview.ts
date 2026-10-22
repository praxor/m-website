import type { ThemeDefinition } from '../data/themes';
import { getThemeCatPresentation } from './theme-cats';

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

export const applyThemePreviewCat = (preview: HTMLElement, theme: ThemeDefinition) => {
  const cat = preview.querySelector<HTMLImageElement>('.sm-mini-cat');
  if (!cat) return;
  const presentation = getThemeCatPresentation(theme.id, import.meta.env.BASE_URL);
  cat.src = presentation.src;
  cat.style.filter = presentation.filter ?? '';
};

export const applyThemePreviewPalette = (preview: HTMLElement, theme: ThemeDefinition) => {
  const elements = [preview, ...Array.from(preview.querySelectorAll<HTMLElement>('*'))];
  elements.forEach((element) => {
    previewVariables.forEach(([property, token]) => {
      element.style.setProperty(property, theme.preview[token], 'important');
    });
  });
};
