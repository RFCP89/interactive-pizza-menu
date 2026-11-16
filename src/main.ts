import './styles/main.css';
import { createOrderStore } from './state/order';
import { connectAnnouncer } from './ui/announcer';
import { renderPanel } from './ui/panel';
import { renderSummary } from './ui/summary';

const store = createOrderStore();

renderPanel(requireElement('choices'), store);
renderSummary(requireElement('summary'), store);
connectAnnouncer(requireElement('announcer'), store);

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id} in index.html`);
  }
  return element;
}
