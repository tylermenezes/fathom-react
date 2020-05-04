/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FathomContext } from './context';
import sendPayloadFactory from './payload';
import { fixPushStateListeners, pushStateEventName } from './utils';

fixPushStateListeners();
const defaultDomain = 'collect.usefathom.com';

/**
 * Provides a Fathom context for your app.
 *
 * @param {object} props                      React params.
 * @param {string=} props.customDomain        Custom Fathom domain, if configured. This will improve metrics.
 * @param {string=} props.siteId              Fathom site ID, usually 6 uppercase letters.
 * @param {boolean=} props.noPageviews        Disables automatic sending of pageview events to Fathom.
 * @param {object[]} props.children           Children to recieve Fathom context. This is usually your whole app.
 *
 * @returns {object[]}                        React render.
 */
export default function Fathom({
  customDomain, siteId, noPageviews, children,
}) {
  const sendPayload = sendPayloadFactory(`https://${customDomain || defaultDoain}`, siteId);

  const fathomWrapper = {
    pageView: (path, data) => sendPayload('pageview', { path, ...(data || {}) }),
    goal: (goalId, cost, data) => sendPayload('goal', { gcode: goalId, gval: cost, ...(data || {}) }),
  };

  /**
   * Runs whenever the page is changed from a pushstate/etc and sends the Fathom event.
   */
  const onChange = () => { if (!noPageviews) sendPayload('pageview', {}); };

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(pushStateEventName, onChange);
    if (!noPageviews) sendPayload('pageview', {});
    return () => window.removeEventListener(pushStateEventName, onChange);
  }, [typeof window, noPageviews, customDomain, siteId]);

  return (
    <FathomContext.Provider value={fathomWrapper}>
      {children}
    </FathomContext.Provider>
  );
}
Fathom.displayName = 'Fathom';
Fathom.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]).isRequired,
  siteId: PropTypes.string.isRequired,
  customDomain: PropTypes.string,
  noPageviews: PropTypes.bool,
};
Fathom.defaultProps = {
  customDomain: defaultDomain,
  noPageviews: false,
};
export { useFathom } from './context';
