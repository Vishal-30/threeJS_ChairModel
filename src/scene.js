import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createScene({ canvas, backgroundColor, cameraFar }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  scene.fog = new THREE.Fog(backgroundColor, 20, 100);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = cameraFar;
  camera.position.x = 0;

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.position.set(-8, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  scene.add(dirLight);

  const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    shininess: 0
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI;
  floor.receiveShadow = true;
  floor.position.y = -1;
  scene.add(floor);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 3;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.1;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.2;

  function resizeRendererToDisplaySize() {
    const currentCanvas = renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const canvasPixelWidth = currentCanvas.width / window.devicePixelRatio;
    const canvasPixelHeight = currentCanvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function render() {
    controls.update();
    renderer.render(scene, camera);

    if (resizeRendererToDisplaySize()) {
      const currentCanvas = renderer.domElement;
      camera.aspect = currentCanvas.clientWidth / currentCanvas.clientHeight;
      camera.updateProjectionMatrix();
    }
  }

  return {
    scene,
    render
  };
}
