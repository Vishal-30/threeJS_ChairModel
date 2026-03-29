import { STORAGE_KEY } from '../config.js';

export function normalizeSelections(parts, finishes, candidateSelections, fallbackSelections) {
  const finishMap = new Map(finishes.map((finish) => [finish.id, finish]));
  const normalized = {};

  for (const part of parts) {
    const desired = candidateSelections?.[part.id];
    const fallback = fallbackSelections?.[part.id];
    const desiredFinish = finishMap.get(desired);
    const fallbackFinish = finishMap.get(fallback);

    if (desiredFinish && desiredFinish.targets.includes(part.id)) {
      normalized[part.id] = desiredFinish.id;
      continue;
    }

    if (fallbackFinish && fallbackFinish.targets.includes(part.id)) {
      normalized[part.id] = fallbackFinish.id;
      continue;
    }

    const firstAllowed = finishes.find((finish) => finish.targets.includes(part.id));
    normalized[part.id] = firstAllowed?.id ?? null;
  }

  return normalized;
}

export function createInitialState(catalog) {
  const url = new URL(window.location.href);
  const urlSelections = Object.fromEntries(
    catalog.parts
      .map((part) => [part.id, url.searchParams.get(part.id)])
      .filter(([, value]) => Boolean(value))
  );

  const stored = window.localStorage.getItem(STORAGE_KEY);
  let storedSelections = null;

  if (stored) {
    try {
      storedSelections = JSON.parse(stored).selections;
    } catch (error) {
      console.warn('Ignoring malformed stored configurator state.', error);
    }
  }

  const selections = normalizeSelections(
    catalog.parts,
    catalog.finishes,
    Object.keys(urlSelections).length > 0 ? urlSelections : storedSelections,
    catalog.defaultConfiguration
  );

  return {
    activePart: catalog.parts.find((part) => part.id === 'cushions')?.id ?? catalog.parts[0].id,
    selections,
    lastSharedUrl: ''
  };
}

export function createStore(catalog) {
  let state = createInitialState(catalog);
  const listeners = new Set();

  function emit() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  function persist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ selections: state.selections }));

    const url = new URL(window.location.href);
    for (const [part, finish] of Object.entries(state.selections)) {
      url.searchParams.set(part, finish);
    }
    window.history.replaceState({}, '', url);
  }

  function setState(nextState) {
    state = nextState;
    persist();
    emit();
  }

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    setActivePart(partId) {
      setState({
        ...state,
        activePart: partId
      });
    },
    setFinish(partId, finishId) {
      setState({
        ...state,
        selections: {
          ...state.selections,
          [partId]: finishId
        }
      });
    },
    applyPreset(selections) {
      setState({
        ...state,
        selections: normalizeSelections(catalog.parts, catalog.finishes, selections, state.selections)
      });
    },
    reset() {
      setState({
        ...state,
        selections: normalizeSelections(
          catalog.parts,
          catalog.finishes,
          catalog.defaultConfiguration,
          catalog.defaultConfiguration
        )
      });
    },
    rememberSharedUrl(url) {
      state = {
        ...state,
        lastSharedUrl: url
      };
      emit();
    }
  };
}

export function computeTotalPrice(catalog, selections) {
  const finishMap = new Map(catalog.finishes.map((finish) => [finish.id, finish]));

  return catalog.parts.reduce((total, part) => {
    const finishId = selections[part.id];
    const priceDelta = finishMap.get(finishId)?.priceDelta ?? 0;
    return total + priceDelta;
  }, catalog.product.basePrice);
}

export function getFinishForPart(catalog, partId, finishId) {
  return catalog.finishes.find((finish) => finish.id === finishId && finish.targets.includes(partId)) ?? null;
}

export function getAvailableFinishes(catalog, partId) {
  return catalog.finishes.filter((finish) => finish.targets.includes(partId));
}
