//Responsável de User: Bruno Macedo
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, ToolCase, Truck, Fuel, Wrench, Users, 
  PieChart, BarChart, LineChart, Activity, Clock, 
  Plus, TrendingUp, AlertTriangle, CheckCircle, 
  Settings, DollarSign, Building 
} from "lucide-react";
import { costApi } from '../services/cost.service';

const roleLabels: Record<string, string> = {
  CLIENT: 'Cliente',
  MASTER_BUILDER: 'Mestre de Obras',
  OWNER: 'Proprietário',
};

const tabLabels: Record<string, string> = {
  materials: 'Materiais',
  tools: 'Ferramentas',
  machinery: 'Maquinário',
  fuel: 'Combustível',
  maintenance: 'Manutenção',
  labor: 'Mão de Obra',
  dashboard: 'Dashboard Financeiro',
};

const tabIcons: Record<string, any> = {
  materials: ShoppingCart,
  tools: ToolCase,
  machinery: Truck,
  fuel: Fuel,
  maintenance: Wrench,
  labor: Users,
  dashboard: PieChart,
};

type Tab = keyof typeof tabLabels;

const formatBRL = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------- histórico

type ColumnType = 'text' | 'currency' | 'date' | 'datetime' | 'bool' | 'liters' | 'hours';

interface HistoryColumn {
  key: string;
  label: string;
  type?: ColumnType;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  maintenance: 'Em manutenção',
  stopped: 'Parado',
};

const RENTAL_TYPE_LABELS: Record<string, string> = {
  none: '—',
  per_hour: 'Por hora',
  per_day: 'Por dia',
  per_month: 'Por mês',
  per_year: 'Por ano',
};

/** Formata datas vindas do backend (ISO) para dd/mm/aaaa — sem alterar o formato da API. */
const formatDate = (value: any, withTime = false): string => {
  if (!value) return '—';
  const raw = String(value);
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const formatted = date.toLocaleDateString('pt-BR');
  if (!withTime) return formatted;
  return `${formatted} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const HISTORY_COLUMNS: Record<string, HistoryColumn[]> = {
  materials: [
    { key: 'purchaseDate', label: 'Data', type: 'date' },
    { key: 'quantity', label: 'Qtd.' },
    { key: 'unitPrice', label: 'Preço unitário', type: 'currency' },
    { key: 'totalPrice', label: 'Total', type: 'currency' },
    { key: 'purchasedByName', label: 'Comprado por' },
    { key: 'supplier', label: 'Fornecedor' },
    { key: 'notes', label: 'Observações' },
  ],
  tools: [
    { key: 'purchaseDate', label: 'Data', type: 'date' },
    { key: 'quantity', label: 'Qtd.' },
    { key: 'unitPrice', label: 'Preço unitário', type: 'currency' },
    { key: 'totalPrice', label: 'Total', type: 'currency' },
    { key: 'purchasedByName', label: 'Comprado por' },
    { key: 'supplier', label: 'Fornecedor' },
    { key: 'notes', label: 'Observações' },
  ],
  machinery: [
    { key: 'createdAt', label: 'Registrado em', type: 'datetime' },
    { key: 'isOwned', label: 'Propriedade', type: 'bool' },
    { key: 'rentalType', label: 'Tipo de aluguel' },
    { key: 'rentalPrice', label: 'Aluguel', type: 'currency' },
    { key: 'currentValue', label: 'Valor atual', type: 'currency' },
    { key: 'status', label: 'Status' },
    { key: 'stoppedAt', label: 'Parado em', type: 'datetime' },
    { key: 'stoppedByName', label: 'Parado por' },
    { key: 'stopReason', label: 'Motivo da parada' },
  ],
  fuel: [
    { key: 'logDate', label: 'Data', type: 'date' },
    { key: 'liters', label: 'Litros', type: 'liters' },
    { key: 'pricePerLiter', label: 'Preço por litro', type: 'currency' },
    { key: 'totalCost', label: 'Total', type: 'currency' },
    { key: 'recordedByName', label: 'Registrado por' },
    { key: 'notes', label: 'Observações' },
  ],
  maintenance: [
    { key: 'maintenanceDate', label: 'Data', type: 'date' },
    { key: 'description', label: 'Descrição' },
    { key: 'cost', label: 'Custo', type: 'currency' },
    { key: 'performedByName', label: 'Executado por' },
    { key: 'notes', label: 'Observações' },
  ],
  labor: [
    { key: 'workDate', label: 'Data', type: 'date' },
    { key: 'teamMemberName', label: 'Colaborador' },
    { key: 'hoursWorked', label: 'Horas', type: 'hours' },
    { key: 'hourlyRate', label: 'Valor por hora', type: 'currency' },
    { key: 'totalCost', label: 'Total', type: 'currency' },
    { key: 'addedByName', label: 'Registrado por' },
    { key: 'notes', label: 'Observações' },
  ],
  dashboard: [],
};

const renderHistoryCell = (value: any, column: HistoryColumn): string => {
  if (value === null || value === undefined || value === '') return '—';
  switch (column.type) {
    case 'currency':
      return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'date':
      return formatDate(value);
    case 'datetime':
      return formatDate(value, true);
    case 'bool':
      return value ? 'Próprio' : 'Alugado';
    case 'liters':
      return `${Number(value).toLocaleString('pt-BR')} L`;
    case 'hours':
      return `${Number(value).toLocaleString('pt-BR')} h`;
    default:
      break;
  }
  if (column.key === 'status') return STATUS_LABELS[String(value)] || String(value);
  if (column.key === 'rentalType') return RENTAL_TYPE_LABELS[String(value)] || String(value);
  return String(value);
};

interface CostOverviewCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle?: string;
}

const CostOverviewCard: React.FC<CostOverviewCardProps> = ({
  title, value, icon: Icon, color, subtitle
}) => (
  <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}-100`}>
        <Icon className={`w-5 h-5 ${color}-600`} />
      </div>
      <TrendingUp className="w-4 h-4 text-gray-300" />
    </div>
    <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

