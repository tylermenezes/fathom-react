export const pushStateEventName = '_fathomStatechange';
let hasRunFixPushState = false;

/**
 * Adds events for all pushState/etc methods. This mutates the window object, so it will only ever run once.
 */
export const fixPushStateListeners = () => {
  if (typeof window === 'undefined' || hasRunFixPushState) return;

  // eslint-disable-next-line no-undef
  const { history, dispatchEvent } = window;

  /**
   * Intercepts a pushState/etc method and dispatches our custom event.
   *
   * @param {Function} originalMethod The original pushState/etc method to intercept.
   * @returns {Function} New method.
   */
  const interceptMethod = (originalMethod) => (...args) => {
    const output = originalMethod.apply(history, args);
    // eslint-disable-next-line no-undef
    dispatchEvent(new Event(pushStateEventName));
    return output;
  };

  history.pushState = interceptMethod(history.pushState);
  history.popState = interceptMethod(history.popState);
  history.replaceState = interceptMethod(history.replaceState);

  hasRunFixPushState = true;
};
