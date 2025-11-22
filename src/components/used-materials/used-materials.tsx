import React, { useState, useEffect } from 'react';
import { Package, X, Plus, Edit3, Save, Box } from 'lucide-react';

interface MaterialItem {
  id: string;
  nome: string;
  categoria: string;
  quantidadeConsumida: number;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  reposicao: boolean;
  urgencia: string;
}

interface MateriaisUtilizadosProps {
  isReadOnly?: boolean;
  faseId: string;

}

export const MateriaisUtilizados: React.FC<MateriaisUtilizadosProps> = ({ 
  isReadOnly = false, 
  faseId 

}) => {
  const STORAGE_KEY = `materiais-fase-${faseId}`;
  const [materiais, setMateriais] = useState<MaterialItem[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Campos temporários para edição
  const [editTemp, setEditTemp] = useState({
    nome: '',
    categoria: '',
    unidade: '',
    estoqueMinimo: 0,
    adicao: 0,
    consumo: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMateriais(JSON.parse(saved));


    }
  }, [faseId]);

  useEffect(() => {
    if (materiais.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(materiais));

    }
  }, [materiais]);












  const adicionarMaterial = () => {
    const novo: MaterialItem = {
      id: Date.now().toString(),
      nome: 'Novo Material',
      categoria: 'Outros',
      quantidadeConsumida: 0,
      unidade: 'unidade',
      estoqueAtual: 0,
      estoqueMinimo: 10,
      reposicao: false,
      urgencia: ''
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
      nome: material.nome,
      categoria: material.categoria,
      unidade: material.unidade,
      estoqueMinimo: material.estoqueMinimo,
      adicao: 0,
      consumo: 0
    });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    atualizarMaterial(editandoId, {
      nome: editTemp.nome,
      categoria: editTemp.categoria,
      unidade: editTemp.unidade,
      estoqueMinimo: editTemp.estoqueMinimo
    });
    setEditandoId(null);
  };

  const consumir = () => {
    if (!editandoId || editTemp.consumo <= 0) return;
    const material = materiais.find(m => m.id === editandoId);
    if (!material) return;

    const novoConsumo = material.quantidadeConsumida + editTemp.consumo;
    const novoEstoque = Math.max(0, material.estoqueAtual - editTemp.consumo);

    atualizarMaterial(editandoId, {
      quantidadeConsumida: novoConsumo,
      estoqueAtual: novoEstoque,
      reposicao: novoEstoque <= material.estoqueMinimo
    });

    setEditTemp({ ...editTemp, consumo: 0 });
  };

  const adicionarEstoque = () => {
    if (!editandoId || editTemp.adicao <= 0) return;
    const material = materiais.find(m => m.id === editandoId);
    if (!material) return;

    atualizarMaterial(editandoId, {
      estoqueAtual: material.estoqueAtual + editTemp.adicao
    });

    setEditTemp({ ...editTemp, adicao: 0 });
  };

  const materialAtual = materiais.find(m => m.id === editandoId);

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
                        value={editTemp.nome}
                        onChange={e => setEditTemp({ ...editTemp, nome: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Cimento 50kg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <select
                        value={editTemp.categoria}
                        onChange={e => setEditTemp({ ...editTemp, categoria: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Selecione</option>
                        <option>Cimento</option>
                        <option>Areia</option>
                        <option>Ferro</option>
                        <option>Tijolo</option>
                        <option>Madeira</option>
                        <option>Elétrica</option>
                        <option>Hidráulica</option>
                        <option>Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unidade</label>
                      <select
                        value={editTemp.unidade}
                        onChange={e => setEditTemp({ ...editTemp, unidade: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Selecione</option>
                        <option>saco</option>
                        <option>kg</option>
                        <option>m³</option>
                        <option>unidade</option>
                        <option>litro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                      <input
                        type="number"
                        value={editTemp.estoqueMinimo}
                        onChange={e => setEditTemp({ ...editTemp, estoqueMinimo: Number(e.target.value) })}
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
                          value={editTemp.adicao || ''}
                          onChange={e => setEditTemp({ ...editTemp, adicao: Number(e.target.value) })}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={adicionarEstoque}
                          disabled={!editTemp.adicao || editTemp.adicao <= 0}
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
                          value={editTemp.consumo || ''}
                          onChange={e => setEditTemp({ ...editTemp, consumo: parseFloat(e.target.value) || 0 })}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={consumir}
                          disabled={!editTemp.consumo || editTemp.consumo <= 0}
                          className="px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                        >
                          <Package size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p>Consumido: <strong>{material.quantidadeConsumida} {material.unidade}</strong></p>
                    <p>Estoque atual: <strong className={material.estoqueAtual <= material.estoqueMinimo ? 'text-red-600' : 'text-green-600'}>
                      {material.estoqueAtual} {material.unidade}
                    </strong></p>
                    {material.reposicao && <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">Reposição necessária</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Categoria</p>
                      <p className="font-semibold text-purple-700">{material.categoria || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Material</p>
                      <p className="font-bold text-gray-800">{material.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Consumido</p>
                      <p className="text-lg font-bold text-orange-600">
                        {material.quantidadeConsumida} {material.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estoque: <strong className={material.estoqueAtual <= material.estoqueMinimo ? 'text-red-600' : 'text-green-600'}>
                      {material.estoqueAtual}
                    </strong> {material.unidade}
                    {material.reposicao && (
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
