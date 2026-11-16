import { catalog, findItem, MAX_TOPPINGS, type Catalog, type CatalogItem } from '../data/catalog';
import { calculateTotal, canAddTopping, formatPrice, type Order, type OrderStore } from '../state/order';

/** Writes a short sentence into the aria-live region every time the order changes. */
export function connectAnnouncer(region: HTMLElement, store: OrderStore): void {
  let previous = store.get();
  store.subscribe((next) => {
    region.textContent = describeChange(previous, next);
    previous = next;
  });
}

/**
 * Builds the sentence a screen reader hears, e.g.
 * "Ingrediente adicionado: Cogumelos. Total: 9,00 €"
 * Kept free of the DOM so it can be tested on its own.
 */
export function describeChange(previous: Order, next: Order, menu: Catalog = catalog): string {
  const parts: string[] = [];

  if (next.doughId !== previous.doughId) {
    parts.push(`Massa: ${nameOf(menu.doughs, next.doughId)}.`);
  }
  if (next.sauceId !== previous.sauceId) {
    parts.push(`Molho: ${nameOf(menu.sauces, next.sauceId)}.`);
  }
  if (next.cheeseId !== previous.cheeseId) {
    parts.push(`Queijo: ${nameOf(menu.cheeses, next.cheeseId)}.`);
  }

  // "Ingrediente adicionado: X" agrees with "ingrediente", so it reads well for any topping name.
  for (const id of next.toppingIds.filter((t) => !previous.toppingIds.includes(t))) {
    parts.push(`Ingrediente adicionado: ${nameOf(menu.toppings, id)}.`);
  }
  for (const id of previous.toppingIds.filter((t) => !next.toppingIds.includes(t))) {
    parts.push(`Ingrediente retirado: ${nameOf(menu.toppings, id)}.`);
  }

  if (canAddTopping(previous) && !canAddTopping(next)) {
    parts.push(`Chegou ao máximo de ${MAX_TOPPINGS} ingredientes.`);
  }

  parts.push(`Total: ${formatPrice(calculateTotal(next, menu))}`);
  return parts.join(' ');
}

function nameOf(items: readonly CatalogItem[], id: string): string {
  return findItem(items, id)?.name ?? id;
}
