import { useState, useRef, useCallback, useEffect } from 'react';

export function useStateAsync(initialValue) {
  const [state, setState] = useState(initialValue);
  const resolverRef = useRef(null);

  const asyncSetState = useCallback((newValue) => {
    setState(newValue);
    return new Promise(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  // Resolve the promise after state updates
  useEffect(() => {
    if (resolverRef.current) {
      resolverRef.current(state);
      resolverRef.current = null;
    }
  }, [state]);

  return [state, asyncSetState];
}