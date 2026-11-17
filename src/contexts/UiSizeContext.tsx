import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserType } from './UserTypeContext';

export const UI_SIZES = {
  small: { label: 'Pequeno', zoom: 0.9, maxWidth: '72rem' },
  normal: { label: 'Padrão', zoom: 1, maxWidth: '80rem' },
  large: { label: 'Grande', zoom: 1.08, maxWidth: '100rem' },
} as const;

export type UiSize = keyof typeof UI_SIZES;

interface UiSizeContextValue {
  uiSize: UiSize;
  setUiSize: (value: UiSize) => void;
  size: (typeof UI_SIZES)[UiSize];
}

const UiSizeContext = createContext<UiSizeContextValue | undefined>(undefined);

export const UiSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customerId } = useUserType();
  const storageKey = `repoobra:uiSize:${customerId || 'anon'}`;

  const [uiSize, setUiSizeState] = useState<UiSize>(() => {
    try {
      const saved = localStorage.getItem(`repoobra:uiSize:${customerId || 'anon'}`);
      return saved === 'small' || saved === 'large' ? saved : 'normal';
    } catch {
      return 'normal';
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setUiSizeState(saved === 'small' || saved === 'large' ? saved : 'normal');
    } catch {
      setUiSizeState('normal');
    }
  }, [storageKey]);

  const setUiSize = (value: UiSize) => {
    setUiSizeState(value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // armazenamento indisponível: mantém apenas em memória
    }
  };

  return (
    <UiSizeContext.Provider value={{ uiSize, setUiSize, size: UI_SIZES[uiSize] }}>
      {children}
    </UiSizeContext.Provider>
  );
};

export const useUiSize = (): UiSizeContextValue => {
  const ctx = useContext(UiSizeContext);
  if (!ctx) {
    throw new Error('useUiSize deve ser usado dentro de UiSizeProvider');
  }
  return ctx;
};
