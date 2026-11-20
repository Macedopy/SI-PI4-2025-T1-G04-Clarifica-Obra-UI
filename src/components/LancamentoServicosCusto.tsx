import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Save, X, 
  FileText, Clock, Calendar, Scale, 
  ChevronDown, ChevronUp, CheckCircle, 
  AlertTriangle, MapPin, Users, Wrench
} from 'lucide-react';

interface ServicoCusto {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  percentualConcluido: number;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  gastos: number;
  responsavel: string;
  observacoes: string;
}

interface LancamentoServicosCustoProps {
  faseId: string;
  isReadOnly?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  pendente: { label: 'Pendente', cor: 'text-gray-500 bg-gray-100' },
  em_andamento: { label: 'Em Andamento', cor: 'text-blue-600 bg-blue-100' },
  concluido: { label: 'Concluído', cor: 'text-green-600 bg-green-100' },
  atrasado: { label: 'Atrasado', cor: 'text-red-600 bg-red-100' }
};

export const LancamentoServicosCusto: React.FC<LancamentoServicosCustoProps> = ({
  faseId,
  isReadOnly = false
}) => {
  const STORAGE_KEY = `servicos-custo-fase-${faseId}`;
  const [servicos, setServicos] = useState<ServicoCusto[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    percentualConcluido: 0,
    status: 'pendente' as 'pendente' | 'em_andamento' | 'concluido' | 'atrasado',
    gastos: 0,
    responsavel: '',
    observacoes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setServicos(JSON.parse(saved));
      } catch {}
    }
  }, [faseId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
  }, [servicos, faseId]);

  const adicionarServico = () => {
    if (!form.nome.trim()) {
      alert('Informe o nome do serviço.');
      return;
    }
    if (!form.dataInicio || !form.dataFim) {
      alert('Informe o período do serviço (início e fim).');
      return;
    }

    const novo: ServicoCusto = {
      id: Date.now().toString(),
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      percentualConcluido: Math.max(0, Math.min(100, form.percentualConcluido || 0)),
      status: form.status,
      gastos: Math.max(0, form.gastos || 0),
      responsavel: form.responsavel.trim(),
      observacoes: form.observacoes.trim()
    };

    setServicos(prev => [...prev, novo]);
    setForm({
      nome: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      percentualConcluido: 0,
      status: 'pendente',
      gastos: 0,
      responsavel: '',
      observacoes: ''
    });
  };

  const removerServico = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
  };

  const abrirEdicao = (servico: ServicoCusto) => {
    setEditandoId(servico.id);
    setForm({ ...servico });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    setServicos(prev => prev.map(s => {
      if (s.id === editandoId) {
        return {
          ...s,
          nome: form.nome.trim(),
          descricao: form.descricao.trim(),
          dataInicio: form.dataInicio,
          dataFim: form.dataFim,
          percentualConcluido: Math.max(0, Math.min(100, form.percentualConcluido || 0)),
          status: form.status,
          gastos: Math.max(0, form.gastos || 0),
          responsavel: form.responsavel.trim(),
          observacoes: form.observacoes.trim()
        };
      }
      return s;
    }));
    setEditandoId(null);
    setForm({
      nome: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      percentualConcluido: 0,
      status: 'pendente',
      gastos: 0,
      responsavel: '',
      observacoes: ''
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm({
      nome: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      percentualConcluido: 0,
      status: 'pendente',
      gastos: 0,
      responsavel: '',
      observacoes: ''
    });
  };

  const totalGastos = servicos.reduce((acc, s) => acc + s.gastos, 0);
  const servicosConcluidos = servicos.filter(s => s.status === 'concluido').length;
  const servicosEmAndamento = servicos.filter(s => s.status === 'em_andamento').length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="text-indigo-600" size={24} />
          <h3 className="font-bold text-gray-900">Serviços da Fase</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 uppercase font-medium">Total Serviços</div>
            <div className="font-bold text-gray-900">{servicos.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-medium">Concluídos</div>
            <div className="font-bold text-green-600">{servicosConcluidos}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-medium">Em Andamento</div>
            <div className="font-bold text-blue-600">{servicosEmAndamento}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-medium">Gastos Totais</div>
            <div className="font-bold text-indigo-600">R$ {totalGastos.toFixed(2).replace('.', ',')}</div>
          </div>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setExpandido(!expandido)}
            className="mt-3 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      <div className={expandido ? '' : 'hidden'}>
        {!isReadOnly && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" />
              Novo Serviço
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="Ex: Instalação Elétrica, Pintura..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descrição (o que será feito)</label>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="Detalhe as atividades deste serviço..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Data Início</label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">% Concluído</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.percentualConcluido}
                  onChange={e => setForm({ ...form, percentualConcluido: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as 'pendente' | 'em_andamento' | 'concluido' | 'atrasado' })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Gastos (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.gastos}
                  onChange={e => setForm({ ...form, gastos: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Responsável</label>
                <input
                  type="text"
                  value={form.responsavel}
                  onChange={e => setForm({ ...form, responsavel: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="Opcional"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                <input
                  type="text"
                  value={form.observacoes}
                  onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="Opcional"
                />
              </div>
              <div className="lg:col-span-3 flex items-end">
                <button
                  onClick={adicionarServico}
                  disabled={!form.nome.trim() || !form.dataInicio || !form.dataFim}
                  className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Adicionar Serviço
                </button>
              </div>
            </div>
          </div>
        )}

        {servicos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum serviço adicionado ainda.</p>
            {!isReadOnly && <p className="text-xs mt-1">Use o formulário acima para lançar serviços.</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {servicos.map((servico) => {
              const isEditing = editandoId === servico.id;
              const statusInfo = STATUS_LABELS[servico.status];
              const dataInicio = new Date(servico.dataInicio);
              const dataFim = new Date(servico.dataFim);
              const diasPeriodo = Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <div key={servico.id} className="p-5 hover:bg-gray-50 transition">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                          <input
                            value={form.nome}
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                          <textarea
                            value={form.descricao}
                            onChange={e => setForm({ ...form, descricao: e.target.value })}
                            rows={2}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Data Início</label>
                          <input
                            type="date"
                            value={form.dataInicio}
                            onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Data Fim</label>
                          <input
                            type="date"
                            value={form.dataFim}
                            onChange={e => setForm({ ...form, dataFim: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">% Concluído</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.percentualConcluido}
                            onChange={e => setForm({ ...form, percentualConcluido: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                          <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value as 'pendente' | 'em_andamento' | 'concluido' | 'atrasado' })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="concluido">Concluído</option>
                            <option value="atrasado">Atrasado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Gastos (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.gastos}
                            onChange={e => setForm({ ...form, gastos: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Responsável</label>
                          <input
                            value={form.responsavel}
                            onChange={e => setForm({ ...form, responsavel: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div className="lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                          <input
                            value={form.observacoes}
                            onChange={e => setForm({ ...form, observacoes: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
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
                          <span className="font-semibold text-gray-900 truncate">{servico.nome}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.cor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span><Calendar size={14} className="mr-1" /> {servico.dataInicio} → {servico.dataFim}</span>
                          <span><Clock size={14} className="mr-1" /> {diasPeriodo} dia{diasPeriodo !== 1 ? 's' : ''}</span>
                          {servico.responsavel && (
                            <span><Users size={14} className="mr-1" /> {servico.responsavel}</span>
                          )}
                        </div>
                        {servico.descricao && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500 italic">{servico.descricao}</span>
                          </div>
                        )}
                        {servico.observacoes && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500 italic">{servico.observacoes}</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full md:w-1/3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Concluído</span>
                          <span className="text-xs font-bold text-gray-900">{servico.percentualConcluido}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${servico.status === 'concluido' ? 'bg-green-600' : servico.status === 'em_andamento' ? 'bg-blue-600' : servico.status === 'atrasado' ? 'bg-red-600' : 'bg-gray-400'}`}
                            style={{ width: `${servico.percentualConcluido}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-full md:w-1/4 text-right">
                        <div className="font-bold text-indigo-600">
                          R$ {servico.gastos.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Gastos do serviço</div>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1 mt-2 justify-end">
                            <button
                              onClick={() => abrirEdicao(servico)}
                              className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => removerServico(servico.id)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-600">Total de Gastos em Serviços</span>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            R$ {totalGastos.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>
    </div>
  );
};
