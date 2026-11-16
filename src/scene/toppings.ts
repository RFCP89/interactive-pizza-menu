import * as THREE from 'three';
import { catalog, findItem } from '../data/catalog';
import type { Order } from '../state/order';
import { createAnimator, dropAnimation } from './animations';
import { scatterPieces } from './placement';
import { PIZZA_TOP } from './pizza';

/** How far from the centre pieces may land (inside the cheese). */
const SPREAD_RADIUS = 1.05;
/** Each new topping sits a hair higher than the last, so layers don't flicker into each other. */
const LAYER_GAP = 0.012;

interface PieceStyle {
  readonly count: number;
  readonly minDistance: number;
  readonly geometry: () => THREE.BufferGeometry;
}

// Simple stand-in shapes, all lying flat. A topping missing from this list
// still works: it gets the fallback style, so adding a topping stays a catalog-only change.
const styles: Record<string, PieceStyle> = {
  pepperoni: { count: 10, minDistance: 0.32, geometry: () => new THREE.CylinderGeometry(0.16, 0.16, 0.03, 24) },
  ham: { count: 10, minDistance: 0.3, geometry: () => new THREE.BoxGeometry(0.24, 0.025, 0.18) },
  mushrooms: {
    count: 10,
    minDistance: 0.28,
    // Half a disc looks like a sliced mushroom from above.
    geometry: () => new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16, 1, false, 0, Math.PI),
  },
  olives: { count: 14, minDistance: 0.2, geometry: () => flat(new THREE.TorusGeometry(0.06, 0.025, 8, 16)) },
  peppers: { count: 12, minDistance: 0.22, geometry: () => new THREE.BoxGeometry(0.32, 0.03, 0.06) },
  'red-onion': { count: 10, minDistance: 0.26, geometry: () => flat(new THREE.TorusGeometry(0.11, 0.015, 6, 24)) },
  // A cylinder with 3 sides is a triangle: a pineapple chunk.
  pineapple: { count: 10, minDistance: 0.24, geometry: () => new THREE.CylinderGeometry(0.11, 0.11, 0.05, 3) },
  rocket: {
    count: 12,
    minDistance: 0.22,
    geometry: () => new THREE.SphereGeometry(0.1, 12, 8).scale(1.7, 0.2, 0.6),
  },
};

const fallbackStyle: PieceStyle = {
  count: 10,
  minDistance: 0.24,
  geometry: () => new THREE.SphereGeometry(0.07, 12, 8).scale(1, 0.5, 1),
};

export interface ToppingsView {
  /** Adds and removes toppings so the pizza matches the order. Never changes the order. */
  update(order: Order): void;
  /** Moves running animations forward; call once per frame. */
  tick(deltaSeconds: number): void;
}

export function createToppings(parent: THREE.Object3D, prefersReducedMotion: () => boolean): ToppingsView {
  const onPizza = new Map<string, THREE.InstancedMesh>();
  const animator = createAnimator();

  const add = (id: string, layer: number) => {
    const mesh = buildMesh(id);
    const baseY = PIZZA_TOP + layer * LAYER_GAP + restingOffset(mesh.geometry);
    const placements = scatterPieces(id, mesh.count, SPREAD_RADIUS, styleFor(id).minDistance);
    const helper = new THREE.Object3D();

    const setLift = (index: number, lift: number) => {
      const place = placements[index];
      if (!place) return;
      helper.position.set(place.x, baseY + lift, place.z);
      helper.rotation.set(0, place.rotation, 0);
      helper.updateMatrix();
      mesh.setMatrixAt(index, helper.matrix);
    };
    const commit = () => {
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (prefersReducedMotion()) {
      placements.forEach((_, index) => setLift(index, 0));
      commit();
    } else {
      animator.add(dropAnimation({ count: mesh.count, setLift, commit, isAlive: () => onPizza.get(id) === mesh }));
    }

    parent.add(mesh);
    onPizza.set(id, mesh);
  };

  const remove = (id: string) => {
    const mesh = onPizza.get(id);
    if (!mesh) return;
    parent.remove(mesh);
    // Free the GPU memory used by this topping.
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    mesh.dispose();
    onPizza.delete(id);
  };

  return {
    update(order) {
      for (const id of [...onPizza.keys()]) {
        if (!order.toppingIds.includes(id)) remove(id);
      }
      order.toppingIds.forEach((id, layer) => {
        if (!onPizza.has(id)) add(id, layer);
      });
    },
    tick(deltaSeconds) {
      animator.tick(deltaSeconds);
    },
  };
}

function buildMesh(id: string): THREE.InstancedMesh {
  const style = styleFor(id);
  const color = findItem(catalog.toppings, id)?.color ?? '#999999';
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const mesh = new THREE.InstancedMesh(style.geometry(), material, style.count);
  mesh.name = `topping:${id}`;
  return mesh;
}

function styleFor(id: string): PieceStyle {
  return styles[id] ?? fallbackStyle;
}

/** How much to lift a shape so its bottom touches the cheese instead of sinking into it. */
function restingOffset(geometry: THREE.BufferGeometry): number {
  geometry.computeBoundingBox();
  return -(geometry.boundingBox?.min.y ?? 0);
}

/** Torus shapes are made standing up; lay them flat like rings on the pizza. */
function flat(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  return geometry.rotateX(-Math.PI / 2);
}
