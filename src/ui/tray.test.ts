import { describe, expect, it } from 'vitest';
import { createOrder } from '../state/order';
import { applyItem, dropItem } from './tray';

describe('applyItem (tap / click / keyboard)', () => {
  it('switches a topping on and off', () => {
    const on = applyItem(createOrder(), 'topping', 'olives');
    expect(on.toppingIds).toEqual(['olives']);
    expect(applyItem(on, 'topping', 'olives').toppingIds).toEqual([]);
  });

  it('replaces the sauce', () => {
    expect(applyItem(createOrder(), 'sauce', 'bbq').sauceId).toBe('bbq');
  });
});

describe('dropItem (drag onto the pizza)', () => {
  it('adds a topping', () => {
    expect(dropItem(createOrder(), 'topping', 'olives').toppingIds).toEqual(['olives']);
  });

  it('never takes a topping off when it is dropped again', () => {
    const once = dropItem(createOrder(), 'topping', 'olives');
    expect(dropItem(once, 'topping', 'olives')).toBe(once);
  });

  it('replaces the dough', () => {
    expect(dropItem(createOrder(), 'dough', 'thin').doughId).toBe('thin');
  });
});
