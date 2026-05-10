import { createContext, useContext, useState, ReactNode } from 'react';
import { AudienceMode } from '../types';

interface AudienceContextType {
  mode: AudienceMode;
  setMode: (mode: AudienceMode) => void;
}

const AudienceContext = createContext<AudienceContextType | undefined>(undefined);

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AudienceMode>(AudienceMode.BEGINNER);

  return (
    <AudienceContext.Provider value={{ mode, setMode }}>
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudience() {
  const context = useContext(AudienceContext);
  if (!context) {
    throw new Error('useAudience must be used within an AudienceProvider');
  }
  return context;
}
