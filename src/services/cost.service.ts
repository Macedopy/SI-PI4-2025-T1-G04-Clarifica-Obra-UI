//Responsável de User: Bruno Macedo

export interface MaterialPurchase {
  id: string;
  phaseId: string;
  materialId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  purchasedById: string;
  purchasedBy?: { firstName: string; lastName: string };
  supplier: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ToolPurchase {
  id: string;
  phaseId: string;
  toolId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  purchasedById: string;
  purchasedBy?: { firstName: string; lastName: string };
  supplier: string | null;
  notes: string | null;
  createdAt: string;
}

export interface MachineryRecord {
  id: string;
  phaseId: string;
  machineryId: string | null;
  isOwned: boolean;
  rentalType: string | null;
  rentalPrice: number;
  status: string;
  stopReason: string | null;
  stoppedById: string | null;
  stoppedAt: string | null;
  currentValue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  machineryId: string;
  phaseId: string;
  logDate: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  recordedById: string;
  notes: string | null;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  machineryId: string;
  phaseId: string;
  maintenanceDate: string;
  description: string;
  cost: number;
  performedById: string;
  notes: string | null;
  createdAt: string;
}

export interface WorkLog {
  id: string;
  teamMemberId: string;
  phaseId: string;
  workDate: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  addedById: string;
  addedBy?: { firstName: string; lastName: string };
  notes: string | null;
  createdAt: string;
}

export interface PhaseCost {
  phaseId: string;
  phaseName: string;
  total: number;
  materials: number;
  tools: number;
  machineryRental: number;
  fuel: number;
  maintenance: number;
  labor: number;
  machineryValue: number;
}

export interface CostDashboard {
  constructionId: string;
  constructionName: string;
  grandTotal: number;
  totalMaterials: number;
  totalTools: number;
  totalMachineryRental: number;
  totalFuel: number;
  totalMaintenance: number;
  totalLabor: number;
  totalMachineryValue: number;
  phaseCosts: PhaseCost[];
}

const API = 'http://localhost:8080/cost';

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Request failed');
  }
  return res.json();
}

// Materials
export const costApi = {
  createMaterial: (body: any) => request('/materials', { method: 'POST', body: JSON.stringify(body) }),
  listMaterials: (phaseId: string) => request(`/materials/phase/${phaseId}`),

  createTool: (body: any) => request('/tools', { method: 'POST', body: JSON.stringify(body) }),
  listTools: (phaseId: string) => request(`/tools/phase/${phaseId}`),

  createMachinery: (body: any) => request('/machinery', { method: 'POST', body: JSON.stringify(body) }),
  listMachinery: (phaseId: string) => request(`/machinery/phase/${phaseId}`),
  stopMachinery: (recordId: string, stoppedById: string, stopReason: string) =>
    request(`/machinery/${recordId}/stop?stoppedById=${encodeURIComponent(stoppedById)}&stopReason=${encodeURIComponent(stopReason || '')}`, { method: 'PUT' }),
  resumeMachinery: (recordId: string) =>
    request(`/machinery/${recordId}/resume`, { method: 'PUT' }),

  createFuelLog: (body: any) => request('/fuel', { method: 'POST', body: JSON.stringify(body) }),
  listFuelLogs: (phaseId: string) => request(`/fuel/phase/${phaseId}`),

  createMaintenance: (body: any) => request('/maintenance', { method: 'POST', body: JSON.stringify(body) }),
  listMaintenance: (phaseId: string) => request(`/maintenance/phase/${phaseId}`),

  createWorkLog: (body: any) => request('/work-logs', { method: 'POST', body: JSON.stringify(body) }),
  listWorkLogs: (phaseId: string) => request(`/work-logs/phase/${phaseId}`),

  getCostDashboard: (constructionId: string) =>
    fetch(`http://localhost:8080/cost/dashboard/${constructionId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load cost dashboard');
        return res.json();
      }),
};
