import { useCallback, useEffect, useState } from 'react';

/** Ejecuta una llamada al API y expone { data, loading, error, reload }. */
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, loading: false, error })));
    return () => { cancelled = true; };
  }, deps);

  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}
