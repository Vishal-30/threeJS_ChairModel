import catalogData from './data/catalog.js';

function withBase(path) {
  if (!path) {
    return path;
  }

  if (/^(https?:)?\/\//.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

export async function fetchCatalog() {
  return {
    ...catalogData,
    product: {
      ...catalogData.product,
      modelPath: withBase(catalogData.product.modelPath),
    },
    parts: catalogData.parts.map((part) => ({
      ...part,
      icon: withBase(part.icon),
    })),
    finishes: catalogData.finishes.map((finish) => ({
      ...finish,
      texture: finish.texture ? withBase(finish.texture) : finish.texture,
    })),
  };
}
