import type { Character } from './characters';
import { fanartOptions } from './fanart';

export type CharacterArtwork = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  credit?: string;
};

export const getCharacterArtwork = (character: Character): CharacterArtwork[] => {
  const portrait: CharacterArtwork[] = character.image
    ? [{ src: character.image, alt: character.name, width: 800, height: 800, caption: character.name, credit: character.credits }]
    : [];
  const references: CharacterArtwork[] = character.references
    .filter((reference) => reference.image)
    .map((reference) => ({
      src: reference.image,
      alt: reference.alt || character.name,
      width: reference.width ?? 800,
      height: reference.height ?? 800,
      caption: reference.caption,
      credit: reference.artist || character.credits,
    }));
  const fanart: CharacterArtwork[] = fanartOptions
    .filter((art) => art.cSlug === character.slug)
    .sort((first, second) => first.number - second.number)
    .map((art) => ({
      src: art.src,
      alt: `Fanart piece ${art.number} by ${art.artist}`,
      width: art.width,
      height: art.height,
      caption: art.caption ?? '',
      credit: art.artist,
    }));

  return [...new Map([...portrait, ...references, ...fanart].map((art) => [art.src, art])).values()];
};