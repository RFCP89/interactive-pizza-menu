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

type SingleChoiceKey = 'doughId' | 'sauceId' | 'cheeseId';

interface SingleChoiceGroup {
  readonly key: SingleChoiceKey;
  readonly legend: string;
  readonly items: readonly CatalogItem[];
  readonly select: (order: Order, id: string) => Order;
  /** Doughs show their full price; sauces and cheeses show what they add on top. */
  readonly showsExtraPrice: boolean;
}

const singleChoiceGroups: readonly SingleChoiceGroup[] = [
  { key: 'doughId', legend: 'Massa', items: catalog.doughs, select: selectDough, showsExtraPrice: false },
  { key: 'sauceId', legend: 'Molho', items: catalog.sauces, select: selectSauce, showsExtraPrice: true },
  { key: 'cheeseId', legend: 'Queijo', items: catalog.cheeses, select: selectCheese, showsExtraPrice: true },
];

const TOPPINGS_NAME = 'toppings';

export function renderPanel(container: HTMLElement, store: OrderStore): void {
  // The catalog is our own data, so building HTML from it as a string is safe here.
  container.innerHTML = singleChoiceGroups.map(singleChoiceHtml).join('') + toppingsHtml();

  container.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement) {
      applyChange(event.target, store);
      // Re-sync even if the store ignored the change, so a checkbox never shows a wrong state.
      syncInputs(container, store.get());
    }
  });

  store.subscribe((order) => syncInputs(container, order));
  syncInputs(container, store.get());
}

function applyChange(input: HTMLInputElement, store: OrderStore): void {
  const id = input.value;

  if (input.name === TOPPINGS_NAME) {
    store.update((order) => (input.checked ? addTopping(order, id) : removeTopping(order, id)));
    return;
  }

  const group = singleChoiceGroups.find((g) => g.key === input.name);
  if (group) {
    store.update((order) => group.select(order, id));
  }
}

function syncInputs(container: HTMLElement, order: Order): void {
  for (const group of singleChoiceGroups) {
    container.querySelectorAll<HTMLInputElement>(`input[name="${group.key}"]`).forEach((radio) => {
      radio.checked = radio.value === order[group.key];
    });
  }

  const limitReached = !canAddTopping(order);
  container.querySelectorAll<HTMLInputElement>(`input[name="${TOPPINGS_NAME}"]`).forEach((checkbox) => {
    checkbox.checked = order.toppingIds.includes(checkbox.value);
    checkbox.disabled = limitReached && !checkbox.checked;
  });

  const hint = container.querySelector('#toppings-hint');
  if (hint) {
    hint.textContent = toppingsHint(order.toppingIds.length);
  }
}

function toppingsHint(count: number): string {
  if (count >= MAX_TOPPINGS) {
    return `Escolheu ${count} de ${MAX_TOPPINGS}, o máximo. Retire um para escolher outro.`;
  }
  return `Escolha até ${MAX_TOPPINGS}. Escolheu ${count} de ${MAX_TOPPINGS}.`;
}

function singleChoiceHtml(group: SingleChoiceGroup): string {
  const options = group.items
    .map((item) => optionHtml('radio', group.key, item, group.showsExtraPrice ? extraPriceLabel(item) : formatPrice(item.priceCents)))
    .join('');
  return `<fieldset class="choice-group"><legend>${group.legend}</legend>${options}</fieldset>`;
}

function toppingsHtml(): string {
  const options = catalog.toppings
    .map((item) => optionHtml('checkbox', TOPPINGS_NAME, item, extraPriceLabel(item)))
    .join('');
  return `<fieldset class="choice-group choice-group--toppings" aria-describedby="toppings-hint">
    <legend>Ingredientes</legend>
    <p id="toppings-hint" class="hint"></p>
    ${options}
  </fieldset>`;
}

function optionHtml(type: 'radio' | 'checkbox', name: string, item: CatalogItem, price: string): string {
  return `<label class="option">
    <input type="${type}" name="${name}" value="${item.id}" />
    <span class="option-swatch" style="background:${item.color}" aria-hidden="true"></span>
    <span class="option-name">${item.name}</span>
    <span class="option-price">${price}</span>
  </label>`;
}

function extraPriceLabel(item: CatalogItem): string {
  return item.priceCents === 0 ? 'incluído' : `+${formatPrice(item.priceCents)}`;
}
