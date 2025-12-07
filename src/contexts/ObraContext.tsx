//Responsável de User: Bruno Macedo
// src/context/ObraContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ObraData {
  [faseId: string]: {
    [secao: string]: any;
  };
}

interface ObraContextType {
  data: ObraData;
  updateSecaoProgress: (faseId: string, secao: string, progresso: number, peso?: number) => void;
  getPhaseProgress: (faseId: string) => number;
}

const ObraContext = createContext<ObraContextType | undefined>(undefined);

export const ObraProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ObraData>({});

  // ← ESSA É A CORREÇÃO: useCallback para a função não mudar toda hora
  const updateSecaoProgress = useCallback((
    faseId: string,
    secao: string,
    progresso: number,
    peso: number = 100
  ) => {
    setData(prev => {
      const faseAtual = prev[faseId] || {};
      const novoProgresso = Math.round(progresso);

      if (faseAtual[secao]?.progresso === novoProgresso) {
        return prev; // ← evita loop: não atualiza se o valor for o mesmo
      }

      return {
        ...prev,
        [faseId]: {
          ...faseAtual,
          [secao]: {
            ...(faseAtual[secao] || {}),
            progresso: novoProgresso,
            peso
          }
        }
      };
    });
  }, []);

  const getPhaseProgress = useCallback((faseId: string): number => {
    const fase = data[faseId];
    if (!fase) return 0;

    let total = 0;
    let pesoTotal = 0;

    Object.values(fase).forEach((secao: any) => {
      if (secao.progresso !== undefined) {
        total += secao.progresso * (secao.peso || 100);
        pesoTotal += secao.peso || 100;
      }
    });

    return pesoTotal > 0 ? Math.round(total / pesoTotal) : 0;
  }, [data]);

  return (
    <ObraContext.Provider value={{ data, updateSecaoProgress, getPhaseProgress }}>
      {children}
    </ObraContext.Provider>
  );
};

export const useObra = () => {
  const context = useContext(ObraContext);
  if (!context) throw new Error("useObra deve ser usado dentro de ObraProvider");
  return context;
};
