import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { APP_BACKGROUND, CAMERA_FAR, SHARE_MESSAGE_TIMEOUT } from './config.js';
import { fetchCatalog } from './catalog.js';
import { createStore, getFinishForPart } from './lib/state.js';
import { shareConfiguration } from './lib/share.js';
import { applyMaterialToPart, createMaterial, primeModelMaterials } from './materials.js';
import { createScene } from './scene.js';
import { createUI } from './ui.js';

const canvas = document.getElementById('c');
const loaderElement = document.getElementById('js-loader');
const dragNotice = document.getElementById('js-drag-notice');

let animationFrame = 0;
let model = null;
let sceneApi = null;
let ui = null;
let store = null;
let catalog = null;

function hideLoader() {
  if (loaderElement?.isConnected) {
    loaderElement.remove();
  }
}

function showDragNotice() {
  dragNotice.classList.add('start');
}

function applySelectionsToModel() {
  if (!model || !catalog || !store) {
    return;
  }

  const { selections } = store.getState();

  for (const part of catalog.parts) {
    const finish = getFinishForPart(catalog, part.id, selections[part.id]);
    if (finish) {
      applyMaterialToPart(model, part.id, createMaterial(finish));
    }
  }
}

function downloadScreenshot(imageDataUrl) {
  const link = document.createElement('a');
  link.href = imageDataUrl;
  link.download = 'chair-configuration.png';
  link.click();
}

async function bootstrap() {
  catalog = await fetchCatalog();
  store = createStore(catalog);

  sceneApi = createScene({
    canvas,
    backgroundColor: APP_BACKGROUND,
    cameraFar: CAMERA_FAR
  });

  ui = createUI({
    catalog,
    store,
    onReset: () => store.reset(),
    onShare: async () => {
      const url = window.location.href;
      try {
        await shareConfiguration(url);
        ui.setShareStatus('Share link copied.');
      } catch (error) {
        console.error(error);
        ui.setShareStatus('Sharing is not available in this browser.');
      }
    },
    onScreenshot: () => {
      const image = sceneApi.captureImage();
      downloadScreenshot(image);
      ui.setShareStatus('Screenshot downloaded.');
    },
    onRetry: () => window.location.reload(),
    shareMessageTimeout: SHARE_MESSAGE_TIMEOUT
  });

  store.subscribe((state) => {
    ui.update(state);
    applySelectionsToModel();
  });

  const loader = new GLTFLoader();
  loader.load(
    catalog.product.modelPath,
    (gltf) => {
      model = gltf.scene;
      model.scale.set(2, 2, 2);
      model.rotation.y = Math.PI;
      model.position.y = -0.7;

      model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      primeModelMaterials(model, catalog.parts);
      applySelectionsToModel();
      sceneApi.scene.add(model);
      hideLoader();
    },
    (event) => {
      if (!event.total) {
        ui.setProgress(50);
        return;
      }

      ui.setProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    },
    (error) => {
      console.error(error);
      hideLoader();
      ui.showError(
        'The chair model could not be loaded. Try refreshing the page or running the local npm dev server again.'
      );
    }
  );
}

function animate() {
  requestAnimationFrame(animate);

  if (model && animationFrame < 120) {
    animationFrame += 1;
    model.rotation.y += Math.PI / 60;
    if (animationFrame === 120) {
      showDragNotice();
    }
  }

  sceneApi?.render();
}

bootstrap().catch((error) => {
  console.error(error);
  hideLoader();
  document.getElementById('js-load-error').hidden = false;
  document.querySelector('[data-error-message]').textContent = `Startup failed: ${
    error?.message ?? 'Unknown error'
  }`;
});

animate();
