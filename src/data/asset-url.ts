/**
 * Turns a path inside public/ (e.g. "images/ingredients/olives.svg") into a working URL.
 * Needed because on GitHub Pages the site lives in a sub-folder (/interactive-pizza-menu/),
 * so a path starting with "/" would point to the wrong place.
 */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path;
}
