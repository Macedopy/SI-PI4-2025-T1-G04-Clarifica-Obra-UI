//Responsável: Bruno Macedo
import React, { useState, useEffect } from 'react';
import { Wrench, X, Plus, Edit3, Save, Clock, Play, Pause, CheckCircle } from 'lucide-react';
import { useObra } from '../../contexts/ObraContext';

interface BackendServico {
  id: string;
  phaseId: null;
  name: string;
  team: string;
  plannedHours: number;
  executedHours: number;
  status: 'planejado' | 'iniciado' | 'andamento' | 'concluido';
  progress: number;
  notes: string;
}

interface Servico {
  id: string;
  name: string;
  team: string;
  plannedHours: number;
  executedHours: number;
  status: 'planejado' | 'iniciado' | 'andamento' | 'concluido';
  progress: number;
  notes: string;
}

interface ServicosExecutadosProps {
  isReadOnly?: boolean;
  faseId: string;
  initialData?: BackendServico[];
}

export const ServicosExecutados: React.FC<ServicosExecutadosProps> = ({
  isReadOnly = false,
  faseId,
  initialData
}) => {
  const { updateSecaoProgress } = useObra();
  const STORAGE_KEY = `servicos-fase-${faseId}`;
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editTemp, setEditTemp] = useState<{
    name: string;
    team: string;
    plannedHours: number;
    executedHours: number;
    status: 'planejado' | 'iniciado' | 'andamento' | 'concluido';
    progress: number;
    notes: string;
  }>({
    name: '',
    team: '',
    plannedHours: 8,
    executedHours: 0,
    status: 'planejado',
    progress: 0,
    notes: ''
  });

  useEffect(() => {
    let transformedData: Servico[] = [];
    if (initialData && initialData.length > 0) {
      transformedData = initialData.map(service => ({
        id: service.id,
        name: service.name,
        team: service.team,
        plannedHours: service.plannedHours,
        executedHours: service.executedHours,
        status: service.status,
        progress: service.progress,
        notes: service.notes || ''
      }));
      setServicos(transformedData);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Servico[];
        setServicos(parsed);
      }
    }
  }, [faseId, initialData]);

  useEffect(() => {
    if (servicos.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
    }
  }, [servicos]);

  useEffect(() => {
    let average = 0;
    if (servicos.length > 0) {
      const totalProgress = servicos.reduce((sum, s) => sum + s.progress, 0);
      average = Math.round(totalProgress / servicos.length);
    }
    updateSecaoProgress(faseId, 'servicos', average);
  }, [servicos, faseId, updateSecaoProgress]);

  useEffect(() => {
    if (editandoId) {
      const planned = editTemp.plannedHours || 1;
      const executed = editTemp.executedHours || 0;
      const newProgress = Math.min(100, Math.round((executed / planned) * 100));
      if (newProgress !== editTemp.progress) {
        setEditTemp(prev => ({ ...prev, progress: newProgress }));
      }
    }
  }, [editTemp.executedHours, editTemp.plannedHours, editandoId]);

  const averageProgress = servicos.length > 0
    ? Math.round(servicos.reduce((sum, s) => sum + s.progress, 0) / servicos.length)
    : 0;

  const adicionarServico = () => {
    const novo: Servico = {
      id: Date.now().toString(),
      name: 'Novo Serviço',
      team: 'Equipe Principal',
      plannedHours: 8,
      executedHours: 0,
      status: 'planejado',
      progress: 0,
      notes: ''
    };
    setServicos(prev => [...prev, novo]);
  };

  const removerServico = async (id: string) => {
    // Verifica se é um ID temporário (criado pelo Date.now() - sem hífens)
    // ou um UUID do banco (com hífens)
    const isTempId = !id.includes('-');
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) {
      return;
    }
    if (isTempId) {
      setServicos(prev => prev.filter(s => s.id !== id));
      setEditandoId(null);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/terrain-preparation/service/${id}`, {
        method: 'DELETE',
      });
      if (response.ok || response.status === 204) {
        setServicos(prev => prev.filter(s => s.id !== id));
        setEditandoId(null);
      } else {
        alert("Não foi possível excluir o serviço no servidor.");
        console.error("Erro ao deletar:", response.statusText);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro de conexão ao tentar excluir.");
    }
  };

  const atualizarServico = (id: string, updates: Partial<Servico>) => {
    setServicos(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              ...updates,
              progress: Math.min(100, Math.round((updates.executedHours || s.executedHours) / (updates.plannedHours || s.plannedHours) * 100) || 0)
            }
          : s
      )
    );
  };

  const abrirEdicao = (servico: Servico) => {
    setEditandoId(servico.id);
    setEditTemp({
      name: servico.name,
      team: servico.team,
      plannedHours: servico.plannedHours,
      executedHours: servico.executedHours,
      status: servico.status,
      progress: servico.progress,
      notes: servico.notes
    });
    setError(null);
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    if (editTemp.executedHours > editTemp.plannedHours) {
      setError('As horas executadas não podem exceder as horas planejadas.');
      return;
    }
    setError(null);
    atualizarServico(editandoId, {
      name: editTemp.name,
      team: editTemp.team,
      plannedHours: editTemp.plannedHours,
      executedHours: editTemp.executedHours,
      status: editTemp.status,
      notes: editTemp.notes,
      progress: editTemp.progress
    });
    setEditandoId(null);
  };

  const handlePlannedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlanned = Number(e.target.value);
    setEditTemp({ ...editTemp, plannedHours: newPlanned });
    if (newPlanned < editTemp.executedHours) {
      setError('As horas planejadas não podem ser menores que as horas executadas.');
    } else {
      setError(null);
    }
  };

  const handleExecutedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExecuted = Number(e.target.value);
    setEditTemp({ ...editTemp, executedHours: newExecuted });
    if (newExecuted > editTemp.plannedHours) {
      setError('As horas executadas não podem exceder as horas planejadas.');
    } else {
      setError(null);
    }
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
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">Progresso Médio:</span>
          <span className="font-bold text-orange-700">{averageProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-orange-600 h-3 rounded-full transition-all"
            style={{ width: `${averageProgress}%` }}
          />
        </div>
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
                    value={editTemp.name}
                    onChange={e => setEditTemp({ ...editTemp, name: e.target.value })}
                    className="w-full p-2 border rounded font-bold text-lg"
                    placeholder="Ex: Concretagem de laje"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Equipe</label>
                      <input
                        type="text"
                        value={editTemp.team}
                        onChange={e => setEditTemp({ ...editTemp, team: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="Ex: Equipe A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Horas Planejadas</label>
                      <input
                        type="number"
                        min="1"
                        value={editTemp.plannedHours}
                        onChange={handlePlannedChange}
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
                          value={editTemp.executedHours}
                          onChange={handleExecutedChange}
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
                          style={{ width: `${editTemp.progress}%` }}
                        />
                      </div>
                      <p className="text-right text-sm font-medium mt-1">{editTemp.progress}%</p>
                    </div>
                  </div>
                  <textarea
                    value={editTemp.notes}
                    onChange={e => setEditTemp({ ...editTemp, notes: e.target.value })}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    placeholder="Observações do serviço"
                  />
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{servico.name}</p>
                      <p className="text-sm text-gray-600">{servico.team}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {getStatusIcon(servico.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(servico.status)}`}>
                          {servico.status.charAt(0).toUpperCase() + servico.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm mb-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <Clock className="mx-auto mb-1 text-blue-600" size={16} />
                      <p className="text-xs text-gray-600">Executadas</p>
                      <p className="font-bold text-blue-700">{servico.executedHours}h</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Planejadas</p>
                      <p className="font-bold text-gray-700">{servico.plannedHours}h</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Progresso</p>
                      <p className="font-bold text-orange-700">{servico.progress}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${servico.progress}%` }}
                    />
                  </div>
                  {servico.notes && (
                    <p className="text-xs text-gray-500 mt-3 italic">"{servico.notes}"</p>
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