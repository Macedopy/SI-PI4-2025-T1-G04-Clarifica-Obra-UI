import React, { useState, useEffect } from 'react';
import { Package, X, Plus, Edit3, Save, Box } from 'lucide-react';

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  quantityUsed: number;
  unit: string;
  currentStock: number;
  minimumStock: number;
  needsRestock: boolean;
  urgency: string;
}

interface MateriaisUtilizadosProps {
  isReadOnly?: boolean;
  faseId: string;
  initialData?: MaterialItem[];
}

export const MateriaisUtilizados: React.FC<MateriaisUtilizadosProps> = ({ 
  isReadOnly = false, 
  faseId,
  initialData
}) => {
  const STORAGE_KEY = `materiais-fase-${faseId}`;
  const [materiais, setMateriais] = useState<MaterialItem[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [editTemp, setEditTemp] = useState<{
    name: string;
    category: string;
    unit: string;
    minimumStock: number;
    stockToAdd: number;
    consumption: number;
  }>({
    name: '',
    category: '',
    unit: '',
    minimumStock: 0,
    stockToAdd: 0,
    consumption: 0
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setMateriais(initialData);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMateriais(JSON.parse(saved));
      }
    }
  }, [faseId, initialData]);

  useEffect(() => {
    if (materiais.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(materiais));
    }
  }, [materiais]);

  const adicionarMaterial = () => {
    const novo: MaterialItem = {
      id: Date.now().toString(),
      name: 'Novo Material',
      category: 'OTHER',
      quantityUsed: 0,
      unit: 'UNIT',
      currentStock: 0,
      minimumStock: 10,
      needsRestock: true, // Começa true pois estoque é 0 e min é 10
      urgency: ''
    };
    setMateriais(prev => [...prev, novo]);
  };

  const removerMaterial = (id: string) => {
    setMateriais(prev => prev.filter(m => m.id !== id));
    setEditandoId(null);
  };

  const atualizarMaterial = (id: string, updates: Partial<MaterialItem>) => {
    setMateriais(prev => prev.map(m =>
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const abrirEdicao = (material: MaterialItem) => {
    setEditandoId(material.id);
    setEditTemp({
      name: material.name,
      category: material.category,
      unit: material.unit,
      minimumStock: material.minimumStock,
      stockToAdd: 0,
      consumption: 0
    });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    const material = materiais.find(m => m.id === editandoId);
    if (!material) return;

    // Recalcula necessidade de reposição caso o estoque mínimo tenha mudado
    const shouldRestock = material.currentStock <= editTemp.minimumStock;

    atualizarMaterial(editandoId, {
      name: editTemp.name,
      category: editTemp.category,
      unit: editTemp.unit,
      minimumStock: editTemp.minimumStock,
      needsRestock: shouldRestock
    });
    setEditandoId(null);
  };

  const consumir = () => {
    if (!editandoId || editTemp.consumption <= 0) return;
    const material = materiais.find(m => m.id === editandoId);
    if (!material) return;

    const novoConsumo = material.quantityUsed + editTemp.consumption;
    const novoEstoque = Math.max(0, material.currentStock - editTemp.consumption);

    atualizarMaterial(editandoId, {
      quantityUsed: novoConsumo,
      currentStock: novoEstoque,
      needsRestock: novoEstoque <= material.minimumStock
    });

    setEditTemp({ ...editTemp, consumption: 0 });
  };

  const adicionarEstoque = () => {
    if (!editandoId || editTemp.stockToAdd <= 0) return;
    const material = materiais.find(m => m.id === editandoId);
    if (!material) return;

    const novoEstoque = material.currentStock + editTemp.stockToAdd;

    atualizarMaterial(editandoId, {
      currentStock: novoEstoque,
      needsRestock: novoEstoque <= material.minimumStock
    });

    setEditTemp({ ...editTemp, stockToAdd: 0 });
  };

  // Helpers para exibição visual em Português
  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      'CEMENT': 'Cimento',
      'SAND': 'Areia',
      'IRON': 'Ferro',
      'BRICK': 'Tijolo',
      'WOOD': 'Madeira',
      'ELECTRICAL': 'Elétrica',
      'HYDRAULIC': 'Hidráulica',
      'OTHER': 'Outros'
    };
    return map[cat] || cat;
  };

  const getUnitLabel = (unit: string) => {
    const map: Record<string, string> = {
      'BAG': 'Saco',
      'KG': 'kg',
      'M3': 'm³',
      'UNIT': 'Unid.',
      'LITERS': 'Litro'
    };
    return map[unit] || unit;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="text-purple-600" size={28} />
          <h3 className="text-xl font-bold">Materiais Utilizados</h3>
        </div>
        {!isReadOnly && (
          <button
            onClick={adicionarMaterial}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow"
          >
            <Plus size={18} />
            Adicionar Material
          </button>
        )}
      </div>

      {materiais.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum material adicionado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materiais.map((material) => (
            <div
              key={material.id}
              className={`border rounded-xl p-5 shadow-sm transition-all relative ${
                editandoId === material.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow'
              }`}
            >
              {!isReadOnly && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {editandoId !== material.id ? (
                    <button
                      onClick={() => abrirEdicao(material)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
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
                    onClick={() => removerMaterial(material.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {editandoId === material.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={editTemp.name}
                        onChange={e => setEditTemp({ ...editTemp, name: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Cimento 50kg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <select
                        value={editTemp.category}
                        onChange={e => setEditTemp({ ...editTemp, category: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="OTHER">Selecione</option>
                        <option value="CEMENT">Cimento</option>
                        <option value="SAND">Areia</option>
                        <option value="IRON">Ferro</option>
                        <option value="BRICK">Tijolo</option>
                        <option value="WOOD">Madeira</option>
                        <option value="ELECTRICAL">Elétrica</option>
                        <option value="HYDRAULIC">Hidráulica</option>
                        <option value="OTHER">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unidade</label>
                      <select
                        value={editTemp.unit}
                        onChange={e => setEditTemp({ ...editTemp, unit: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="UNIT">Selecione</option>
                        <option value="BAG">Saco</option>
                        <option value="KG">kg</option>
                        <option value="M3">m³</option>
                        <option value="UNIT">Unidade</option>
                        <option value="LITERS">Litro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                      <input
                        type="number"
                        value={editTemp.minimumStock}
                        onChange={e => setEditTemp({ ...editTemp, minimumStock: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Adicionar ao Estoque
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          value={editTemp.stockToAdd || ''}
                          onChange={e => setEditTemp({ ...editTemp, stockToAdd: Number(e.target.value) })}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={adicionarEstoque}
                          disabled={!editTemp.stockToAdd || editTemp.stockToAdd <= 0}
                          className="px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <Box size={18} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Consumir do Estoque
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Qtd"
                          value={editTemp.consumption || ''}
                          onChange={e => setEditTemp({ ...editTemp, consumption: parseFloat(e.target.value) || 0 })}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={consumir}
                          disabled={!editTemp.consumption || editTemp.consumption <= 0}
                          className="px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                        >
                          <Package size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p>Consumido: <strong>{material.quantityUsed} {getUnitLabel(material.unit)}</strong></p>
                    <p>Estoque atual: <strong className={material.currentStock <= material.minimumStock ? 'text-red-600' : 'text-green-600'}>
                      {material.currentStock} {getUnitLabel(material.unit)}
                    </strong></p>
                    {material.needsRestock && <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">Reposição necessária</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Categoria</p>
                      <p className="font-semibold text-purple-700">{getCategoryLabel(material.category) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Material</p>
                      <p className="font-bold text-gray-800">{material.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Consumido</p>
                      <p className="text-lg font-bold text-orange-600">
                        {material.quantityUsed} {getUnitLabel(material.unit)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estoque: <strong className={material.currentStock <= material.minimumStock ? 'text-red-600' : 'text-green-600'}>
                      {material.currentStock}
                    </strong> {getUnitLabel(material.unit)}
                    {material.needsRestock && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Reposição
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
