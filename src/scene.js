import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createScene({ canvas, backgroundColor, cameraFar }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  scene.fog = new THREE.Fog(backgroundColor, 15, 42);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0.9, 1.7, cameraFar);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 3.3;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.72, 0);

  const hemiLight = new THREE.HemisphereLight(0xfff7ef, 0x6a707b, 0.95);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
  keyLight.position.set(6, 10, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);

  const fillLight = new THREE.DirectionalLight(0xd8e5ff, 0.45);
  fillLight.position.set(-7, 4, 5);

  const rimLight = new THREE.PointLight(0xffc98b, 0.4, 18);
  rimLight.position.set(-2, 3.4, -3.2);

  scene.add(hemiLight, keyLight, fillLight, rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.56;
  floor.receiveShadow = true;
  scene.add(floor);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 2.1, 0.18, 64),
    new THREE.MeshStandardMaterial({
      color: 0xd8d0c5,
      roughness: 0.95,
      metalness: 0
    })
  );
  plinth.position.y = -0.64;
  plinth.receiveShadow = true;
  scene.add(plinth);

  function resizeRendererToDisplaySize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize = renderer.domElement.width !== width * renderer.getPixelRatio() ||
      renderer.domElement.height !== height * renderer.getPixelRatio();

    if (needResize) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function render() {
    resizeRendererToDisplaySize();
    controls.update();
    renderer.render(scene, camera);
  }

  function captureImage() {
    render();
    return renderer.domElement.toDataURL('image/png');
  }

  return {
    scene,
    controls,
    camera,
    render,
    captureImage
  };
}
