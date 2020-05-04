/**
 * Gets the canonical location for the current page, if set, or returns window.location.
 *
 * @returns {object} window.location-like object.
 */
const findCanonicalLocation = () => {
  // eslint-disable-next-line no-undef
  const { document, location } = window;

  const cLink = document.querySelector('link[rel="canonical"][href]');
  if (cLink) {
    const link = document.createElement('a');
    link.href = cLink.href;
    return link;
  }

  return location;
};

/**
 * Gets the external referrer. Returns null if the referrer is from the same hostname.
 *
 * @param {string} hostname Current hostname
 * @returns {string} Referrer. Empty-string if no referrer is found, or the referrer is internal.
 */
const getReferrer = (hostname) => {
  // eslint-disable-next-line no-undef
  const { document } = window;

  if (document.referrer.indexOf(hostname) < 0) {
    return document.referrer;
  }

  return '';
};

/**
 * Gets the user's timezone.
 *
 * @returns {string} The user's timezone.
 */
const getTz = () => (
  // eslint-disable-next-line no-undef
  window.Intl.DateTimeFormat().resolvedOptions().timeZone
);

/**
 * Encodes the data for the request.
 *
 * @param {object} data Data to encode.
 * @returns {string} Encoded data.
 */
const encodeData = (data) => (
  // eslint-disable-next-line prefer-template
  '?' + Object.keys(data).map((i) => (
    `${encodeURIComponent(i)}=${encodeURIComponent(data[i])}`
  )).join('&')
);

/**
 * Creates a function which takes an event name and event data, and sends it to Fathom.
 *
 * @param {string} trackerUrl Fathom tracker base URL.
 * @param {string} siteId Fathom site ID.
 * @returns {Function} Function taking eventName and data, and sending the result to Fathom.
 */
const sendPayloadFactory = (trackerUrl, siteId) => (eventName, data) => {
  // Verify we're not rendering in the server
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line no-undef
  const { navigator, document } = window;

  // Verify we should be sending events for this user
  if (/bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent)) return;
  if ('visibilityState' in document && document.visibilityState === 'prerender') return;

  // Schedule future event if the document has not loaded (not sure if this is necessary in React but it was in the
  // original fathom.js library so here it is)
  if (document.body === null) {
    document.addEventListener('DOMContentLoaded', () => sendPayloadFactory(trackerUrl, siteId)(eventName, data));
  }

  // Build the payload
  const location = findCanonicalLocation();
  const hostname = `${location.protocol}//${location.hostname}`;
  const referrer = getReferrer(hostname);

  const postdata = {
    p: data.path || location.pathname + location.search,
    h: data.hostname || hostname,
    r: data.referrer || referrer,
    sid: siteId,
    tz: getTz(),
  };

  // Send goal payload, this is in a beacon so it can continue if the page navigates
  if (eventName === 'goal') {
    postdata.gcode = data.gcode;
    postdata.gval = data.gval || '0';
    navigator.sendBeacon(`${trackerUrl}/${encodeData(postdata)}`);
    return;
  }

  // Send other payloads
  const element = document.createElement('img');
  element.setAttribute('alt', '');
  element.setAttribute('aria-hidden', 'true');
  element.style.position = 'absolute';
  element.style.top = '-100px';
  element.style.left = '-100px';
  element.src = `${trackerUrl}/${encodeData(postdata)}`;
  element.addEventListener('load', () => element.parentNode.removeChild(element));
  element.addEventListener('error', () => element.parentNode.removeChild(element));
  document.body.appendChild(element);
};
export default sendPayloadFactory;
