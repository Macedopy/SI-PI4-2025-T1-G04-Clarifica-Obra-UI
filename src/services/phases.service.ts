//Responsável de User: Bruno Macedo

import { phaseEndpoints } from "../constants/phaseEndpoints";

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
  geral?: any;  // Adicionado para suportar a fase de Preparação
}

export async function getPhaseData(phaseId: string, customerId: string): Promise<PhaseData> {
  const endpoint = phaseEndpoints[phaseId];
  if (!endpoint) {
    throw new Error(`Endpoint not found for phase: ${phaseId}`);
  }
  const response = await fetch(`http://localhost:8080/${endpoint}/${customerId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data for phase: ${phaseId}`);
  }
  const data = await response.json();

  if (data.equipe && Array.isArray(data.equipe)) {
    data.teamMembers = data.equipe;
  }

  return data;
}
