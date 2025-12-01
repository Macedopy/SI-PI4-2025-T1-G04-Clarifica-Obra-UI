import { useState, useEffect } from 'react';
import { useUserType } from './UserTypeContext';
import { getPhaseData, PhaseData } from '../services/phases.service';

export const usePhaseData = (phaseId: string) => {
  const { customerId } = useUserType();
  const [data, setData] = useState<PhaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const phaseData = await getPhaseData(phaseId, customerId);
        setData(phaseData);
      } catch (err) {
        setError('Erro ao carregar dados da fase.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [phaseId, customerId]);

  return { data, loading, error };
};
