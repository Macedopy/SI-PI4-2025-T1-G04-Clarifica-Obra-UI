// src/contexts/PhasesContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserType } from './UserTypeContext';
import { getPhaseData, PhaseData } from '../services/phases.service';
import { phaseEndpoints } from '../constants/phaseEndpoints';

interface PhasesContextType {
  phasesData: Record<string, PhaseData>;
  loading: boolean;
  error: string | null;
  currentPhaseId: string | null;
  setCurrentPhaseId: React.Dispatch<React.SetStateAction<string | null>>;
}

const PhasesContext = createContext<PhasesContextType>({
  phasesData: {},
  loading: false,
  error: null,
  currentPhaseId: null,
  setCurrentPhaseId: () => {},
});

export const PhasesProvider = ({ children }: { children: ReactNode }) => {
  const { customerId } = useUserType();
  const [phasesData, setPhasesData] = useState<Record<string, PhaseData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);

  useEffect(() => {
    if (customerId) {
      const loadAllPhases = async () => {
        setLoading(true);
        setError(null);
        try {
          const phases = Object.keys(phaseEndpoints);
          const data: Record<string, PhaseData> = {};
          for (const phaseId of phases) {
            data[phaseId] = await getPhaseData(phaseId, customerId);
          }
          setPhasesData(data);
        } catch (err) {
          console.error('Erro ao carregar fases:', err);
          setError('Falha ao carregar dados das fases. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      };
      loadAllPhases();
    }
  }, [customerId]);

  return (
    <PhasesContext.Provider value={{ phasesData, loading, error, currentPhaseId, setCurrentPhaseId }}>
      {children}
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
