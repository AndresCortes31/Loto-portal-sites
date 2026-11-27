import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [me, setMe] = useState(null);
  const [meta, setMeta] = useState(null);

  const refreshMeta = useCallback(() => api.meta().then(setMeta).catch(() => {}), []);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
    refreshMeta();
  }, [refreshMeta]);

  return <AppContext.Provider value={{ me, meta, refreshMeta }}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
