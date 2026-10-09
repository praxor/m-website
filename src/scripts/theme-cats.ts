export type ThemeCatEffect = "solid-pink" | "solid-red";

export type ThemeCatPresentation = {
  src: string;
  effect?: ThemeCatEffect;
  filter?: string;
};

const solidPinkFilter =
  "brightness(0) saturate(100%) invert(84%) sepia(12%) saturate(1456%) hue-rotate(289deg) brightness(105%) contrast(98%)";
const solidRedFilter =
  "brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7500%) hue-rotate(358deg) brightness(102%) contrast(115%)";

export const THEME_CAT_MAPPING: Record<string, ThemeCatPresentation | null> = {
  praxorian: null,
  berhian: { src: "media/friends/berh.jpg" },
  "toohi-ian": { src: "media/friends/toohimillion.jpg" },
  macintoshing: { src: "media/friends/mac.png" },
  "praxor-pop": {
    src: "media/res/oraxor.png",
    effect: "solid-pink",
    filter: solidPinkFilter,
  },
  curse: {
    src: "media/res/oraxor.png",
    effect: "solid-red",
    filter: solidRedFilter,
  },
  amoled: null,
  cult: null,
  "true-fr": { src: "media/ocs/axis.png" },
  rainbow: null,
  matrix: null,
};

const basePath = (baseUrl: string) =>
  baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

export const getThemeCatPresentation = (
  themeId: string,
  baseUrl: string,
  defaultPath = "media/res/oraxor.png",
): ThemeCatPresentation => {
  const override = THEME_CAT_MAPPING[themeId];
  const path = override?.src ?? defaultPath;
  return {
    src: new URL(
      path.replace(/^\/+/, ""),
      new URL(basePath(baseUrl), window.location.origin),
    ).href,
    ...(override?.effect ? { effect: override.effect } : {}),
    ...(override?.filter ? { filter: override.filter } : {}),
  };
};

export const initializeThemeCats = (baseUrl: string) => {
  const applyToImage = (image: HTMLImageElement) => {
    const fallback = image.dataset.themeCatDefaultSrc || "media/res/oraxor.png";
    const theme = document.documentElement.dataset.siteTheme || "praxorian";
    const presentation = getThemeCatPresentation(theme, baseUrl, fallback);

    if (image.src !== presentation.src) {
      image.removeAttribute("srcset");
      image.src = presentation.src;
    }
    image.classList.toggle(
      "theme-cat-solid-pink",
      presentation.effect === "solid-pink",
    );
    image.classList.toggle(
      "theme-cat-solid-red",
      presentation.effect === "solid-red",
    );
    if (presentation.filter)
      image.style.setProperty("--theme-cat-filter", presentation.filter);
    else image.style.removeProperty("--theme-cat-filter");
  };

  const applyToCanvas = (canvas: HTMLCanvasElement) => {
    const fallback =
      canvas.dataset.themeCatDefaultSrc || "media/res/oraxor.png";
    const theme = document.documentElement.dataset.siteTheme || "praxorian";
    const presentation = getThemeCatPresentation(theme, baseUrl, fallback);
    canvas.dataset.themeCatSrc = presentation.src;
    if (presentation.filter)
      canvas.dataset.themeCatFilter = presentation.filter;
    else delete canvas.dataset.themeCatFilter;
  };

  const apply = () => {
    document
      .querySelectorAll<HTMLImageElement>("img[data-theme-cat]")
      .forEach(applyToImage);
    document
      .querySelectorAll<HTMLCanvasElement>("canvas[data-theme-cat]")
      .forEach(applyToCanvas);
    window.dispatchEvent(new Event("theme-cats:change"));
  };
  apply();
  window.addEventListener("site-state:change", apply);
  document.addEventListener("astro:page-load", apply);
};
