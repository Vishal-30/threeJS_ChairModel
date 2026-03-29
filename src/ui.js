export function buildColors(colors, tray) {
  for (const [index, color] of colors.entries()) {
    const swatch = document.createElement('div');
    swatch.classList.add('tray__swatch');

    if (color.texture) {
      swatch.style.backgroundImage = `url(${color.texture})`;
    } else {
      swatch.style.background = `#${color.color}`;
    }

    swatch.dataset.key = index;
    tray.append(swatch);
  }
}

export function bindOptions(options, onSelect) {
  let activeOption = document.querySelector('.option.--is-active')?.dataset.option ?? 'legs';

  for (const option of options) {
    option.addEventListener('click', () => {
      activeOption = option.dataset.option;

      for (const otherOption of options) {
        otherOption.classList.remove('--is-active');
      }

      option.classList.add('--is-active');
      onSelect(activeOption);
    });
  }

  return {
    getActiveOption() {
      return activeOption;
    }
  };
}

export function bindSwatches(swatches, onSelect) {
  for (const swatch of swatches) {
    swatch.addEventListener('click', () => {
      onSelect(Number.parseInt(swatch.dataset.key, 10));
    });
  }
}

export function setupTraySlider(slider, sliderItems) {
  let difference;
  let posX1 = 0;
  let posX2 = 0;

  function dragStart(event) {
    const pointerEvent = event || window.event;
    difference = sliderItems.offsetWidth - slider.offsetWidth;
    difference *= -1;

    if (pointerEvent.type === 'touchstart') {
      posX1 = pointerEvent.touches[0].clientX;
    } else {
      posX1 = pointerEvent.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction(event) {
    const pointerEvent = event || window.event;

    if (pointerEvent.type === 'touchmove') {
      posX2 = posX1 - pointerEvent.touches[0].clientX;
      posX1 = pointerEvent.touches[0].clientX;
    } else {
      posX2 = posX1 - pointerEvent.clientX;
      posX1 = pointerEvent.clientX;
    }

    if (sliderItems.offsetLeft - posX2 <= 0 && sliderItems.offsetLeft - posX2 >= difference) {
      sliderItems.style.left = `${sliderItems.offsetLeft - posX2}px`;
    }
  }

  function dragEnd() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  sliderItems.onmousedown = dragStart;
  sliderItems.addEventListener('touchstart', dragStart, { passive: true });
  sliderItems.addEventListener('touchend', dragEnd);
  sliderItems.addEventListener('touchmove', dragAction, { passive: true });
}

export function hideLoader(loader) {
  if (loader?.isConnected) {
    loader.remove();
  }
}

export function showDragNotice(notice) {
  notice.classList.add('start');
}

export function showLoadError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.hidden = false;
}
