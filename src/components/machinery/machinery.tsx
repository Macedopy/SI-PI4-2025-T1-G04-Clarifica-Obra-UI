//Responsável: Bruno Macedo
import React, { useState, useEffect } from 'react';
import { Truck, X, Plus, Edit3, Save, Fuel, Clock, Wrench } from 'lucide-react';

interface BackendMachineryItem {
  id: string;
  phaseId: null;
  name: string;
  category: string;
  hoursWorked: number;
  fuelUsed: number;
  fuelUnit: string;
  totalQuantity: number;
  inOperation: number;
  inMaintenance: number;
  condition: string;
  notes: string;
}

interface MachineryItem {
  id: string;
  name: string;
  category: string;
  hoursWorked: number;
  fuelUsed: number;
  fuelUnit: 'LITERS' | 'HOURS';
  totalQuantity: number;
  inOperation: number;
  inMaintenance: number;
  condition: 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE';
  notes: string;
}

const mapFuelUnit = (backendUnit: string): 'LITERS' | 'HOURS' => {
  return backendUnit.toUpperCase() === 'LITROS' ? 'LITERS' : 'HOURS';
};

const mapCondition = (backendCondition: string): 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE' => {
  const conditionMap: Record<string, 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE'> = {
    'otima': 'EXCELLENT',
    'boa': 'GOOD',
    'ruim': 'POOR',
    'indisponivel': 'UNAVAILABLE',
  };
  return conditionMap[backendCondition.toLowerCase()] || 'GOOD';
};

const reverseMapFuelUnit = (frontendUnit: 'LITERS' | 'HOURS'): string => {
  return frontendUnit.toLowerCase() === 'liters' ? 'litros' : 'horas';
};

const reverseMapCondition = (frontendCondition: 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE'): string => {
  const reverseMap: Record<'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE', string> = {
    'EXCELLENT': 'otima',
    'GOOD': 'boa',
    'POOR': 'ruim',
    'UNAVAILABLE': 'indisponivel',
  };
  return reverseMap[frontendCondition] || 'boa';
};

interface MaquinariosUtilizadosProps {
  isReadOnly?: boolean;
  faseId: string;
  initialData?: BackendMachineryItem[];
}

