import './styles/main.css';
import { assetUrl } from './data/asset-url';
import { createPizza } from './scene/pizza';
import { createStage } from './scene/scene';
import { createToppings } from './scene/toppings';
import { createOrderStore, type Order, type OrderStore } from './state/order';
import { connectAnnouncer } from './ui/announcer';
import { renderSummary, renderTotal } from './ui/summary';
import { enableDragToPizza } from './ui/drag';
import { renderShelf } from './ui/tray';

const store = createOrderStore();

renderShelf(requireElement('shelf-sauce'), 'sauce', store);
renderShelf(requireElement('shelf-topping'), 'topping', store);
renderShelf(requireElement('shelf-dough'), 'dough', store);
renderShelf(requireElement('shelf-cheese'), 'cheese', store);
renderSummary(requireElement('summary'), store);
renderTotal(requireElement('bar-total'), store);
enableDragToPizza(requireElement('counter'), requireElement('stage'), store);
connectAnnouncer(requireElement('announcer'), store);
startScene(requireElement('stage'), store);

function startScene(container: HTMLElement, orderStore: OrderStore): void {
  const stage = createStage(container);
  if (!stage) {
    showStaticPizza(container);
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const pizza = createPizza();
  stage.scene.add(pizza.group);
  // Toppings live inside the pizza group, so they turn together with it.
  const toppings = createToppings(pizza.group, () => reducedMotion.matches);

  // The scene only reads the order and follows it.
  const follow = (order: Order) => {
    pizza.update(order);
    toppings.update(order);
  };
  follow(orderStore.get());
  orderStore.subscribe(follow);

  stage.onFrame((deltaSeconds) => {
    toppings.tick(deltaSeconds);
    if (!reducedMotion.matches) {
      pizza.group.rotation.y += deltaSeconds * 0.15;
    }
  });
}

function showStaticPizza(container: HTMLElement): void {
  const image = document.createElement('img');
  image.src = assetUrl('pizza-static.svg');
  // Decorative: the text summary already describes the pizza.
  image.alt = '';
  image.className = 'stage-fallback';
  container.append(image);
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id} in index.html`);
  }
  return element;
}
