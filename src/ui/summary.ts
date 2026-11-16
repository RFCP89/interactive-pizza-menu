import { catalog, findItem, type CatalogItem } from '../data/catalog';
import { calculateTotal, formatPrice, removeTopping, type Order, type OrderStore } from '../state/order';

/** The cart: what is on the pizza, a ✕ to take each topping off, and the total. */
export function renderSummary(container: HTMLElement, store: OrderStore): void {
  const draw = (order: Order) => {
    container.innerHTML = summaryHtml(order);
  };

  container.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-remove]') : null;
    const id = button?.dataset.remove;
    if (id) {
      store.update((order) => removeTopping(order, id));
      // The list was redrawn and the button is gone, so put focus somewhere sensible.
      container.querySelector<HTMLElement>('#summary-title')?.focus();
    }
  });

  store.subscribe(draw);
  draw(store.get());
}

/** Keeps a short "Total: 9,00 €" text up to date, e.g. in the bottom bar. */
export function renderTotal(element: HTMLElement, store: OrderStore): void {
  const draw = (order: Order) => {
    element.textContent = formatPrice(calculateTotal(order));
  };
  store.subscribe(draw);
  draw(store.get());
}

function summaryHtml(order: Order): string {
  const toppings = order.toppingIds
    .map((id) => {
      const name = nameOf(catalog.toppings, id);
      return `<li class="cart-topping">
        <span>${name}</span>
        <button type="button" class="cart-remove" data-remove="${id}" aria-label="Retirar ${name}">✕</button>
      </li>`;
    })
    .join('');

  return `<h2 id="summary-title" class="cart-title" tabindex="-1">A sua pizza</h2>
    <dl class="cart-list">
      <dt>Massa</dt><dd>${nameOf(catalog.doughs, order.doughId)}</dd>
      <dt>Molho</dt><dd>${nameOf(catalog.sauces, order.sauceId)}</dd>
      <dt>Queijo</dt><dd>${nameOf(catalog.cheeses, order.cheeseId)}</dd>
      <dt>Ingredientes</dt>
      <dd>${toppings ? `<ul class="cart-toppings">${toppings}</ul>` : 'Nenhum'}</dd>
    </dl>
    <p class="cart-total">Total: <strong>${formatPrice(calculateTotal(order))}</strong></p>`;
}

function nameOf(items: readonly CatalogItem[], id: string): string {
  return findItem(items, id)?.name ?? id;
}
