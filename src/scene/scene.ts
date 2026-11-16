import * as THREE from 'three';

export interface Stage {
  readonly scene: THREE.Scene;
  /** Called once per frame with the seconds since the last frame. */
  onFrame(callback: (deltaSeconds: number) => void): void;
}

const MAX_PIXEL_RATIO = 2;

/**
 * Sets up the renderer, camera and lights inside `container`.
 * Returns null when the browser cannot do WebGL, so the caller can show a static image instead.
 */
export function createStage(container: HTMLElement): Stage | null {
  const renderer = createRenderer();
  if (!renderer) {
    return null;
  }

  const canvas = renderer.domElement;
  // The 3D view is decoration: the text summary next to it says the same thing.
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  // Above the table and slightly in front, looking down at the pizza.
  camera.position.set(0, 5, 3.4);
  camera.lookAt(0, 0, 0);

  addLights(scene);
  keepSizeInSync(container, renderer, camera);

  const frameCallbacks: Array<(deltaSeconds: number) => void> = [];
  const timer = new THREE.Timer();
  // Lets the timer ignore the time spent in a hidden tab, so nothing jumps when you come back.
  timer.connect(document);

  const renderFrame = (timestamp: number) => {
    timer.update(timestamp);
    const delta = timer.getDelta();
    frameCallbacks.forEach((callback) => callback(delta));
    renderer.render(scene, camera);
  };

  // Pause the loop when the tab is hidden, to save battery.
  const syncLoopWithVisibility = () => {
    renderer.setAnimationLoop(document.hidden ? null : renderFrame);
  };
  document.addEventListener('visibilitychange', syncLoopWithVisibility);
  syncLoopWithVisibility();

  return {
    scene,
    onFrame(callback) {
      frameCallbacks.push(callback);
    },
  };
}

function createRenderer(): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    return renderer;
  } catch {
    return null;
  }
}

function addLights(scene: THREE.Scene): void {
  // Soft light from everywhere (warm from above, darker from below)...
  scene.add(new THREE.HemisphereLight('#fff6e8', '#5a4636', 1.6));
  // ...plus one "sun" from the top left, which gives the shapes some depth.
  const sun = new THREE.DirectionalLight('#ffffff', 1.6);
  sun.position.set(-3, 6, 2);
  scene.add(sun);
}

function keepSizeInSync(container: HTMLElement, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera): void {
  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();
}
