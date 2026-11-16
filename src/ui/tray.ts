import { catalog, MAX_TOPPINGS, type CatalogItem } from '../data/catalog';
import {
  addTopping,
  canAddTopping,
  formatPrice,
  removeTopping,
  selectCheese,
  selectDough,
  selectSauce,
  type Order,
  type OrderStore,
} from '../state/order';

export type ShelfKind = 'dough' | 'sauce' | 'cheese' | 'topping';

interface Shelf {
  readonly kind: ShelfKind;
  readonly title: string;
  readonly items: readonly CatalogItem[];
}

export const shelves: Record<ShelfKind, Shelf> = {
  dough: { kind: 'dough', title: 'Massa', items: catalog.doughs },
  sauce: { kind: 'sauce', title: 'Molho', items: catalog.sauces },
  cheese: { kind: 'cheese', title: 'Queijo', items: catalog.cheeses },
  topping: { kind: 'topping', title: 'Ingredientes', items: catalog.toppings },
};

/**
 * What happens when a tile is "used" — by a tap, a click, Enter/Space or (later) a drop on the pizza.
 * Toppings switch on and off; dough, sauce and cheese replace the current one.
 */
export function applyItem(order: Order, kind: ShelfKind, id: string): Order {
  switch (kind) {
    case 'dough':
      return selectDough(order, id);
    case 'sauce':
      return selectSauce(order, id);
    case 'cheese':
      return selectCheese(order, id);
    case 'topping':
      return order.toppingIds.includes(id) ? removeTopping(order, id) : addTopping(order, id);
  }
}

/** Fills `container` with one shelf of picture tiles. Each tile is a real <button>. */
export function renderShelf(container: HTMLElement, kind: ShelfKind, store: OrderStore): void {
  const shelf = shelves[kind];
  const titleId = `shelf-${kind}-title`;
  const hint = kind === 'topping' ? `<p id="topping-hint" class="shelf-hint"></p>` : '';

  // The catalog is our own data, so building HTML from it as a string is safe here.
  container.innerHTML = `
    <h2 id="${titleId}" class="shelf-title">${shelf.title}</h2>
    ${hint}
    <ul class="tiles tiles--${kind}" aria-labelledby="${titleId}">
      ${shelf.items.map((item) => tileHtml(kind, item)).join('')}
    </ul>`;

  container.addEventListener('click', (event) => {
    const tile = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button.tile') : null;
    if (tile?.dataset.id) {
      const id = tile.dataset.id;
      store.update((order) => applyItem(order, kind, id));
    }
  });

  const sync = (order: Order) => syncTiles(container, kind, order);
  store.subscribe(sync);
  sync(store.get());
}

function syncTiles(container: HTMLElement, kind: ShelfKind, order: Order): void {
  const limitReached = !canAddTopping(order);

  container.querySelectorAll<HTMLButtonElement>('button.tile').forEach((tile) => {
    const id = tile.dataset.id ?? '';
    const chosen = isChosen(order, kind, id);
    tile.setAttribute('aria-pressed', String(chosen));
    tile.disabled = kind === 'topping' && limitReached && !chosen;
  });

  const hint = container.querySelector('#topping-hint');
  if (hint) {
    const count = order.toppingIds.length;
    hint.textContent =
      count >= MAX_TOPPINGS ? `${count} de ${MAX_TOPPINGS}: retire um para trocar` : `${count} de ${MAX_TOPPINGS} escolhidos`;
  }
}

function isChosen(order: Order, kind: ShelfKind, id: string): boolean {
  switch (kind) {
    case 'dough':
      return order.doughId === id;
    case 'sauce':
      return order.sauceId === id;
    case 'cheese':
      return order.cheeseId === id;
    case 'topping':
      return order.toppingIds.includes(id);
  }
}

function tileHtml(kind: ShelfKind, item: CatalogItem): string {
  return `<li>
    <button type="button" class="tile" data-kind="${kind}" data-id="${item.id}" aria-pressed="false">
      <img class="tile-image" src="${item.image}" alt="" draggable="false" />
      <span class="tile-label">
        <span class="tile-name">${item.name}</span>
        <span class="tile-price">${priceLabel(kind, item)}</span>
      </span>
    </button>
  </li>`;
}

function priceLabel(kind: ShelfKind, item: CatalogItem): string {
  if (kind === 'dough') {
    return formatPrice(item.priceCents);
  }
  return item.priceCents === 0 ? 'incluído' : `+${formatPrice(item.priceCents)}`;
}