interface PurchaseFormProps {
  tab: Tab;
  phaseId: string;
  userId: string;
  onSuccess: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ tab, phaseId, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  // Machinery specific
  const [isOwned, setIsOwned] = useState(true);
  const [rentalType, setRentalType] = useState('none');
  const [rentalPrice, setRentalPrice] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  // Fuel specific
  const [liters, setLiters] = useState(0);
  const [pricePerLiter, setPricePerLiter] = useState(0);
  // Maintenance specific
  const [description, setDescription] = useState('');
  // Labor specific
  const [teamMemberId, setTeamMemberId] = useState('');
  const [hoursWorked, setHoursWorked] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [workDate, setWorkDate] = useState('');
  const [status, setStatus] = useState('active');
  const [stopReason, setStopReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const date = purchaseDate || workDate || today;

      switch (tab) {
        case 'materials':
          await costApi.createMaterial({
            phaseId,
            materialId: itemId || null,
            quantity,
            unitPrice,
            purchasedById: userId,
            supplier,
            notes,
          });
          break;
        case 'tools':
          await costApi.createTool({
            phaseId,
            toolId: itemId || null,
            quantity: Math.round(quantity),
            unitPrice,
            purchasedById: userId,
            supplier,
            notes,
          });
          break;
        case 'machinery':
          await costApi.createMachinery({
            phaseId,
            machineryId: itemId || null,
            isOwned,
            rentalType,
            rentalPrice,
            currentValue,
          });
          break;
        case 'fuel':
          await costApi.createFuelLog({
            machineryId: itemId || null,
            phaseId,
            logDate: date,
            liters,
            pricePerLiter,
            recordedById: userId,
            notes,
          });
          break;
        case 'maintenance':
          await costApi.createMaintenance({
            machineryId: itemId || null,
            phaseId,
            maintenanceDate: date,
            description,
            cost: unitPrice,
            performedById: userId,
            notes,
          });
          break;
        case 'labor':
          await costApi.createWorkLog({
            teamMemberId,
            phaseId,
            workDate: date,
            hoursWorked,
            hourlyRate,
            addedById: userId,
            notes,
          });
          break;
      }

      onSuccess();
      // Reset form
      setItemId(''); setQuantity(1); setUnitPrice(0); setSupplier(''); setNotes('');
      setIsOwned(true); setRentalType('none'); setRentalPrice(0); setCurrentValue(0);
      setLiters(0); setPricePerLiter(0); setDescription('');
      setTeamMemberId(''); setHoursWorked(0); setHourlyRate(0); setWorkDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <Plus className="w-4 h-4 mr-2 text-blue-600" />
        Nova Entrada - {tabLabels[tab]}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item / ID</label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="ID do material/ferramenta/maquinário"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={purchaseDate || workDate || ''}
              onChange={(e) => {
                if (tab === 'labor') setWorkDate(e.target.value);
                else setPurchaseDate(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Nome do fornecedor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Tab-specific fields */}
        {tab === 'machinery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isOwned}
                onChange={(e) => setIsOwned(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Máquina própria da construtora</label>
            </div>
            {!isOwned && (
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Aluguel</label>
                    <select
                      value={rentalType}
                      onChange={(e) => setRentalType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="per_hour">Por Hora</option>
                      <option value="per_day">Por Dia</option>
                      <option value="per_month">Por Mês</option>
                      <option value="per_year">Por Ano</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço do Aluguel (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={rentalPrice}
                      onChange={(e) => setRentalPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Atual da Máquina (R$)</label>
              <input
                type="number"
                step="0.01"
                value={currentValue}
                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {tab === 'fuel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Litros</label>
              <input
                type="number"
                step="0.01"
                value={liters}
                onChange={(e) => setLiters(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Litro (R$)</label>
              <input
                type="number"
                step="0.01"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {tab === 'maintenance' && (
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Manutenção</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="O que foi feito na manutenção?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {tab === 'labor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Membro da Equipe</label>
              <input
                type="text"
                value={teamMemberId}
                onChange={(e) => setTeamMemberId(e.target.value)}
                placeholder="ID do trabalhador"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Trabalhadas</label>
              <input
                type="number"
                step="0.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Hora (R$)</label>
              <input
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Salvando...' : 'Registrar Entrada'}
        </button>
      </form>
    </div>
  );
};

interface HistoryListProps {
  items: any[];
  columns: HistoryColumn[];
  emptyMessage: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ items, columns, emptyMessage }) => {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2 text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={item.id || idx} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-2 text-sm text-gray-700 ${
                    column.key === 'notes' || column.key === 'description'
                      ? 'max-w-[260px] truncate'
                      : 'whitespace-nowrap'
                  }`}
                  title={
                    column.key === 'notes' || column.key === 'description'
                      ? String(item[column.key] ?? '')
                      : undefined
                  }
                >
                  {renderHistoryCell(item[column.key], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface CostControlProps {
  constructionId: string;
  userId: string;
  userRole: string;
  /** Quando informado, trava o controle em uma fase. No Dashboard Geral fica vazio. */
  phaseId?: string;
  /**
   * dashboard: visão financeira (somente leitura) — usada no Dashboard Geral.
   * entry: lançamento de custos — usado dentro de cada fase.
   */
  mode?: 'dashboard' | 'entry';
}

export const CostControl: React.FC<CostControlProps> = ({
  constructionId,
  userId,
  userRole,
  phaseId,
  mode = 'dashboard',
}) => {
  const isEntry = mode === 'entry';
  const [activeTab, setActiveTab] = useState<Tab>(isEntry ? 'materials' : 'dashboard');
  const [costData, setCostData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fases da obra (para o seletor quando o controle está no Dashboard Geral)
  const [phaseOptions, setPhaseOptions] = useState<{ id: string; nome: string }[]>([]);
  // '' = Total (todas as fases)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(phaseId || '');
  const currentPhaseId = phaseId || selectedPhaseId;

  // Individual lists
  const [materials, setMaterials] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [machinery, setMachinery] = useState<any[]>([]);
  const [fuels, setFuels] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [labor, setLabor] = useState<any[]>([]);

  // Carrega as fases da obra quando o controle é exibido no Dashboard Geral
  useEffect(() => {
    if (phaseId || !constructionId) return;
    let cancelled = false;
    fetch(`http://localhost:8080/constructions/${constructionId}/phases`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: any[]) => {
        if (cancelled) return;
        const options = (list || []).map((p: any) => ({ id: p.id, nome: p.nome || p.name }));
        setPhaseOptions(options);
      })
      .catch(() => {
        if (!cancelled) setPhaseOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [phaseId, constructionId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Visão financeira (somente no Dashboard Geral)
      if (!isEntry && constructionId) {
        const dashboard = await costApi.getCostDashboard(constructionId);
        setCostData(dashboard);
      }

      // '' (Total) carrega o histórico de todas as fases; senão, só a fase selecionada
      const targets = currentPhaseId ? [currentPhaseId] : phaseOptions.map((p) => p.id);

      if (targets.length === 0) {
        setMaterials([]);
        setTools([]);
        setMachinery([]);
        setFuels([]);
        setMaintenance([]);
        setLabor([]);
        return;
      }

      const results = await Promise.all(
        targets.map(async (phaseIdToLoad) => {
          const [mats, tls, mach, furl, maint, lab] = await Promise.all([
            costApi.listMaterials(phaseIdToLoad),
            costApi.listTools(phaseIdToLoad),
            costApi.listMachinery(phaseIdToLoad),
            costApi.listFuelLogs(phaseIdToLoad),
            costApi.listMaintenance(phaseIdToLoad),
            costApi.listWorkLogs(phaseIdToLoad),
          ]);
          return {
            mats: mats || [],
            tls: tls || [],
            mach: mach || [],
            furl: furl || [],
            maint: maint || [],
            lab: lab || [],
          };
        })
      );

      setMaterials(results.flatMap((r) => r.mats));
      setTools(results.flatMap((r) => r.tls));
      setMachinery(results.flatMap((r) => r.mach));
      setFuels(results.flatMap((r) => r.furl));
      setMaintenance(results.flatMap((r) => r.maint));
      setLabor(results.flatMap((r) => r.lab));
    } catch (err) {
      console.error('Erro ao carregar dados de custo:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPhaseId, constructionId, phaseOptions, isEntry]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const canEdit = userRole.toUpperCase() === 'MASTER_BUILDER' || userRole.toUpperCase() === 'OWNER';

  const selectedPhaseCost = !isEntry && currentPhaseId && costData?.phaseCosts
    ? costData.phaseCosts.find((pc: any) => pc.phaseId === currentPhaseId)
    : null;

  const overview = selectedPhaseCost
    ? {
        total: selectedPhaseCost.total,
        materials: selectedPhaseCost.materials,
        tools: selectedPhaseCost.tools,
        machineryRental: selectedPhaseCost.machineryRental,
        fuel: selectedPhaseCost.fuel,
        maintenance: selectedPhaseCost.maintenance,
        labor: selectedPhaseCost.labor,
      }
    : costData
    ? {
        total: costData.grandTotal,
        materials: costData.totalMaterials,
        tools: costData.totalTools,
        machineryRental: costData.totalMachineryRental,
        fuel: costData.totalFuel,
        maintenance: costData.totalMaintenance,
        labor: costData.totalLabor,
      }
    : null;

  const scopeLabel = selectedPhaseCost ? selectedPhaseCost.phaseName : 'Todas as fases';
  const phaseNameById = new Map(phaseOptions.map((p) => [p.id, p.nome]));
  const withPhaseName = (items: any[]) =>
    items.map((item) => ({ ...item, phaseName: phaseNameById.get(item.phaseId) || '—' }));
  const withPhaseColumn = (columns: HistoryColumn[]) =>
    currentPhaseId ? columns : [{ key: 'phaseName', label: 'Fase' }, ...columns];
  const historyItems = (items: any[]) => (currentPhaseId ? items : withPhaseName(items));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            {isEntry ? 'Registrar Custos da Fase' : 'Controle de Custos da Obra'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEntry
              ? 'Lance compras, maquinário, combustível, manutenção e mão de obra desta fase.'
              : 'Acompanhe os gastos da obra e filtre por fase.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!phaseId && phaseOptions.length > 0 && (
            <select
              value={selectedPhaseId}
              onChange={(e) => setSelectedPhaseId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              aria-label="Selecionar fase"
            >
              <option value="">Total (todas as fases)</option>
              {phaseOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          )}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            userRole.toUpperCase() === 'OWNER' ? 'bg-green-100 text-green-700' :
            userRole.toUpperCase() === 'MASTER_BUILDER' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {roleLabels[userRole] || userRole}
          </span>
        </div>
      </div>

      {/* Cost Overview Cards */}
      {!isEntry && costData && overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CostOverviewCard
            title="Custo Total da Obra"
            value={costData.grandTotal}
            icon={DollarSign}
            color="blue"
            subtitle="Somatório de todas as fases"
          />
          {selectedPhaseCost && (
            <CostOverviewCard
              title="Custo da Fase"
              value={selectedPhaseCost.total}
              icon={Building}
              color="blue"
              subtitle={selectedPhaseCost.phaseName}
            />
          )}
          <CostOverviewCard
            title="Materiais"
            value={overview.materials}
            icon={ShoppingCart}
            color="green"
            subtitle={scopeLabel}
          />
          <CostOverviewCard
            title="Ferramentas"
            value={overview.tools}
            icon={ToolCase}
            color="indigo"
            subtitle={scopeLabel}
          />
          <CostOverviewCard
            title="Maquinário (Aluguel)"
            value={overview.machineryRental}
            icon={Truck}
            color="orange"
            subtitle={scopeLabel}
          />
          <CostOverviewCard
            title="Combustível"
            value={overview.fuel}
            icon={Fuel}
            color="yellow"
            subtitle={scopeLabel}
          />
          <CostOverviewCard
            title="Manutenção"
            value={overview.maintenance}
            icon={Wrench}
            color="red"
            subtitle={scopeLabel}
          />
          <CostOverviewCard
            title="Mão de Obra"
            value={overview.labor}
            icon={Users}
            color="purple"
            subtitle={scopeLabel}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
        {(Object.keys(tabLabels) as Tab[])
          .filter((tab) => !isEntry || tab !== 'dashboard')
          .map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white rounded-lg shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 rounded-lg'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <PieChart className="w-4 h-4 mr-2 text-blue-600" />
              {selectedPhaseCost ? 'Resumo Financeiro da Fase' : 'Resumo Financeiro por Fase'}
            </h3>
            {costData ? (
              <>
                <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
                  <span className="text-sm font-medium text-blue-900">Gasto total da obra</span>
                  <span className="text-lg font-bold text-blue-900">R$ {formatBRL(costData.grandTotal)}</span>
                </div>
                <div className="space-y-3">
                  {(selectedPhaseCost ? [selectedPhaseCost] : costData.phaseCosts).map((pc: any) => (
                    <div key={pc.phaseId || pc.phaseName} className="p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{pc.phaseName}</span>
                        <span className="font-bold text-gray-900">R$ {formatBRL(pc.total)}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 block">Materiais</span>
                          <span className="text-green-600 font-medium">R$ {formatBRL(pc.materials)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Ferramentas</span>
                          <span className="text-indigo-600 font-medium">R$ {formatBRL(pc.tools)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Máq. Aluguel</span>
                          <span className="text-orange-600 font-medium">R$ {formatBRL(pc.machineryRental)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Combustível</span>
                          <span className="text-yellow-600 font-medium">R$ {formatBRL(pc.fuel)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Manutenção</span>
                          <span className="text-red-600 font-medium">R$ {formatBRL(pc.maintenance)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Mão de Obra</span>
                          <span className="text-purple-600 font-medium">R$ {formatBRL(pc.labor)}</span>
                        </div>
                      </div>
                      {!selectedPhaseCost && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-blue-600"
                            style={{ width: `${costData.grandTotal > 0 ? Math.min((pc.total / costData.grandTotal) * 100, 100) : 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-gray-400">Carregando dados financeiros...</div>
            )}
          </div>
        )}

        {activeTab !== 'dashboard' && !currentPhaseId && phaseOptions.length === 0 && (
          <div className="p-6 text-center text-gray-500 py-10">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Nenhuma fase encontrada para esta obra.</p>
          </div>
        )}

        {isEntry && activeTab !== 'dashboard' && currentPhaseId && canEdit && (
          <div className="p-6">
            <PurchaseForm tab={activeTab} phaseId={currentPhaseId} userId={userId} onSuccess={loadAll} />
          </div>
        )}

        {isEntry && activeTab !== 'dashboard' && !canEdit && (
          <div className="p-6 text-center text-gray-500 py-10">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Somente leitura: apenas Mestre de Obras e Proprietário podem adicionar registros de custo.</p>
          </div>
        )}

        {!isEntry && canEdit && activeTab !== 'dashboard' && (
          <p className="px-6 pt-4 text-xs text-gray-400">
            Os lançamentos de custo são feitos na tela de cada fase.
          </p>
        )}

        {activeTab !== 'dashboard' && (currentPhaseId || phaseOptions.length > 0) && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {isEntry
                ? 'Histórico da Fase'
                : selectedPhaseCost
                  ? `Histórico — ${selectedPhaseCost.phaseName}`
                  : 'Histórico — todas as fases'}
            </h3>
            {activeTab === 'materials' && (
              <HistoryList
                items={historyItems(materials)}
                columns={withPhaseColumn(HISTORY_COLUMNS.materials)}
                emptyMessage="Nenhum material registrado."
              />
            )}
            {activeTab === 'tools' && (
              <HistoryList
                items={historyItems(tools)}
                columns={withPhaseColumn(HISTORY_COLUMNS.tools)}
                emptyMessage="Nenhuma ferramenta registrada."
              />
            )}
            {activeTab === 'machinery' && (
              <HistoryList
                items={historyItems(machinery)}
                columns={withPhaseColumn(HISTORY_COLUMNS.machinery)}
                emptyMessage="Nenhum maquinário registrado."
              />
            )}
            {activeTab === 'fuel' && (
              <HistoryList
                items={historyItems(fuels)}
                columns={withPhaseColumn(HISTORY_COLUMNS.fuel)}
                emptyMessage="Nenhum registro de combustível."
              />
            )}
            {activeTab === 'maintenance' && (
              <HistoryList
                items={historyItems(maintenance)}
                columns={withPhaseColumn(HISTORY_COLUMNS.maintenance)}
                emptyMessage="Nenhuma manutenção registrada."
              />
            )}
            {activeTab === 'labor' && (
              <HistoryList
                items={historyItems(labor)}
                columns={withPhaseColumn(HISTORY_COLUMNS.labor)}
                emptyMessage="Nenhum registro de mão de obra."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
