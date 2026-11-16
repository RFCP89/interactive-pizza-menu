export interface CatalogItem {
  readonly id: string;
  /** Name shown to the customer (pt-PT). */
  readonly name: string;
  /** Price in cents, to avoid rounding errors (750 = 7,50 €). */
  readonly priceCents: number;
  /** Colour used by the simple 3D shapes until real models exist. */
  readonly color: string;
  /** Picture shown on the counter, relative to public/ (no leading slash). SVG placeholder for now; can be a PNG. */
  readonly image: string;
  /** Path to a .glb file in public/models, once there is one. */
  readonly model?: string;
}

export interface Catalog {
  readonly doughs: readonly CatalogItem[];
  readonly sauces: readonly CatalogItem[];
  readonly cheeses: readonly CatalogItem[];
  readonly toppings: readonly CatalogItem[];
}

export const MAX_TOPPINGS = 6;

// The first item in each list is the default choice for a new pizza.
export const catalog: Catalog = {
  doughs: [
    { id: 'traditional', name: 'Tradicional', priceCents: 700, color: '#e8c48a', image: 'images/ingredients/traditional.svg' },
    { id: 'thin', name: 'Fina e estaladiça', priceCents: 700, color: '#f0d39c', image: 'images/ingredients/thin.svg' },
    { id: 'wholemeal', name: 'Integral', priceCents: 750, color: '#b98a55', image: 'images/ingredients/wholemeal.svg' },
  ],
  sauces: [
    { id: 'tomato', name: 'Tomate', priceCents: 0, color: '#c0392b', image: 'images/ingredients/tomato.svg' },
    { id: 'cream', name: 'Natas', priceCents: 50, color: '#f5efe0', image: 'images/ingredients/cream.svg' },
    { id: 'bbq', name: 'Barbecue', priceCents: 50, color: '#6e2c1a', image: 'images/ingredients/bbq.svg' },
  ],
  cheeses: [
    { id: 'mozzarella', name: 'Mozzarella', priceCents: 0, color: '#fff4d6', image: 'images/ingredients/mozzarella.svg' },
    { id: 'four-cheese', name: 'Quatro queijos', priceCents: 100, color: '#f7dc8f', image: 'images/ingredients/four-cheese.svg' },
    { id: 'vegan', name: 'Queijo vegan', priceCents: 120, color: '#f3e7b9', image: 'images/ingredients/vegan.svg' },
  ],
  toppings: [
    { id: 'pepperoni', name: 'Pepperoni', priceCents: 150, color: '#a93226', image: 'images/ingredients/pepperoni.svg' },
    { id: 'ham', name: 'Fiambre', priceCents: 150, color: '#f1a7a0', image: 'images/ingredients/ham.svg' },
    { id: 'mushrooms', name: 'Cogumelos', priceCents: 100, color: '#d9c7a7', image: 'images/ingredients/mushrooms.svg' },
    { id: 'olives', name: 'Azeitonas pretas', priceCents: 80, color: '#2b2b2b', image: 'images/ingredients/olives.svg' },
    { id: 'peppers', name: 'Pimentos', priceCents: 90, color: '#27ae60', image: 'images/ingredients/peppers.svg' },
    { id: 'red-onion', name: 'Cebola roxa', priceCents: 70, color: '#8e44ad', image: 'images/ingredients/red-onion.svg' },
    { id: 'pineapple', name: 'Ananás', priceCents: 100, color: '#f4d03f', image: 'images/ingredients/pineapple.svg' },
    { id: 'rocket', name: 'Rúcula', priceCents: 100, color: '#3c8d2f', image: 'images/ingredients/rocket.svg' },
  ],
};

export function findItem(items: readonly CatalogItem[], id: string): CatalogItem | undefined {
  return items.find((item) => item.id === id);
}
