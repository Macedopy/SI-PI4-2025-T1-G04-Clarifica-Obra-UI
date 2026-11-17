//Responsável de User: Bruno Macedo

import { resolvePhaseIcon } from '../utils/phaseIcons';

export interface PhaseData {
  id?: string;
  name?: string;
  contractor?: string;
  materials?: any[];
  tools?: any[];
  machinery?: any[];
  teamMembers?: any[];
  services?: any[];
  photoRecords?: any[];
  geral?: any;
  components?: string[];
  [key: string]: any;
}

export async function getPhaseData(phaseId: string, customerId: string): Promise<PhaseData> {
  // Agora todas as fases são dinâmicas
  const response = await fetch(`http://localhost:8080/dynamic-phase/${phaseId}/${customerId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data for phase: ${phaseId}`);
  }
  const data = await response.json();

  if (data.equipe && Array.isArray(data.equipe)) {
    data.teamMembers = data.equipe;
  }

  return data;
}

export async function getPhases(customerId: string) {
  const response = await fetch(`http://localhost:8080/constructions/${customerId}/phases`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  
  // Se a resposta for o objeto de construção completo, extraímos as fases ativas
  if (data && typeof data === 'object' && data.activePhases && !Array.isArray(data)) {
    return Object.entries(data.activePhases)
      .filter(([_, isActive]) => isActive)
      .map(([key, _]) => ({
        id: key,
        nome: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
        iconId: null,
        icon: resolvePhaseIcon(null),
        components: ['equipe', 'servicos', 'maquinarios', 'materiais', 'ferramentas', 'fotos'] // Fallback de componentes
      }));
  }

  const list = Array.isArray(data) ? data : [];
  return list.map((phase: any) => ({
    ...phase,
    iconId: phase?.icon ?? null,
    icon: resolvePhaseIcon(phase?.icon),
  }));
}

export async function deletePhase(phaseId: string, customerId: string) {
  const response = await fetch(`http://localhost:8080/phases/${phaseId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId })
  });
  return response.ok;
}
