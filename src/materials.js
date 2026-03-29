import * as THREE from 'three';

export function createInitialMaterial() {
  return new THREE.MeshPhongMaterial({
    color: 0xf1f1f1,
    shininess: 10
  });
}

export function applyInitialMaterials(model, partOptions, material) {
  for (const part of partOptions) {
    model.traverse((object) => {
      if (object.isMesh && object.name.includes(part)) {
        object.material = material;
        object.nameID = part;
      }
    });
  }
}

export function createVariantMaterial(colorOption) {
  if (colorOption.texture) {
    const texture = new THREE.TextureLoader().load(colorOption.texture);

    texture.repeat.set(colorOption.size[0], colorOption.size[1], colorOption.size[2]);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return new THREE.MeshPhongMaterial({
      map: texture,
      shininess: colorOption.shininess ?? 10
    });
  }

  return new THREE.MeshPhongMaterial({
    color: parseInt(`0x${colorOption.color}`, 16),
    shininess: colorOption.shininess ?? 10
  });
}

export function setMaterial(model, part, material) {
  model.traverse((object) => {
    if (object.isMesh && object.nameID === part) {
      object.material = material;
    }
  });
}
