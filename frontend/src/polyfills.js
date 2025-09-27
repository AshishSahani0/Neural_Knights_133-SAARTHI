// Polyfill must run before anything else
if (typeof global === "undefined") {
  window.global = window;
}
