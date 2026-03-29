import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BACKGROUND_COLOR, CAMERA_FAR, COLORS, MODEL_PATH, PART_OPTIONS } from './config.js';
import {
  applyInitialMaterials,
  createInitialMaterial,
  createVariantMaterial,
  setMaterial
} from './materials.js';
import { createScene } from './scene.js';
import {
  bindOptions,
  bindSwatches,
  buildColors,
  hideLoader,
  setupTraySlider,
  showDragNotice,
  showLoadError
} from './ui.js';

const dragNotice = document.getElementById('js-drag-notice');
const tray = document.getElementById('js-tray-slide');
const loaderElement = document.getElementById('js-loader');
const errorElement = document.getElementById('js-load-error');
const canvas = document.querySelector('#c');
const slider = document.getElementById('js-tray');
const sliderItems = document.getElementById('js-tray-slide');
const options = document.querySelectorAll('.option');

let model = null;
let hasCompletedIntroSpin = false;
let introRotationFrame = 0;

const { scene, render } = createScene({
  canvas,
  backgroundColor: BACKGROUND_COLOR,
  cameraFar: CAMERA_FAR
});

buildColors(COLORS, tray);
setupTraySlider(slider, sliderItems);

const optionState = bindOptions(options, () => {});
const swatches = document.querySelectorAll('.tray__swatch');

bindSwatches(swatches, (colorIndex) => {
  if (!model) {
    return;
  }

  const material = createVariantMaterial(COLORS[colorIndex]);
  setMaterial(model, optionState.getActiveOption(), material);
});

const loader = new GLTFLoader();
const initialMaterial = createInitialMaterial();

loader.load(
  MODEL_PATH,
  (gltf) => {
    model = gltf.scene;

    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    model.scale.set(2, 2, 2);
    model.rotation.y = Math.PI;
    model.position.y = -1;

    applyInitialMaterials(model, PART_OPTIONS, initialMaterial);
    scene.add(model);
    hideLoader(loaderElement);
  },
  undefined,
  (error) => {
    console.error(error);
    hideLoader(loaderElement);
    showLoadError(
      errorElement,
      'The chair model could not be loaded. Check that npm dev server is running and the assets are available.'
    );
  }
);

function animate() {
  requestAnimationFrame(animate);

  if (model && !hasCompletedIntroSpin) {
    introRotationFrame += 1;

    if (introRotationFrame <= 120) {
      model.rotation.y += Math.PI / 60;
    } else {
      hasCompletedIntroSpin = true;
      showDragNotice(dragNotice);
    }
  }

  render();
}

animate();
