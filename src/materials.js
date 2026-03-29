import * as THREE from 'three';

const textureCache = new Map();
const materialCache = new Map();

function getTexture(path, repeat) {
  const cacheKey = `${path}:${repeat.join('x')}`;

  if (!textureCache.has(cacheKey)) {
    const texture = new THREE.TextureLoader().load(path);
    texture.repeat.set(repeat[0], repeat[1]);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    textureCache.set(cacheKey, texture);
  }

  return textureCache.get(cacheKey);
}

export function createMaterial(finish) {
  const cacheKey = finish.id;

  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey);
  }

  const material = finish.texture
    ? new THREE.MeshStandardMaterial({
        map: getTexture(finish.texture, finish.size ?? [2, 2]),
        roughness: 0.75,
        metalness: 0.05
      })
    : new THREE.MeshStandardMaterial({
        color: parseInt(`0x${finish.color}`, 16),
        roughness: 0.7,
        metalness: 0.08
      });

  materialCache.set(cacheKey, material);
  return material;
}

export function applyMaterialToPart(model, partId, material) {
  model.traverse((object) => {
    if (object.isMesh && object.nameID === partId) {
      object.material = material;
    }
  });
}

export function primeModelMaterials(model, parts) {
  for (const part of parts) {
    model.traverse((object) => {
      if (object.isMesh && object.name.includes(part.id)) {
        object.nameID = part.id;
      }
    });
  }
}
