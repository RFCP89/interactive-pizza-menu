import { describe, expect, it } from 'vitest';
import { catalog, MAX_TOPPINGS } from '../data/catalog';
import { addTopping, calculateTotal, createOrder, formatPrice, removeTopping, selectDough, type Order } from '../state/order';
import { describeChange } from './announcer';

const totalOf = (order: Order) => `Total: ${formatPrice(calculateTotal(order))}`;

describe('describeChange', () => {
  it('announces an added topping and the new total', () => {
    const before = createOrder();
    const after = addTopping(before, 'mushrooms');
    expect(describeChange(before, after)).toBe(`Ingrediente adicionado: Cogumelos. ${totalOf(after)}`);
  });

  it('announces a removed topping', () => {
    const before = addTopping(createOrder(), 'olives');
    const after = removeTopping(before, 'olives');
    expect(describeChange(before, after)).toBe(`Ingrediente retirado: Azeitonas pretas. ${totalOf(after)}`);
  });

  it('announces a new dough', () => {
    const before = createOrder();
    const after = selectDough(before, 'wholemeal');
    expect(describeChange(before, after)).toBe(`Massa: Integral. ${totalOf(after)}`);
  });

  it('says when the topping limit is reached', () => {
    let before = createOrder();
    for (const topping of catalog.toppings.slice(0, MAX_TOPPINGS - 1)) {
      before = addTopping(before, topping.id);
    }
    const last = catalog.toppings[MAX_TOPPINGS - 1];
    const after = addTopping(before, last?.id ?? '');

    expect(describeChange(before, after)).toContain(`Chegou ao máximo de ${MAX_TOPPINGS} ingredientes.`);
  });
});
