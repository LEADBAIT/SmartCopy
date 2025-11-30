# SmartCopy

SmartCopy is a Manifest V3 Chrome extension that predicts what you want to copy and offers quick options to grab sentences or paragraphs from any webpage.

## Features
- Content script listens for Alt + C or Alt + double click to capture selection context.
- Background worker expands selections into smart copy candidates (exact, sentence, paragraph) and handles the keyboard command.
- React popup shows the latest copy candidates with quick copy buttons and placeholder settings.

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build (watch mode):
   ```bash
   npm run dev
   ```
3. Build for release (also generates placeholder icons if they are missing):
   ```bash
   npm run build
   ```

## Load in Chrome
1. Run `npm run build` to create the `dist/` folder (the compiled scripts such as `content.js` and `background.js` are generated here).
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and choose the `dist/` directory (loading the repo root will fail because the compiled scripts are only in `dist/`).
4. Use Alt + C (or Alt + Shift + C for the command) on any page to send context to SmartCopy, then open the popup to copy candidates.

## Project structure
- `manifest.json` – Manifest V3 definition.
- `src/background.ts` – Service worker handling heuristics, messages, and command.
- `src/content.ts` – Content script capturing context from pages.
- `src/popup/popup.html` – Popup HTML entry used by the React bundle.
- `src/popup/Popup.tsx` – React popup component.
- `src/styles/popup.css` – Popup styles.
- `public/icons/` – Placeholder icons bundled into the build (generated from base64 templates during install/build).
- `vite.config.ts` – Vite configuration for building the extension.
