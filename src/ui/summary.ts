import { catalog, findItem, type CatalogItem } from '../data/catalog';
import { calculateTotal, formatPrice, type Order, type OrderStore } from '../state/order';

export function renderSummary(container: HTMLElement, store: OrderStore): void {
  const draw = (order: Order) => {
    container.innerHTML = summaryHtml(order);
  };
  store.subscribe(draw);
  draw(store.get());
}

function summaryHtml(order: Order): string {
  const toppings = order.toppingIds.map((id) => nameOf(catalog.toppings, id));

  return `<h2 id="summary-title">A sua pizza</h2>
    <dl class="summary-list">
      <dt>Massa</dt><dd>${nameOf(catalog.doughs, order.doughId)}</dd>
      <dt>Molho</dt><dd>${nameOf(catalog.sauces, order.sauceId)}</dd>
      <dt>Queijo</dt><dd>${nameOf(catalog.cheeses, order.cheeseId)}</dd>
      <dt>Ingredientes</dt><dd>${toppings.length > 0 ? toppings.join(', ') : 'Nenhum'}</dd>
    </dl>
    <p class="summary-total">Total: <strong>${formatPrice(calculateTotal(order))}</strong></p>`;
}

function nameOf(items: readonly CatalogItem[], id: string): string {
  return findItem(items, id)?.name ?? id;
}
