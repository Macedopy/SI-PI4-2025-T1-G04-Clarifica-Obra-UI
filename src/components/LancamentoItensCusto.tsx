import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Save, X, 
  Package, Wrench, Truck, Users, Camera,
  ChevronDown, ChevronUp, Scale, 
  MapPin, Clock, FileText
} from 'lucide-react';

interface ItemCusto {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  peso: number;
  valorUnitario: number;
  fornecedor: string;
  observacoes: string;
  valorTotal: number;
}

interface LancamentoItensCustoProps {
  faseId: string;
  secaoId: string;
  secaoNome: string;
  isReadOnly?: boolean;
}

const CATEGORIAS: Record<string, { id: string; nome: string; icone: any }> = {
  materiais: { id: 'materiais', nome: 'Materiais', icone: Package },
  ferramentas: { id: 'ferramentas', nome: 'Ferramentas', icone: Wrench },
  maquinarios: { id: 'maquinarios', nome: 'Maquinários', icone: Truck },
  equipe: { id: 'equipe', nome: 'Equipe', icone: Users },
  servicos: { id: 'servicos', nome: 'Serviços', icone: FileText },
};

export const LancamentoItensCusto: React.FC<LancamentoItensCustoProps> = ({
  faseId,
  secaoId,
  secaoNome,
  isReadOnly = false
}) => {
  const STORAGE_KEY = `itens-custo-fase-${faseId}`;
  const [itens, setItens] = useState<ItemCusto[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    categoria: secaoId,
    quantidade: 1,
    peso: 0,
    valorUnitario: 0,
    fornecedor: '',
    observacoes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const todos: ItemCusto[] = JSON.parse(saved);
        const destaSecao = todos.filter(i => i.categoria === secaoId);
        setItens(destaSecao);
      } catch {}
    }
  }, [faseId, secaoId]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let todos: ItemCusto[] = [];
    if (saved) {
      try { todos = JSON.parse(saved); } catch {}
    }
    const outros = todos.filter(i => i.categoria !== secaoId);
    setItens(prev => {
      const atualizados = [...outros, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados));
      return prev;
    });
  }, [itens, faseId, secaoId]);

  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + item.valorTotal, 0);
  };

  const calcularPesoTotal = () => {
    return itens.reduce((acc, item) => acc + (item.peso * item.quantidade), 0);
  };

  const adicionarItem = () => {
    if (!form.nome.trim()) {
      alert('Informe o nome do item.');
      return;
    }
    if (form.valorUnitario < 0) {
      alert('O valor unitário não pode ser negativo.');
      return;
    }

    const novo: ItemCusto = {
      id: Date.now().toString(),
      nome: form.nome.trim(),
      categoria: form.categoria,
      quantidade: Math.max(1, form.quantidade || 1),
      peso: Math.max(0, form.peso || 0),
      valorUnitario: Math.max(0, form.valorUnitario || 0),
      fornecedor: form.fornecedor.trim(),
      observacoes: form.observacoes.trim(),
      valorTotal: (form.quantidade || 1) * (form.valorUnitario || 0)
    };

    setItens(prev => [...prev, novo]);
    setForm({
      nome: '',
      categoria: secaoId,
      quantidade: 1,
      peso: 0,
      valorUnitario: 0,
      fornecedor: '',
      observacoes: ''
    });
  };

  const removerItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id));
  };

  const abrirEdicao = (item: ItemCusto) => {
    setEditandoId(item.id);
    setForm({
      nome: item.nome,
      categoria: item.categoria,
      quantidade: item.quantidade,
      peso: item.peso,
      valorUnitario: item.valorUnitario,
      fornecedor: item.fornecedor,
      observacoes: item.observacoes
    });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    setItens(prev => prev.map(i => {
      if (i.id === editandoId) {
        return {
          ...i,
          nome: form.nome.trim(),
          categoria: form.categoria,
          quantidade: Math.max(1, form.quantidade || 1),
          peso: Math.max(0, form.peso || 0),
          valorUnitario: Math.max(0, form.valorUnitario || 0),
          fornecedor: form.fornecedor.trim(),
          observacoes: form.observacoes.trim(),
          valorTotal: (form.quantidade || 1) * (form.valorUnitario || 0)
        };
      }
      return i;
    }));
    setEditandoId(null);
    setForm({
      nome: '',
      categoria: secaoId,
      quantidade: 1,
      peso: 0,
      valorUnitario: 0,
      fornecedor: '',
      observacoes: ''
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm({
      nome: '',
      categoria: secaoId,
      quantidade: 1,
      peso: 0,
      valorUnitario: 0,
      fornecedor: '',
      observacoes: ''
    });
  };

  const categoriaInfo = CATEGORIAS[secaoId] || { id: secaoId, nome: secaoNome, icone: Package };
  const total = calcularTotal();
  const pesoTotal = calcularPesoTotal();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {categoriaInfo.icone ? <categoriaInfo.icone className="text-gray-600" size={24} /> : <Package className="text-gray-600" size={24} />}
          <div>
            <h3 className="font-bold text-gray-900">{categoriaInfo.nome}</h3>
            <p className="text-xs text-gray-500">
              {itens.length} item{itens.length !== 1 ? 's' : ''} • 
              Total: R$ {total.toFixed(2).replace('.', ',')} • 
              Peso: {pesoTotal.toFixed(2)} kg
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setExpandido(!expandido)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      <div className={expandido ? '' : 'hidden'}>
        {!isReadOnly && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" />
              Adicionar {categoriaInfo.nome.toLowerCase()}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Item</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Ex: Cimento, Tinta, Aluguel..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.peso}
                  onChange={e => setForm({ ...form, peso: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Valor Unitário (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valorUnitario}
                  onChange={e => setForm({ ...form, valorUnitario: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Fornecedor</label>
                <input
                  type="text"
                  value={form.fornecedor}
                  onChange={e => setForm({ ...form, fornecedor: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Opcional"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                <input
                  type="text"
                  value={form.observacoes}
                  onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="Opcional"
                />
              </div>
              <div className="lg:col-span-2 flex items-end">
                <button
                  onClick={adicionarItem}
                  disabled={!form.nome.trim()}
                  className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Adicionar Item
                </button>
              </div>
            </div>
          </div>
        )}

        {itens.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Package size={32} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum item adicionado ainda.</p>
            {!isReadOnly && <p className="text-xs mt-1">Use o formulário acima para lançar seus custos.</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {itens.map((item) => {
              const isEditing = editandoId === item.id;
              return (
                <div key={item.id} className="p-5 hover:bg-gray-50 transition">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                          <input
                            value={form.nome}
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                          <input
                            type="number"
                            min="1"
                            value={form.quantidade}
                            onChange={e => setForm({ ...form, quantidade: Math.max(1, Number(e.target.value) || 1) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Peso (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.peso}
                            onChange={e => setForm({ ...form, peso: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Valor Unit. (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.valorUnitario}
                            onChange={e => setForm({ ...form, valorUnitario: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Fornecedor</label>
                          <input
                            value={form.fornecedor}
                            onChange={e => setForm({ ...form, fornecedor: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                          <input
                            value={form.observacoes}
                            onChange={e => setForm({ ...form, observacoes: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t">
                        <button onClick={salvarEdicao} className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                          Salvar
                        </button>
                        <button onClick={cancelarEdicao} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 truncate">{item.nome}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.categoria}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span><Scale size={14} className="mr-1" /> {item.peso} kg</span>
                          <span><MapPin size={14} className="mr-1" /> {item.fornecedor || '—'}</span>
                          <span><Clock size={14} className="mr-1" /> R$ {item.valorUnitario.toFixed(2).replace('.', ',')}</span>
                        </div>
                        {item.observacoes && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500 italic">{item.observacoes}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.quantidade} × {item.valorUnitario.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => abrirEdicao(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => removerItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-600">Total {categoriaInfo.nome}</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            R$ {total.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>
    </div>
  );
};
