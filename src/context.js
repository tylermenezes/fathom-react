import { useContext, createContext } from 'react';

export const FathomContext = createContext(null);
/**
 * Returns fathom instance for use in a component.
 *
 * @returns {object} (pageView(path, data), goal(goalId, goalValue, data))
 */
export const useFathom = () => useContext(FathomContext);
