import { describe, expect, it } from 'vitest';
import { computeTotalPrice, getAvailableFinishes, normalizeSelections } from '../lib/state.js';

const catalog = {
  product: {
    basePrice: 900
  },
  parts: [{ id: 'legs' }, { id: 'back' }],
  finishes: [
    { id: 'walnut', priceDelta: 90, targets: ['legs'] },
    { id: 'linen', priceDelta: 110, targets: ['back'] },
    { id: 'charcoal', priceDelta: 20, targets: ['legs', 'back'] }
  ]
};

describe('state helpers', () => {
  it('normalizes invalid selections back to allowed values', () => {
    expect(
      normalizeSelections(
        catalog.parts,
        catalog.finishes,
        { legs: 'linen', back: 'linen' },
        { legs: 'walnut', back: 'charcoal' }
      )
    ).toEqual({
      legs: 'walnut',
      back: 'linen'
    });
  });

  it('computes total price using base price and selected finishes', () => {
    expect(computeTotalPrice(catalog, { legs: 'walnut', back: 'linen' })).toBe(1100);
  });

  it('filters finishes by part availability', () => {
    expect(getAvailableFinishes(catalog, 'legs').map((finish) => finish.id)).toEqual([
      'walnut',
      'charcoal'
    ]);
  });
});
