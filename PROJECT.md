# Project Notes

## What This Project Is

This is a small chair configurator built with:

- `three.js` for the 3D chair
- `vite` for local development and builds
- plain JavaScript modules for the app logic

The goal is to keep it simple, easy to read, and easy to change.

## What It Can Do

- load a 3D chair model
- change materials by part
- show preset combinations
- calculate a simple total price
- save the current selection in the URL and `localStorage`
- copy/share the current setup
- download a screenshot

## Main Files

- `src/main.js`
  Starts the app and connects everything together.

- `src/data/catalog.js`
  Holds the chair data: parts, finishes, defaults, and presets.

- `src/ui.js`
  Builds the buttons, swatches, and text shown in the sidebar.

- `src/scene.js`
  Creates the Three.js scene, camera, lights, and renderer.

- `src/materials.js`
  Creates and caches materials used on the chair.

- `src/lib/state.js`
  Stores the selected options and keeps them in the URL and local storage.

- `main.css`
  Layout and styles for the page.

## How To Work On It

1. Change product data in `src/data/catalog.js`.
2. Change layout or styles in `index.html` and `main.css`.
3. Change 3D behavior in `src/scene.js` or `src/materials.js`.
4. Keep features small and clear instead of adding big abstractions.

## Simple Rules

- keep modules small
- avoid duplicate data
- prefer plain functions over clever patterns
- keep UI clean and calm
- only add complexity when it solves a real problem
