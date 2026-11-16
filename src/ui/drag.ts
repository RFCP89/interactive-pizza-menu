import type { OrderStore } from '../state/order';
import { dropItem, isShelfKind } from './tray';

/** How far (in pixels) a mouse must move before a press becomes a drag. */
const DRAG_THRESHOLD = 6;
/** On touch screens you press and hold this long before dragging, so normal swipes still scroll. */
const LONG_PRESS_MS = 250;
const SETTLE_MS = 220;

interface DragSession {
  readonly tile: HTMLButtonElement;
  readonly pointerId: number;
  readonly isTouch: boolean;
  readonly startX: number;
  readonly startY: number;
  ghost: HTMLImageElement | null;
  longPressTimer: number | undefined;
}

/**
 * Lets people drag ingredient tiles onto the pizza. This is an extra on top of the buttons:
 * tapping, clicking and the keyboard still work exactly the same without it.
 */
export function enableDragToPizza(root: HTMLElement, dropZone: HTMLElement, store: OrderStore): void {
  let session: DragSession | null = null;
  let swallowNextClick = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const isOverDropZone = (x: number, y: number) => {
    const box = dropZone.getBoundingClientRect();
    return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  };

  const startDrag = (current: DragSession, x: number, y: number) => {
    const image = current.tile.querySelector('img');
    if (!image) return;
    const ghost = image.cloneNode() as HTMLImageElement;
    ghost.className = 'drag-ghost';
    document.body.append(ghost);
    current.ghost = ghost;
    document.body.classList.add('is-dragging');
    moveGhost(ghost, x, y);
  };

  const finish = (x: number, y: number) => {
    const current = session;
    session = null;
    if (!current) return;
    window.clearTimeout(current.longPressTimer);
    dropZone.classList.remove('is-drop-target');
    document.body.classList.remove('is-dragging');

    const ghost = current.ghost;
    if (!ghost) return; // it was a normal tap; the button's click handles it

    swallowNextClick = true;
    const { id, kind } = current.tile.dataset;
    const dropped = isOverDropZone(x, y) && id !== undefined && isShelfKind(kind);
    if (dropped) {
      store.update((order) => dropItem(order, kind, id));
    }
    settleGhost(ghost, dropped ? centreOf(dropZone) : centreOf(current.tile), dropped, reducedMotion.matches);
  };

  root.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    // If an earlier drag never got its "let go" event, cancel it instead of getting stuck.
    if (session) finish(Number.NaN, Number.NaN);
    const tile = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button.tile') : null;
    if (!tile || tile.disabled) return;

    const isTouch = event.pointerType === 'touch';
    const current: DragSession = {
      tile,
      pointerId: event.pointerId,
      isTouch,
      startX: event.clientX,
      startY: event.clientY,
      ghost: null,
      longPressTimer: undefined,
    };
    if (isTouch) {
      current.longPressTimer = window.setTimeout(() => startDrag(current, current.startX, current.startY), LONG_PRESS_MS);
    }
    session = current;
  });

  window.addEventListener('pointermove', (event) => {
    const current = session;
    if (!current || event.pointerId !== current.pointerId) return;

    if (!current.ghost) {
      const moved = Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > DRAG_THRESHOLD;
      if (!moved) return;
      if (current.isTouch) {
        // The finger moved before the long press: this is a scroll, not a drag.
        window.clearTimeout(current.longPressTimer);
        session = null;
        return;
      }
      startDrag(current, event.clientX, event.clientY);
    }

    if (current.ghost) {
      moveGhost(current.ghost, event.clientX, event.clientY);
      dropZone.classList.toggle('is-drop-target', isOverDropZone(event.clientX, event.clientY));
    }
  });

  window.addEventListener('pointerup', (event) => {
    if (session && event.pointerId === session.pointerId) finish(event.clientX, event.clientY);
  });

  window.addEventListener('pointercancel', (event) => {
    if (session && event.pointerId === session.pointerId) finish(Number.NaN, Number.NaN);
  });

  // Switching to another window mid-drag: put the picture back.
  window.addEventListener('blur', () => finish(Number.NaN, Number.NaN));

  // While dragging with a finger, stop the page from scrolling under it.
  root.addEventListener(
    'touchmove',
    (event) => {
      if (session?.ghost) event.preventDefault();
    },
    { passive: false },
  );

  // A drag ends with a "click" on the tile; ignore it so the drop isn't undone by a toggle.
  root.addEventListener(
    'click',
    (event) => {
      if (swallowNextClick) {
        swallowNextClick = false;
        event.stopPropagation();
        event.preventDefault();
      }
    },
    true,
  );
  // If no click comes after the drag (e.g. released far away), forget about it.
  window.addEventListener('pointerdown', () => {
    swallowNextClick = false;
  }, true);
}

function moveGhost(ghost: HTMLElement, x: number, y: number): void {
  ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(-6deg)`;
}

/** Shrinks the picture into the pizza after a drop, or floats it back to its tile. */
function settleGhost(ghost: HTMLElement, target: { x: number; y: number }, dropped: boolean, instant: boolean): void {
  if (instant) {
    ghost.remove();
    return;
  }
  ghost.classList.add('is-settling');
  const scale = dropped ? 0.2 : 1;
  ghost.style.transform = `translate(${target.x}px, ${target.y}px) translate(-50%, -50%) scale(${scale})`;
  ghost.style.opacity = dropped ? '0' : '0.4';
  window.setTimeout(() => ghost.remove(), SETTLE_MS);
}

function centreOf(element: Element): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}
