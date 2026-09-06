/** Vitest setup — jest-dom matchers, RTL cleanup between tests, and stubs for
 *  browser APIs jsdom does not implement (matchMedia, *Observer,
 *  scrollIntoView) so libraries that feature-detect them render cleanly. */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without `globals: true`, RTL cannot register its own cleanup hook.
afterEach(cleanup);

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = ResizeObserverStub;
}

class IntersectionObserverStub implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
if (typeof window.IntersectionObserver === "undefined") {
  window.IntersectionObserver = IntersectionObserverStub;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
