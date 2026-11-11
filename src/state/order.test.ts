import { describe, expect, it, vi } from 'vitest';
import { catalog, MAX_TOPPINGS, type Catalog } from '../data/catalog';
import {
  addTopping,
  calculateTotal,
  canAddTopping,
  createOrder,
  createOrderStore,
  formatPrice,
  removeTopping,
  selectCheese,
  selectDough,
  selectSauce,
} from './order';

const testMenu: Catalog = {
  doughs: [
    { id: 'd1', name: 'Massa 1', priceCents: 700, color: '#000' },
    { id: 'd2', name: 'Massa 2', priceCents: 750, color: '#000' },
  ],
  sauces: [
    { id: 's1', name: 'Molho 1', priceCents: 0, color: '#000' },
    { id: 's2', name: 'Molho 2', priceCents: 50, color: '#000' },
  ],
  cheeses: [
    { id: 'c1', name: 'Queijo 1', priceCents: 0, color: '#000' },
    { id: 'c2', name: 'Queijo 2', priceCents: 120, color: '#000' },
  ],
  toppings: [
    { id: 't1', name: 'Ingrediente 1', priceCents: 150, color: '#000' },
    { id: 't2', name: 'Ingrediente 2', priceCents: 80, color: '#000' },
  ],
};

/** Normalises the non-breaking space Intl puts before the € sign. */
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('createOrder', () => {
  it('starts with the first dough, sauce and cheese and no toppings', () => {
    expect(createOrder(testMenu)).toEqual({ doughId: 'd1', sauceId: 's1', cheeseId: 'c1', toppingIds: [] });
  });

  it('works with the real catalog', () => {
    const order = createOrder();
    expect(order.doughId).toBe(catalog.doughs[0]?.id);
    expect(order.toppingIds).toEqual([]);
  });
});

describe('choosing dough, sauce and cheese', () => {
  it('changes the choice when the id exists', () => {
    let order = createOrder(testMenu);
    order = selectDough(order, 'd2', testMenu);
    order = selectSauce(order, 's2', testMenu);
    order = selectCheese(order, 'c2', testMenu);
    expect(order).toMatchObject({ doughId: 'd2', sauceId: 's2', cheeseId: 'c2' });
  });

  it('ignores unknown ids and returns the same order', () => {
    const order = createOrder(testMenu);
    expect(selectDough(order, 'nope', testMenu)).toBe(order);
    expect(selectSauce(order, 'nope', testMenu)).toBe(order);
    expect(selectCheese(order, 'nope', testMenu)).toBe(order);
  });
});

describe('toppings', () => {
  it('adds toppings in the order they were chosen', () => {
    let order = createOrder(testMenu);
    order = addTopping(order, 't2', testMenu);
    order = addTopping(order, 't1', testMenu);
    expect(order.toppingIds).toEqual(['t2', 't1']);
  });

  it('does not change the original order', () => {
    const order = createOrder(testMenu);
    addTopping(order, 't1', testMenu);
    expect(order.toppingIds).toEqual([]);
  });

  it('ignores a topping that is already on the pizza', () => {
    const order = addTopping(createOrder(testMenu), 't1', testMenu);
    expect(addTopping(order, 't1', testMenu)).toBe(order);
  });

  it('ignores an unknown topping', () => {
    const order = createOrder(testMenu);
    expect(addTopping(order, 'nope', testMenu)).toBe(order);
  });

  it('removes a topping', () => {
    let order = createOrder(testMenu);
    order = addTopping(order, 't1', testMenu);
    order = addTopping(order, 't2', testMenu);
    expect(removeTopping(order, 't1').toppingIds).toEqual(['t2']);
  });

  it('returns the same order when removing a topping that is not there', () => {
    const order = createOrder(testMenu);
    expect(removeTopping(order, 't1')).toBe(order);
  });

  it(`stops at ${MAX_TOPPINGS} toppings`, () => {
    expect(catalog.toppings.length).toBeGreaterThan(MAX_TOPPINGS);

    let order = createOrder();
    for (const topping of catalog.toppings) {
      order = addTopping(order, topping.id);
    }

    expect(order.toppingIds).toHaveLength(MAX_TOPPINGS);
    expect(canAddTopping(order)).toBe(false);
  });

  it('allows adding again after removing one at the limit', () => {
    let order = createOrder();
    for (const topping of catalog.toppings) {
      order = addTopping(order, topping.id);
    }
    const [first] = order.toppingIds;
    order = removeTopping(order, first ?? '');
    expect(canAddTopping(order)).toBe(true);
  });
});

describe('calculateTotal', () => {
  it('is the price of the dough, sauce and cheese for a plain pizza', () => {
    expect(calculateTotal(createOrder(testMenu), testMenu)).toBe(700);
  });

  it('adds every chosen option and topping', () => {
    let order = createOrder(testMenu);
    order = selectDough(order, 'd2', testMenu); // 750
    order = selectSauce(order, 's2', testMenu); // 50
    order = selectCheese(order, 'c2', testMenu); // 120
    order = addTopping(order, 't1', testMenu); // 150
    order = addTopping(order, 't2', testMenu); // 80
    expect(calculateTotal(order, testMenu)).toBe(1150);
  });

  it('goes back down when a topping is removed', () => {
    let order = addTopping(createOrder(testMenu), 't1', testMenu);
    order = removeTopping(order, 't1');
    expect(calculateTotal(order, testMenu)).toBe(700);
  });
});

describe('formatPrice', () => {
  it('formats cents as euros in Portuguese style', () => {
    expect(plain(formatPrice(1150))).toBe('11,50 €');
    expect(plain(formatPrice(700))).toBe('7,00 €');
  });
});

describe('createOrderStore', () => {
  it('tells listeners about changes', () => {
    const store = createOrderStore(createOrder(testMenu));
    const listener = vi.fn();
    store.subscribe(listener);

    store.update((order) => addTopping(order, 't1', testMenu));

    expect(listener).toHaveBeenCalledOnce();
    expect(store.get().toppingIds).toEqual(['t1']);
  });

  it('does not call listeners when nothing changed', () => {
    const store = createOrderStore(createOrder(testMenu));
    const listener = vi.fn();
    store.subscribe(listener);

    store.update((order) => addTopping(order, 'nope', testMenu));

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops calling a listener after unsubscribe', () => {
    const store = createOrderStore(createOrder(testMenu));
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.update((order) => addTopping(order, 't1', testMenu));

    expect(listener).not.toHaveBeenCalled();
  });
});
