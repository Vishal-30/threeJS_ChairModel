import { computeTotalPrice, getAvailableFinishes, getFinishForPart } from './lib/state.js';

function formatCurrency(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function createOptionButton(part) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'option-card';
  button.dataset.part = part.id;
  button.title = part.description;
  button.innerHTML = `
    <img src="${part.icon}" alt="${part.label}" />
    <span class="option-card__text">
      <strong>${part.label}</strong>
      <small>${part.description}</small>
    </span>
  `;
  return button;
}

function createPresetButton(preset) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'preset-card';
  button.dataset.preset = preset.id;
  button.innerHTML = `
    <strong>${preset.name}</strong>
    <span>${preset.description}</span>
  `;
  return button;
}

function createSwatchButton(finish) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tray__swatch';
  button.dataset.finish = finish.id;
  button.title = `${finish.label} (${finish.category})`;

  if (finish.texture) {
    button.style.backgroundImage = `url(${finish.texture})`;
  } else {
    button.style.background = finish.preview;
  }

  return button;
}

export function createUI({
  catalog,
  store,
  onReset,
  onShare,
  onScreenshot,
  onRetry,
  shareMessageTimeout
}) {
  const optionsContainer = document.getElementById('js-options');
  const presetsContainer = document.getElementById('js-presets');
  const swatchesContainer = document.getElementById('js-tray-slide');
  const selectionList = document.getElementById('js-selection-list');
  const activePartLabel = document.getElementById('js-active-part');
  const activeFinishLabel = document.getElementById('js-active-finish');
  const totalPrice = document.getElementById('js-total-price');
  const shareStatus = document.getElementById('js-share-status');
  const loaderText = document.getElementById('js-loader-text');
  const errorBanner = document.getElementById('js-load-error');
  const retryButton = document.getElementById('js-retry-button');
  const resetButton = document.getElementById('js-reset');
  const shareButton = document.getElementById('js-share');
  const screenshotButton = document.getElementById('js-screenshot');

  const optionButtons = new Map();
  const presetButtons = new Map();
  let shareTimer = null;

  optionsContainer.innerHTML = '';
  for (const part of catalog.parts) {
    const button = createOptionButton(part);
    button.addEventListener('click', () => store.setActivePart(part.id));
    optionsContainer.append(button);
    optionButtons.set(part.id, button);
  }

  presetsContainer.innerHTML = '';
  for (const preset of catalog.presets) {
    const button = createPresetButton(preset);
    button.addEventListener('click', () => store.applyPreset(preset.selections));
    presetsContainer.append(button);
    presetButtons.set(preset.id, button);
  }

  retryButton.addEventListener('click', onRetry);
  resetButton.addEventListener('click', onReset);
  shareButton.addEventListener('click', onShare);
  screenshotButton.addEventListener('click', onScreenshot);

  function updateSwatches(activePart, selectedFinishId) {
    const availableFinishes = getAvailableFinishes(catalog, activePart);
    swatchesContainer.innerHTML = '';

    for (const finish of availableFinishes) {
      const button = createSwatchButton(finish);
      button.addEventListener('click', () => store.setFinish(activePart, finish.id));
      if (finish.id === selectedFinishId) {
        button.classList.add('tray__swatch--active');
      }
      swatchesContainer.append(button);
    }
  }

  function updateSelections(state) {
    selectionList.innerHTML = '';

    for (const part of catalog.parts) {
      const finish = getFinishForPart(catalog, part.id, state.selections[part.id]);
      const item = document.createElement('li');
      item.className = 'selection-list__item';
      item.innerHTML = `
        <span>${part.label}</span>
        <strong>${finish?.label ?? 'Unavailable'}</strong>
      `;
      selectionList.append(item);
    }
  }

  function updatePresets(state) {
    for (const preset of catalog.presets) {
      const isActive = catalog.parts.every(
        (part) => preset.selections[part.id] === state.selections[part.id]
      );
      presetButtons.get(preset.id)?.classList.toggle('preset-card--active', isActive);
    }
  }

  return {
    update(state) {
      const activePart = catalog.parts.find((part) => part.id === state.activePart);
      const activeFinish = getFinishForPart(catalog, state.activePart, state.selections[state.activePart]);

      for (const part of catalog.parts) {
        optionButtons.get(part.id)?.classList.toggle('option-card--active', part.id === state.activePart);
      }

      updateSwatches(state.activePart, state.selections[state.activePart]);
      updateSelections(state);
      updatePresets(state);

      activePartLabel.textContent = activePart?.label ?? 'Choose a part';
      activeFinishLabel.textContent = activeFinish
        ? `${activeFinish.label} · ${activeFinish.category}`
        : 'Select a finish';
      totalPrice.textContent = formatCurrency(
        computeTotalPrice(catalog, state.selections),
        catalog.product.currency
      );
    },
    setProgress(progress) {
      loaderText.textContent = progress < 100
        ? `Loading chair model... ${progress}%`
        : 'Loading chair model...';
    },
    setShareStatus(message) {
      shareStatus.textContent = message;
      if (shareTimer) {
        window.clearTimeout(shareTimer);
      }
      shareTimer = window.setTimeout(() => {
        shareStatus.textContent = '';
      }, shareMessageTimeout);
    },
    showError(message) {
      errorBanner.hidden = false;
      errorBanner.querySelector('[data-error-message]').textContent = message;
    },
    hideError() {
      errorBanner.hidden = true;
    }
  };
}
