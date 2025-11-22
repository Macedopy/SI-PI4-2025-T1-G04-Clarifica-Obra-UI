import React, { useState, useEffect } from 'react';
import { Wrench, X, Plus, Edit3, Save, Clock, Play, Pause, CheckCircle } from 'lucide-react';

interface Servico {
  id: string;
  nome: string;
  equipe: string;
  horasPlanejadas: number;
  horasExecutadas: number;
  status: 'planejado' | 'iniciado' | 'andamento' | 'concluido';
  progresso: number;
  observacao: string;
}

interface ServicosExecutadosProps {
  isReadOnly?: boolean;
  faseId: string;

}

export const ServicosExecutados: React.FC<ServicosExecutadosProps> = ({
  isReadOnly = false,
  faseId

}) => {
  const STORAGE_KEY = `servicos-fase-${faseId}`;
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTemp, setEditTemp] = useState<{
    nome: string;
    equipe: string;
    horasPlanejadas: number;
    horasExecutadas: number;
    status: 'planejado' | 'iniciado' | 'andamento' | 'concluido';
    progresso: number;
    observacao: string;
  }>({
    nome: '',
    equipe: '',
    horasPlanejadas: 8,
    horasExecutadas: 0,
    status: 'planejado',
    progresso: 0,
    observacao: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setServicos(JSON.parse(saved));




  }, [faseId]);

  useEffect(() => {
    if (servicos.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));

    }
  }, [servicos]);










  const adicionarServico = () => {
    const novo: Servico = {
      id: Date.now().toString(),
      nome: 'Novo Serviço',
      equipe: 'Equipe Principal',
      horasPlanejadas: 8,
      horasExecutadas: 0,
      status: 'planejado',
      progresso: 0,
      observacao: ''
    };
    setServicos(prev => [...prev, novo]);
  };

  const removerServico = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
    setEditandoId(null);
  };

  const atualizarServico = (id: string, updates: Partial<Servico>) => {
    setServicos(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              ...updates,
              progresso: Math.round((updates.horasExecutadas || s.horasExecutadas) / s.horasPlanejadas * 100)
            }
          : s
      )
    );




  };

  const abrirEdicao = (servico: Servico) => {
    setEditandoId(servico.id);
    setEditTemp({
      nome: servico.nome,
      equipe: servico.equipe,
      horasPlanejadas: servico.horasPlanejadas,
      horasExecutadas: servico.horasExecutadas,
      status: servico.status,
      progresso: servico.progresso,
      observacao: servico.observacao
    });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    atualizarServico(editandoId, {
      nome: editTemp.nome,
      equipe: editTemp.equipe,
      horasPlanejadas: editTemp.horasPlanejadas,
      horasExecutadas: editTemp.horasExecutadas,
      status: editTemp.status,
      observacao: editTemp.observacao
    });
    setEditandoId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejado': return <Play className="text-gray-500" size={16} />;
      case 'iniciado': return <Play className="text-blue-600" size={16} />;
      case 'andamento': return <Pause className="text-yellow-600" size={16} />;
      case 'concluido': return <CheckCircle className="text-green-600" size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': return 'bg-gray-100 text-gray-700';
      case 'iniciado': return 'bg-blue-100 text-blue-700';
      case 'andamento': return 'bg-yellow-100 text-yellow-700';
      case 'concluido': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench className="text-orange-600" size={28} />
          <h3 className="text-xl font-bold">Serviços Executados</h3>
        </div>
        {!isReadOnly && (
          <button
            onClick={adicionarServico}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow"
          >
            <Plus size={18} />
            Adicionar Serviço
          </button>
        )}
      </div>

      {servicos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Wrench size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum serviço adicionado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {servicos.map(servico => (
            <div
              key={servico.id}
              className={`border rounded-xl p-5 shadow-sm transition-all relative ${
                editandoId === servico.id
                  ? 'ring-2 ring-orange-500 bg-orange-50'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow'
              }`}
            >
              {!isReadOnly && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {editandoId !== servico.id ? (
                    <button
                      onClick={() => abrirEdicao(servico)}
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
                    onClick={() => removerServico(servico.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {editandoId === servico.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTemp.nome}
                    onChange={e => setEditTemp({ ...editTemp, nome: e.target.value })}
                    className="w-full p-2 border rounded font-bold text-lg"
                    placeholder="Ex: Concretagem de laje"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Equipe</label>
                      <input
                        type="text"
                        value={editTemp.equipe}
                        onChange={e => setEditTemp({ ...editTemp, equipe: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="Ex: Equipe A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Horas Planejadas</label>
                      <input
                        type="number"
                        min="1"
                        value={editTemp.horasPlanejadas}
                        onChange={e => setEditTemp({ ...editTemp, horasPlanejadas: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Horas Executadas</label>
                      <div className="flex items-center gap-3">
                        <Clock className="text-blue-600" size={20} />
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={editTemp.horasExecutadas}
                          onChange={e => setEditTemp({ ...editTemp, horasExecutadas: Number(e.target.value) })}
                          className="flex-1 p-2 border rounded text-center font-bold text-blue-600"
                        />
                        <span className="text-sm">h</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={editTemp.status}
                        onChange={e => setEditTemp({ ...editTemp, status: e.target.value as any })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="planejado">Planejado</option>
                        <option value="iniciado">Iniciado</option>
                        <option value="andamento">Em Andamento</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Progresso</label>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-600 h-3 rounded-full transition-all"
                          style={{ width: `${editTemp.progresso}%` }}
                        />
                      </div>
                      <p className="text-right text-sm font-medium mt-1">{editTemp.progresso}%</p>
                    </div>
                  </div>

                  <textarea
                    value={editTemp.observacao}
                    onChange={e => setEditTemp({ ...editTemp, observacao: e.target.value })}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    placeholder="Observações do serviço"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{servico.nome}</p>
                      <p className="text-sm text-gray-600">{servico.equipe}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {getStatusIcon(servico.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(servico.status)}`}>
                          {servico.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-sm mb-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <Clock className="mx-auto mb-1 text-blue-600" size={16} />
                      <p className="text-xs text-gray-600">Executadas</p>
                      <p className="font-bold text-blue-700">{servico.horasExecutadas}h</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Planejadas</p>
                      <p className="font-bold text-gray-700">{servico.horasPlanejadas}h</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Progresso</p>
                      <p className="font-bold text-orange-700">{servico.progresso}%</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${servico.progresso}%` }}
                    />
                  </div>

                  {servico.observacao && (
                    <p className="text-xs text-gray-500 mt-3 italic">"{servico.observacao}"</p>
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
