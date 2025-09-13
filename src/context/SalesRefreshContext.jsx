import React, { createContext, useState } from 'react';

export const SalesRefreshContext = createContext({ refresh: false, triggerRefresh: () => {} });

export const SalesRefreshProvider = ({ children }) => {
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => {
    setRefresh(r => !r);
  };

  return (
    <SalesRefreshContext.Provider value={{ refresh, triggerRefresh }}>
      {children}
    </SalesRefreshContext.Provider>
  );
};
