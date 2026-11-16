import './styles/main.css';
import { createPizza } from './scene/pizza';
import { createStage } from './scene/scene';
import { createOrderStore, type OrderStore } from './state/order';
import { connectAnnouncer } from './ui/announcer';
import { renderSummary, renderTotal } from './ui/summary';
import { renderShelf } from './ui/tray';

const store = createOrderStore();

renderShelf(requireElement('shelf-sauce'), 'sauce', store);
renderShelf(requireElement('shelf-topping'), 'topping', store);
renderShelf(requireElement('shelf-dough'), 'dough', store);
renderShelf(requireElement('shelf-cheese'), 'cheese', store);
renderSummary(requireElement('summary'), store);
renderTotal(requireElement('bar-total'), store);
connectAnnouncer(requireElement('announcer'), store);
startScene(requireElement('stage'), store);

function startScene(container: HTMLElement, orderStore: OrderStore): void {
  const stage = createStage(container);
  if (!stage) {
    showStaticPizza(container);
    return;
  }

  const pizza = createPizza();
  stage.scene.add(pizza.group);
  // The scene only reads the order and follows it.
  pizza.update(orderStore.get());
  orderStore.subscribe(pizza.update);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  stage.onFrame((deltaSeconds) => {
    if (!reducedMotion.matches) {
      pizza.group.rotation.y += deltaSeconds * 0.15;
    }
  });
}

function showStaticPizza(container: HTMLElement): void {
  const image = document.createElement('img');
  image.src = '/pizza-static.svg';
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
