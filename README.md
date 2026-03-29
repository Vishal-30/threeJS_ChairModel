# Chair Configurator

This is a simple chair configurator made with Three.js.

You can:

- pick a chair part
- change its material
- use presets
- see a simple total price
- save and share the current setup
- download a screenshot

## Run It

```bash
npm install
npm run dev
```

## Build It

```bash
npm run build
npm run preview
```

## Check The Code

```bash
npm run lint
npm run test
```

## Optional Asset Tools

```bash
npm run optimize:textures
npm run optimize:model
```

Note:
`optimize:model` creates an optimized copy of the model and keeps the original file unchanged.

## Main Project Files

- `src/main.js` starts the app
- `src/data/catalog.js` stores chair data
- `src/ui.js` handles the page UI
- `src/scene.js` handles the Three.js scene
- `src/materials.js` handles chair materials
- `src/lib/state.js` stores the selected options

For a simple project overview, see `PROJECT.md`.
