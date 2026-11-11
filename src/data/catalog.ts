export interface CatalogItem {
  readonly id: string;
  /** Name shown to the customer (pt-PT). */
  readonly name: string;
  /** Price in cents, to avoid rounding errors (750 = 7,50 €). */
  readonly priceCents: number;
  /** Colour used by the simple 3D shapes until real models exist. */
  readonly color: string;
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
    { id: 'traditional', name: 'Tradicional', priceCents: 700, color: '#e8c48a' },
    { id: 'thin', name: 'Fina e estaladiça', priceCents: 700, color: '#f0d39c' },
    { id: 'wholemeal', name: 'Integral', priceCents: 750, color: '#b98a55' },
  ],
  sauces: [
    { id: 'tomato', name: 'Tomate', priceCents: 0, color: '#c0392b' },
    { id: 'cream', name: 'Natas', priceCents: 50, color: '#f5efe0' },
    { id: 'bbq', name: 'Barbecue', priceCents: 50, color: '#6e2c1a' },
  ],
  cheeses: [
    { id: 'mozzarella', name: 'Mozzarella', priceCents: 0, color: '#fff4d6' },
    { id: 'four-cheese', name: 'Mistura de quatro queijos', priceCents: 100, color: '#f7dc8f' },
    { id: 'vegan', name: 'Queijo vegan', priceCents: 120, color: '#f3e7b9' },
  ],
  toppings: [
    { id: 'pepperoni', name: 'Pepperoni', priceCents: 150, color: '#a93226' },
    { id: 'ham', name: 'Fiambre', priceCents: 150, color: '#f1a7a0' },
    { id: 'mushrooms', name: 'Cogumelos', priceCents: 100, color: '#d9c7a7' },
    { id: 'olives', name: 'Azeitonas pretas', priceCents: 80, color: '#2b2b2b' },
    { id: 'peppers', name: 'Pimentos', priceCents: 90, color: '#27ae60' },
    { id: 'red-onion', name: 'Cebola roxa', priceCents: 70, color: '#8e44ad' },
    { id: 'pineapple', name: 'Ananás', priceCents: 100, color: '#f4d03f' },
    { id: 'rocket', name: 'Rúcula', priceCents: 100, color: '#3c8d2f' },
  ],
};

export function findItem(items: readonly CatalogItem[], id: string): CatalogItem | undefined {
  return items.find((item) => item.id === id);
}
