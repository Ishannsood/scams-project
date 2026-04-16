import { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('scams_dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('scams_dark', String(dark));
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