export const MaquinariosUtilizados: React.FC<MaquinariosUtilizadosProps> = ({
  isReadOnly = false,
  faseId,
  initialData
}) => {
  const STORAGE_KEY = `maquinarios-fase-${faseId}`;
  const [maquinarios, setMaquinarios] = useState<MachineryItem[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTemp, setEditTemp] = useState<Omit<MachineryItem, 'id'>>({
    name: '',
    category: 'Pesado',
    hoursWorked: 0,
    fuelUsed: 0,
    fuelUnit: 'LITERS',
    totalQuantity: 1,
    inOperation: 0,
    inMaintenance: 0,
    condition: 'GOOD',
    notes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as MachineryItem[];
      setMaquinarios(parsed);
    }
    else if (initialData && initialData.length > 0) {
     const transformedData = initialData.map(machine => ({
        id: machine.id,
        name: machine.name,
        category: machine.category,
        hoursWorked: machine.hoursWorked,
        fuelUsed: machine.fuelUsed,
        fuelUnit: mapFuelUnit(machine.fuelUnit),
        totalQuantity: machine.totalQuantity,
        inOperation: machine.inOperation,
        inMaintenance: machine.inMaintenance,
        condition: mapCondition(machine.condition),
        notes: machine.notes || ''
      }));
      setMaquinarios(transformedData);
    } 
    }, [faseId, initialData]);

  useEffect(() => {
    if (maquinarios.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maquinarios));
    }
  }, [maquinarios]);

  const adicionarMaquinario = () => {
    const novo: MachineryItem = {
      id: Date.now().toString(),
      name: 'Nova Máquina',
      category: 'Pesado',
      hoursWorked: 0,
      fuelUsed: 0,
      fuelUnit: 'LITERS',
      totalQuantity: 1,
      inOperation: 0,
      inMaintenance: 0,
      condition: 'GOOD',
      notes: ''
    };
    setMaquinarios(prev => [...prev, novo]);
  };

  const removerMaquinario = (id: string) => {
    setMaquinarios(prev => prev.filter(m => m.id !== id));
    setEditandoId(null);
  };

  const atualizarMaquinario = (id: string, updates: Partial<MachineryItem>) => {
    setMaquinarios(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, ...updates }
          : m
      )
    );
  };

  const abrirEdicao = (maquinario: MachineryItem) => {
    setEditandoId(maquinario.id);
    setEditTemp({
      name: maquinario.name,
      category: maquinario.category,
      hoursWorked: maquinario.hoursWorked,
      fuelUsed: maquinario.fuelUsed,
      fuelUnit: maquinario.fuelUnit,
      totalQuantity: maquinario.totalQuantity,
      inOperation: maquinario.inOperation,
      inMaintenance: maquinario.inMaintenance,
      condition: maquinario.condition,
      notes: maquinario.notes
    });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    atualizarMaquinario(editandoId, editTemp);
    setEditandoId(null);
  };

  const operar = () => {
    if (editTemp.inOperation >= editTemp.totalQuantity - editTemp.inMaintenance) return;
    setEditTemp(prev => ({
      ...prev,
      inOperation: prev.inOperation + 1,
      hoursWorked: prev.hoursWorked + 1
    }));
  };

  const parar = () => {
    if (editTemp.inOperation <= 0) return;
    setEditTemp(prev => ({ ...prev, inOperation: prev.inOperation - 1 }));
  };

  const enviarManutencao = () => {
    if (editTemp.inMaintenance >= editTemp.totalQuantity - editTemp.inOperation) return;
    setEditTemp(prev => ({ ...prev, inMaintenance: prev.inMaintenance + 1 }));
  };

  const retornarManutencao = () => {
    if (editTemp.inMaintenance <= 0) return;
    setEditTemp(prev => ({ ...prev, inMaintenance: prev.inMaintenance - 1 }));
  };

  const getDisponivel = (item: Pick<MachineryItem, 'totalQuantity' | 'inOperation' | 'inMaintenance'>) => {
    return item.totalQuantity - item.inOperation - item.inMaintenance;
  };

  const getConditionLabel = (condition: 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE') => {
    switch (condition) {
      case 'EXCELLENT': return 'Ótima';
      case 'GOOD': return 'Boa';
      case 'POOR': return 'Ruim';
      case 'UNAVAILABLE': return 'Indisponível';
      default: return condition;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Truck className="text-teal-600" size={28} />
          <h3 className="text-xl font-bold">Maquinários Utilizados</h3>
        </div>
        {!isReadOnly && (
          <button
            onClick={adicionarMaquinario}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow"
          >
            <Plus size={18} />
            Adicionar Máquina
          </button>
        )}
      </div>

      {maquinarios.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Truck size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum maquinário adicionado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {maquinarios.map(maquinario => (
            <div
              key={maquinario.id}
              className={`border rounded-xl p-5 shadow-sm transition-all relative ${editandoId === maquinario.id
                ? 'ring-2 ring-teal-500 bg-teal-50'
                : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow'
              }`}
            >
              {!isReadOnly && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {editandoId !== maquinario.id ? (
                    <button
                      onClick={() => abrirEdicao(maquinario)}
                      className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow"
                    >
                      <Edit3 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={salvarEdicao}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
                    >
                      <Save size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => removerMaquinario(maquinario.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {editandoId === maquinario.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={editTemp.name}
                        onChange={e => setEditTemp({ ...editTemp, name: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="Ex: Retroescavadeira JCB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <select
                        value={editTemp.category}
                        onChange={e => setEditTemp({ ...editTemp, category: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option>Pesado</option>
                        <option>Leve</option>
                        <option>Elétrico</option>
                        <option>Compactador</option>
                        <option>Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantidade Total</label>
                      <input
                        type="number"
                        min="1"
                        value={editTemp.totalQuantity}
                        onChange={e => setEditTemp({ ...editTemp, totalQuantity: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Condição</label>
                      <select
                        value={editTemp.condition}
                        onChange={e =>
                          setEditTemp({
                            ...editTemp,
                            condition: e.target.value as 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE'
                          })
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="EXCELLENT">Ótima</option>
                        <option value="GOOD">Boa</option>
                        <option value="POOR">Ruim</option>
                        <option value="UNAVAILABLE">Indisponível</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                    <div className="text-center">
                      <Clock className="mx-auto text-blue-600 mb-1" size={20} />
                      <p className="text-xs text-gray-600">Horas</p>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editTemp.hoursWorked}
                        onChange={e => setEditTemp({ ...editTemp, hoursWorked: Number(e.target.value) })}
                        className="w-full text-center text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div className="text-center">
                      <Fuel className="mx-auto text-orange-600 mb-1" size={20} />
                      <p className="text-xs text-gray-600">Combustível</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={editTemp.fuelUsed}
                          onChange={e => setEditTemp({ ...editTemp, fuelUsed: Number(e.target.value) })}
                          className="w-20 text-center text-xl font-bold text-orange-600 bg-transparent border-b-2 border-orange-300 focus:border-orange-600 outline-none"
                        />
                        <select
                          value={editTemp.fuelUnit}
                          onChange={e => setEditTemp({ ...editTemp, fuelUnit: e.target.value as 'LITERS' | 'HOURS' })}
                          className="text-xs p-1 border rounded bg-white"
                        >
                          <option value="LITERS">L</option>
                          <option value="HOURS">H</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Em Operação</p>
                      <p className="text-2xl font-bold text-purple-600">{editTemp.inOperation}</p>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={operar}
                          disabled={editTemp.inOperation >= editTemp.totalQuantity - editTemp.inMaintenance}
                          className="flex-1 bg-purple-500 text-white text-xs py-1 rounded hover:bg-purple-600 disabled:opacity-50"
                        >
                          Ligar
                        </button>
                        <button
                          onClick={parar}
                          disabled={editTemp.inOperation <= 0}
                          className="flex-1 bg-gray-500 text-white text-xs py-1 rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                          Parar
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Manutenção</p>
                      <p className="text-2xl font-bold text-orange-600">{editTemp.inMaintenance}</p>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={enviarManutencao}
                          disabled={editTemp.inMaintenance >= editTemp.totalQuantity - editTemp.inOperation}
                          className="flex-1 bg-orange-500 text-white text-xs py-1 rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                          Enviar
                        </button>
                        <button
                          onClick={retornarManutencao}
                          disabled={editTemp.inMaintenance <= 0}
                          className="flex-1 bg-teal-500 text-white text-xs py-1 rounded hover:bg-teal-600 disabled:opacity-50"
                        >
                          Retornar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t">
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Disponível</p>
                      <p className="font-bold text-green-700">{getDisponivel(editTemp)}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-bold text-blue-700">{editTemp.totalQuantity}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <Wrench className="mx-auto text-gray-600 mb-1" size={16} />
                      <p className="text-xs text-gray-600">Condição</p>
                      <p className="font-bold text-gray-700">{getConditionLabel(editTemp.condition)}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-medium mb-1">Observação</label>
                    <textarea
                      value={editTemp.notes}
                      onChange={e => setEditTemp({ ...editTemp, notes: e.target.value })}
                      className="w-full p-2 border rounded"
                      rows={2}
                      placeholder="Ex: Filtro de ar sujo"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{maquinario.name}</p>
                      <p className="text-sm text-gray-600">{maquinario.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Clock className="text-blue-600" size={16} />
                        <span className="text-sm font-medium">{maquinario.hoursWorked}h</span>
                      </div>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <Fuel className="text-orange-600" size={16} />
                        <span className="text-sm font-medium">
                          {maquinario.fuelUsed} {maquinario.fuelUnit === 'LITERS' ? 'L' : 'h'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Operação</p>
                      <p className="font-bold text-purple-700">{maquinario.inOperation}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Disponível</p>
                      <p className="font-bold text-green-700">{getDisponivel(maquinario)}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Manutenção</p>
                      <p className="font-bold text-orange-700">{maquinario.inMaintenance}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-bold text-gray-700">{maquinario.totalQuantity}</p>
                    </div>
                  </div>
                  {maquinario.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{maquinario.notes}"</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
