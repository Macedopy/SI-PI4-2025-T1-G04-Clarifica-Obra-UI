//Responsável: Bruno Macedo
import React, { useState, useEffect } from 'react';
import { Hammer, X, Plus, Edit3, Save, Wrench, CheckCircle } from 'lucide-react';

interface BackendToolItem {
  id: string;
  phaseId: null;
  name: string;
  category: string;
  totalQuantity: number;
  inUse: number;
  inMaintenance: number;
  condition: string;
  notes: string;
}

interface ToolItem {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  inUse: number;
  inMaintenance: number;
  condition: 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE';
  notes: string;
}

const mapCondition = (backendCondition: string): 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE' => {
  const conditionMap: Record<string, 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE'> = {
    'otima': 'EXCELLENT',
    'boa': 'GOOD',
    'ruim': 'POOR',
    'indisponivel': 'UNAVAILABLE',
  };
  return conditionMap[backendCondition.toLowerCase()] || 'GOOD';
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

interface FerramentasUtilizadasProps {
  isReadOnly?: boolean;
  faseId: string;
  initialData?: BackendToolItem[];
}

export const FerramentasUtilizadas: React.FC<FerramentasUtilizadasProps> = ({
  isReadOnly = false,
  faseId,
  initialData
}) => {
  const STORAGE_KEY = `ferramentas-fase-${faseId}`;
  const [ferramentas, setFerramentas] = useState<ToolItem[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [editTemp, setEditTemp] = useState<Omit<ToolItem, 'id'>>({
    name: '',
    category: 'Manual',
    totalQuantity: 1,
    inUse: 0,
    inMaintenance: 0,
    condition: 'GOOD',
    notes: ''
  });

  useEffect(() => {
    let transformedData: ToolItem[] = [];
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as ToolItem[];
      setFerramentas(parsed);

    }
    else if (initialData && initialData.length > 0) {
      transformedData = initialData.map(tool => ({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        totalQuantity: tool.totalQuantity,
        inUse: tool.inUse,
        inMaintenance: tool.inMaintenance,
        condition: mapCondition(tool.condition),
        notes: tool.notes || ''
      }));
      setFerramentas(transformedData);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ToolItem[];
        setFerramentas(parsed);
      }
    }
  }, [faseId, initialData]);

  useEffect(() => {
    if (ferramentas.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ferramentas));
    }
  }, [ferramentas]);

  const adicionarFerramenta = () => {
    const nova: ToolItem = {
      id: Date.now().toString(),
      name: 'Nova Ferramenta',
      category: 'Manual',
      totalQuantity: 1,
      inUse: 0,
      inMaintenance: 0,
      condition: 'GOOD',
      notes: ''
    };
    setFerramentas(prev => [...prev, nova]);
  };

  const removerFerramenta = (id: string) => {
    setFerramentas(prev => prev.filter(f => f.id !== id));
    setEditandoId(null);
  };

  const atualizarFerramenta = (id: string, updates: Partial<ToolItem>) => {
    setFerramentas(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, ...updates }
          : f
      )
    );
  };

  const abrirEdicao = (ferramenta: ToolItem) => {
    setEditandoId(ferramenta.id);
    setEditTemp({
      name: ferramenta.name,
      category: ferramenta.category,
      totalQuantity: ferramenta.totalQuantity,
      inUse: ferramenta.inUse,
      inMaintenance: ferramenta.inMaintenance,
      condition: ferramenta.condition,
      notes: ferramenta.notes
    });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    atualizarFerramenta(editandoId, editTemp);
    setEditandoId(null);
  };

  const usarFerramenta = () => {
    if (editTemp.inUse >= editTemp.totalQuantity - editTemp.inMaintenance) return;
    setEditTemp(prev => ({ ...prev, inUse: prev.inUse + 1 }));
  };

  const devolverFerramenta = () => {
    if (editTemp.inUse <= 0) return;
    setEditTemp(prev => ({ ...prev, inUse: prev.inUse - 1 }));
  };

  const enviarManutencao = () => {
    if (editTemp.inMaintenance >= editTemp.totalQuantity - editTemp.inUse) return;
    setEditTemp(prev => ({ ...prev, inMaintenance: prev.inMaintenance + 1 }));
  };

  const retornarManutencao = () => {
    if (editTemp.inMaintenance <= 0) return;
    setEditTemp(prev => ({ ...prev, inMaintenance: prev.inMaintenance - 1 }));
  };

  const getDisponivel = (item: Pick<ToolItem, 'totalQuantity' | 'inUse' | 'inMaintenance'>) => {
    return item.totalQuantity - item.inUse - item.inMaintenance;
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

  const getConditionColorClass = (condition: 'EXCELLENT' | 'GOOD' | 'POOR' | 'UNAVAILABLE') => {
    switch (condition) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'POOR': return 'bg-orange-100 text-orange-800';
      case 'UNAVAILABLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Hammer className="text-orange-600" size={28} />
          <h3 className="text-xl font-bold">Ferramentas Utilizadas</h3>
        </div>
        {!isReadOnly && (
          <button
            onClick={adicionarFerramenta}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow"
          >
            <Plus size={18} />
            Adicionar Ferramenta
          </button>
        )}
      </div>

      {ferramentas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Hammer size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhuma ferramenta adicionada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ferramentas.map(ferramenta => (
            <div
              key={ferramenta.id}
              className={`border rounded-xl p-5 shadow-sm transition-all relative ${editandoId === ferramenta.id
                ? 'ring-2 ring-orange-500 bg-orange-50'
                : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow'
              }`}
            >
              {!isReadOnly && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {editandoId !== ferramenta.id ? (
                    <button
                      onClick={() => abrirEdicao(ferramenta)}
                      className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow"
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
                    onClick={() => removerFerramenta(ferramenta.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {editandoId === ferramenta.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={editTemp.name}
                        onChange={e => setEditTemp({ ...editTemp, name: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Martelete 10kg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <select
                        value={editTemp.category}
                        onChange={e => setEditTemp({ ...editTemp, category: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option>Manual</option>
                        <option>Elétrica</option>
                        <option>Pneumática</option>
                        <option>Medição</option>
                        <option>Corte</option>
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
                      <p className="text-xs text-gray-600">Em Uso</p>
                      <p className="text-2xl font-bold text-blue-600">{editTemp.inUse}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={usarFerramenta}
                          disabled={editTemp.inUse >= editTemp.totalQuantity - editTemp.inMaintenance}
                          className="flex-1 bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          Usar
                        </button>
                        <button
                          onClick={devolverFerramenta}
                          disabled={editTemp.inUse <= 0}
                          className="flex-1 bg-gray-500 text-white text-xs py-1 rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                          Devolver
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Disponível</p>
                      <p className="text-2xl font-bold text-green-600">{getDisponivel(editTemp)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Manutenção</p>
                      <p className="text-2xl font-bold text-orange-600">{editTemp.inMaintenance}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={enviarManutencao}
                          disabled={editTemp.inMaintenance >= editTemp.totalQuantity - editTemp.inUse}
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
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-800">{editTemp.totalQuantity}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-medium mb-1">Observação</label>
                    <textarea
                      value={editTemp.notes}
                      onChange={e => setEditTemp({ ...editTemp, notes: e.target.value })}
                      className="w-full p-2 border rounded"
                      rows={2}
                      placeholder="Ex: Cabo danificado"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{ferramenta.name}</p>
                      <p className="text-sm text-gray-600">{ferramenta.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ferramenta.condition === 'EXCELLENT' && <CheckCircle className="text-green-600" size={20} />}
                      {ferramenta.condition === 'GOOD' && <CheckCircle className="text-blue-600" size={20} />}
                      {ferramenta.condition === 'POOR' && <Wrench className="text-orange-600" size={20} />}
                      {ferramenta.condition === 'UNAVAILABLE' && <X className="text-red-600" size={20} />}
                      <span className={`text-xs px-2 py-1 rounded-full ${getConditionColorClass(ferramenta.condition)}`}>
                        {getConditionLabel(ferramenta.condition)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Em Uso</p>
                      <p className="font-bold text-blue-700">{ferramenta.inUse}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Disponível</p>
                      <p className="font-bold text-green-700">{getDisponivel(ferramenta)}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Manutenção</p>
                      <p className="font-bold text-orange-700">{ferramenta.inMaintenance}</p>
                    </div>
                  </div>
                  {ferramenta.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{ferramenta.notes}"</p>
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
