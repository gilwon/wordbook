import '@testing-library/jest-dom';

// Node.js v22+ has an experimental `localStorage` property on globalThis that
// is `undefined`. When vitest sets up jsdom, populateGlobal() skips keys that
// already exist on the global object unless they are in the hardcoded KEYS list.
// `localStorage` is not in that list, so jsdom's working localStorage is never
// propagated. We fix this by reading it directly from the jsdom dom instance
// that vitest stores as `global.jsdom`.
const dom = (global as unknown as { jsdom?: { window: Window } }).jsdom;
if (dom) {
  Object.defineProperty(globalThis, 'localStorage', {
    get: () => dom.window.localStorage,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    get: () => dom.window.sessionStorage,
    configurable: true,
  });
}
