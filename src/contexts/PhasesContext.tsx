// src/contexts/PhasesContext.tsx
//Responsável de User: Bruno Macedo
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUserType } from './UserTypeContext';
import { getPhaseData, getPhases, PhaseData } from '../services/phases.service';
import { ConstructionLoader } from '../components/general/ConstructionLoader';

export interface PhaseInfo {
  id: string;
  nome: string;
  icon?: any;
  components?: string[];
}

interface PhasesContextType {
  phases: PhaseInfo[];
  phasesData: Record<string, PhaseData>;
  loading: boolean;
  error: string | null;
  currentPhaseId: string | null;
  setCurrentPhaseId: React.Dispatch<React.SetStateAction<string | null>>;
  refreshPhases: () => Promise<void>;
}

const PhasesContext = createContext<PhasesContextType>({
  phases: [],
  phasesData: {},
  loading: false,
  error: null,
  currentPhaseId: null,
  setCurrentPhaseId: () => {},
  refreshPhases: async () => {},
});

export const PhasesProvider = ({ children }: { children: ReactNode }) => {
  const { customerId } = useUserType();
  const [phases, setPhases] = useState<PhaseInfo[]>([]);
  const [phasesData, setPhasesData] = useState<Record<string, PhaseData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);

  const loadAllPhases = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Carrega a lista de fases do backend
      const processedPhases = await getPhases(customerId);
      setPhases(processedPhases);

      // Se a lista estiver vazia, limpamos os dados e garantimos que o dashboard é exibido
      if (processedPhases.length === 0) {
        setPhasesData({});
        if (!currentPhaseId) setCurrentPhaseId("dashboard");
        setLoading(false);
        return;
      }

      // Carrega os dados de cada fase
      const data: Record<string, PhaseData> = {};
      for (const phaseInfo of processedPhases) {
        try {
          data[phaseInfo.id] = await getPhaseData(phaseInfo.id, customerId);
        } catch (e) {
          console.warn(`Could not load data for phase ${phaseInfo.id}`, e);
        }
      }
      setPhasesData(data);
      
      if (!currentPhaseId) {
        setCurrentPhaseId("dashboard");
      }
    } catch (err) {
      console.warn('Aviso: Não foi possível carregar as fases do servidor. Permitindo criação manual.', err);
      // Não definimos setError aqui para não travar a UI
      setPhases([]); 
      setPhasesData({});
      if (!currentPhaseId) setCurrentPhaseId("dashboard");
    } finally {
      setLoading(false);
    }
  }, [customerId, currentPhaseId]);

  useEffect(() => {
    loadAllPhases();
  }, [customerId]); // Recarrega apenas quando o customerId muda

  return (
    <PhasesContext.Provider value={{ 
      phases, 
      phasesData, 
      loading, 
      error, 
      currentPhaseId, 
      setCurrentPhaseId,
      refreshPhases: loadAllPhases
    }}>
      {loading && phases.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <ConstructionLoader />
        </div>
      ) : (
        children
      )}
    </PhasesContext.Provider>
  );
};

export const usePhasesData = () => useContext(PhasesContext);

export const usePhaseNavigation = () => {
  const { currentPhaseId, setCurrentPhaseId } = useContext(PhasesContext);
  if (currentPhaseId === undefined || setCurrentPhaseId === undefined) {
    throw new Error('usePhaseNavigation must be used within a PhasesProvider');
  }
  return { currentPhaseId, setCurrentPhaseId };
};
