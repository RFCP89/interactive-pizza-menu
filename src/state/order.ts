import { catalog, findItem, MAX_TOPPINGS, type Catalog, type CatalogItem } from '../data/catalog';

export interface Order {
  readonly doughId: string;
  readonly sauceId: string;
  readonly cheeseId: string;
  /** In the order they were added, so the scene can stack them the same way. */
  readonly toppingIds: readonly string[];
}

// Every function below returns a new Order instead of changing the old one.
// That makes "did anything change?" a simple `!==` check for the UI and scene.

export function createOrder(menu: Catalog = catalog): Order {
  return {
    doughId: firstId(menu.doughs),
    sauceId: firstId(menu.sauces),
    cheeseId: firstId(menu.cheeses),
    toppingIds: [],
  };
}

export function selectDough(order: Order, id: string, menu: Catalog = catalog): Order {
  return findItem(menu.doughs, id) ? { ...order, doughId: id } : order;
}

export function selectSauce(order: Order, id: string, menu: Catalog = catalog): Order {
  return findItem(menu.sauces, id) ? { ...order, sauceId: id } : order;
}

export function selectCheese(order: Order, id: string, menu: Catalog = catalog): Order {
  return findItem(menu.cheeses, id) ? { ...order, cheeseId: id } : order;
}

export function canAddTopping(order: Order): boolean {
  return order.toppingIds.length < MAX_TOPPINGS;
}

/** Returns the same order (unchanged) if the topping is unknown, already on the pizza, or the limit is reached. */
export function addTopping(order: Order, id: string, menu: Catalog = catalog): Order {
  if (!findItem(menu.toppings, id) || order.toppingIds.includes(id) || !canAddTopping(order)) {
    return order;
  }
  return { ...order, toppingIds: [...order.toppingIds, id] };
}

export function removeTopping(order: Order, id: string): Order {
  if (!order.toppingIds.includes(id)) {
    return order;
  }
  return { ...order, toppingIds: order.toppingIds.filter((toppingId) => toppingId !== id) };
}

export function calculateTotal(order: Order, menu: Catalog = catalog): number {
  const base =
    priceOf(menu.doughs, order.doughId) +
    priceOf(menu.sauces, order.sauceId) +
    priceOf(menu.cheeses, order.cheeseId);
  return order.toppingIds.reduce((total, id) => total + priceOf(menu.toppings, id), base);
}

const euroFormatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

export function formatPrice(cents: number): string {
  return euroFormatter.format(cents / 100);
}

export type OrderListener = (order: Order) => void;

export interface OrderStore {
  get(): Order;
  /** Applies a change, e.g. `store.update((o) => addTopping(o, 'olives'))`. Listeners only run if something changed. */
  update(change: (order: Order) => Order): void;
  /** Returns a function that stops listening. */
  subscribe(listener: OrderListener): () => void;
}

export function createOrderStore(initial: Order = createOrder()): OrderStore {
  let current = initial;
  const listeners = new Set<OrderListener>();

  return {
    get: () => current,
    update(change) {
      const next = change(current);
      if (next === current) {
        return;
      }
      current = next;
      listeners.forEach((listener) => listener(current));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function firstId(items: readonly CatalogItem[]): string {
  const first = items[0];
  if (!first) {
    throw new Error('Catalog list is empty');
  }
  return first.id;
}

function priceOf(items: readonly CatalogItem[], id: string): number {
  return findItem(items, id)?.priceCents ?? 0;
}
