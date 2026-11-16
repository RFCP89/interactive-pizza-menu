import * as THREE from 'three';
import { catalog, findItem, type CatalogItem } from '../data/catalog';
import type { Order } from '../state/order';

export const PIZZA_RADIUS = 1.5;
/** Height of the top of the cheese, where toppings will sit. */
export const PIZZA_TOP = 0.15;

export interface PizzaView {
  readonly group: THREE.Group;
  /** Repaints the base, sauce and cheese to match the order. Never changes the order. */
  update(order: Order): void;
}

export function createPizza(): PizzaView {
  const group = new THREE.Group();

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(PIZZA_RADIUS + 0.3, PIZZA_RADIUS + 0.2, 0.06, 64),
    new THREE.MeshStandardMaterial({ color: '#f4f1ec', roughness: 0.4 }),
  );
  plate.position.y = -0.03;

  const doughMaterial = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(PIZZA_RADIUS, PIZZA_RADIUS, 0.1, 64), doughMaterial);
  base.position.y = 0.05;

  // A ring around the edge, so it reads as a pizza and not a flat coin.
  const crust = new THREE.Mesh(new THREE.TorusGeometry(PIZZA_RADIUS - 0.08, 0.1, 16, 64), doughMaterial);
  crust.rotation.x = -Math.PI / 2;
  crust.position.y = 0.1;

  const sauceMaterial = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const sauce = new THREE.Mesh(wavyDisc(PIZZA_RADIUS - 0.2, 0.025, 9, 0.03), sauceMaterial);
  sauce.position.y = 0.1;

  const cheeseMaterial = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const cheese = new THREE.Mesh(wavyDisc(PIZZA_RADIUS - 0.3, 0.025, 14, 0.06), cheeseMaterial);
  cheese.position.y = 0.125;

  group.add(plate, base, crust, sauce, cheese);

  return {
    group,
    update(order) {
      applyLook(doughMaterial, findItem(catalog.doughs, order.doughId));
      applyLook(sauceMaterial, findItem(catalog.sauces, order.sauceId));
      applyLook(cheeseMaterial, findItem(catalog.cheeses, order.cheeseId));
    },
  };
}

/**
 * Makes a material look like a catalog item. For now that is just its colour;
 * this is the one place to change when items get a PNG texture.
 */
function applyLook(material: THREE.MeshStandardMaterial, item: CatalogItem | undefined): void {
  if (item) {
    material.color.set(item.color);
  }
}

/** A thin flat disc with a gently wavy edge, lying on the table (facing up). */
function wavyDisc(radius: number, thickness: number, waves: number, waveSize: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const points = 96;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius + Math.sin(angle * waves) * waveSize;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  // Shapes are drawn standing up; turn it so it lies flat with its thickness going up.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
