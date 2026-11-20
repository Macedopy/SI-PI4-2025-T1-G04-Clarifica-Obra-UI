import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Save, X,
  Users, Clock, Scale, MapPin,
  ChevronDown, ChevronUp, FileText,
  IdCard, Calendar, AlertTriangle
} from 'lucide-react';

interface MembroEquipe {
  id: string;
  nome: string;
  cargo: string;
  documento: string;
  paisDocumento: 'US' | 'CA' | 'BR' | 'OUTRO';
  tipoRemuneracao: 'hora' | 'diaria';
  valorRemuneracao: number;
  diasFaltou: number;
  dataAdmissao: string;
  idade: number;
  observacoes: string;
  valorTotal: number;
}

const FORMATOS_DOCUMENTO: Record<string, { label: string; exemplo: string }> = {
  US: { label: 'SSN (EUA)', exemplo: '123-45-6789' },
  CA: { label: 'SIN (Canadá)', exemplo: '123-456-789' },
  BR: { label: 'CPF (Brasil)', exemplo: '000.000.000-00' },
  OUTRO: { label: 'Documento (Outro)', exemplo: 'Ex: INE, Passaporte...' }
};

interface LancamentoEquipeCustoProps {
  faseId: string;
  isReadOnly?: boolean;
}

export const LancamentoEquipeCusto: React.FC<LancamentoEquipeCustoProps> = ({
  faseId,
  isReadOnly = false
}) => {
  const STORAGE_KEY = `equipe-custo-fase-${faseId}`;
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    cargo: '',
    documento: '',
    paisDocumento: 'BR' as 'US' | 'CA' | 'BR' | 'OUTRO',
    tipoRemuneracao: 'hora' as 'hora' | 'diaria',
    valorRemuneracao: 0,
    diasFaltou: 0,
    dataAdmissao: '',
    idade: 0,
    observacoes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMembros(JSON.parse(saved));
      } catch {}
    }
  }, [faseId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(membros));
  }, [membros, faseId]);

  const DIAS_UTEIS_MES = 22;

  const calcularValorTotal = (membro: MembroEquipe) => {
    const diasTrabalhados = Math.max(0, DIAS_UTEIS_MES - (membro.diasFaltou || 0));
    return diasTrabalhados * (membro.valorRemuneracao || 0);
  };

  const calcularTotalGeral = () => {
    return membros.reduce((acc, m) => acc + calcularValorTotal(m), 0);
  };

  const adicionarMembro = () => {
    if (!form.nome.trim()) {
      alert('Informe o nome do trabalhador.');
      return;
    }
    if (!form.documento.trim()) {
      alert('Informe o documento do trabalhador.');
      return;
    }

    const novo: MembroEquipe = {
      id: Date.now().toString(),
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      documento: form.documento.trim(),
      paisDocumento: form.paisDocumento,
      tipoRemuneracao: form.tipoRemuneracao,
      valorRemuneracao: Math.max(0, form.valorRemuneracao || 0),
      diasFaltou: Math.max(0, form.diasFaltou || 0),
      dataAdmissao: form.dataAdmissao,
      idade: Math.max(0, form.idade || 0),
      observacoes: form.observacoes.trim(),
      valorTotal: calcularValorTotal({
        ...form,
        diasFaltou: Math.max(0, form.diasFaltou || 0),
        valorRemuneracao: Math.max(0, form.valorRemuneracao || 0)
      } as MembroEquipe)
    };

    setMembros(prev => [...prev, novo]);
    setForm({
      nome: '',
      cargo: '',
      documento: '',
      paisDocumento: 'BR',
      tipoRemuneracao: 'hora',
      valorRemuneracao: 0,
      diasFaltou: 0,
      dataAdmissao: '',
      idade: 0,
      observacoes: ''
    });
  };

  const removerMembro = (id: string) => {
    setMembros(prev => prev.filter(m => m.id !== id));
  };

  const abrirEdicao = (membro: MembroEquipe) => {
    setEditandoId(membro.id);
    setForm({ ...membro });
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    setMembros(prev => prev.map(m => {
      if (m.id === editandoId) {
        return {
          ...m,
          nome: form.nome.trim(),
          cargo: form.cargo.trim(),
          documento: form.documento.trim(),
          paisDocumento: form.paisDocumento,
          tipoRemuneracao: form.tipoRemuneracao,
          valorRemuneracao: Math.max(0, form.valorRemuneracao || 0),
          diasFaltou: Math.max(0, form.diasFaltou || 0),
          dataAdmissao: form.dataAdmissao,
          idade: Math.max(0, form.idade || 0),
          observacoes: form.observacoes.trim(),
          valorTotal: calcularValorTotal({
            ...form,
            diasFaltou: Math.max(0, form.diasFaltou || 0),
            valorRemuneracao: Math.max(0, form.valorRemuneracao || 0)
          } as MembroEquipe)
        };
      }
      return m;
    }));
    setEditandoId(null);
    setForm({
      nome: '',
      cargo: '',
      documento: '',
      paisDocumento: 'BR',
      tipoRemuneracao: 'hora',
      valorRemuneracao: 0,
      diasFaltou: 0,
      dataAdmissao: '',
      idade: 0,
      observacoes: ''
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm({
      nome: '',
      cargo: '',
      documento: '',
      paisDocumento: 'BR',
      tipoRemuneracao: 'hora',
      valorRemuneracao: 0,
      diasFaltou: 0,
      dataAdmissao: '',
      idade: 0,
      observacoes: ''
    });
  };

  const tipoRemuneracaoLabel = (tipo: string) => tipo === 'hora' ? 'Por Hora' : 'Por Dia';
  const paisLabel = (pais: string) => FORMATOS_DOCUMENTO[pais]?.label || 'Documento';
  const valorTotalGeral = calcularTotalGeral();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-indigo-600" size={24} />
          <div>
            <h3 className="font-bold text-gray-900">Equipe da Fase</h3>
            <p className="text-xs text-gray-500">
              {membros.length} pessoa{membros.length !== 1 ? 's' : ''} • 
              Custo total: R$ {valorTotalGeral.toFixed(2).replace('.', ',')}
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
              <Plus size={16} className="text-indigo-600" />
              Adicionar Membro da Equipe
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="Ex: Pedreiro, Eletricista..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Remuneração</label>
                <select
                  value={form.tipoRemuneracao}
                  onChange={e => setForm({ ...form, tipoRemuneracao: e.target.value as 'hora' | 'diaria' })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                >
                  <option value="hora">Por Hora (R$/h)</option>
                  <option value="diaria">Por Dia (R$/dia)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Valor Unitário</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valorRemuneracao}
                  onChange={e => setForm({ ...form, valorRemuneracao: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">País do Documento</label>
                <select
                  value={form.paisDocumento}
                  onChange={e => setForm({ ...form, paisDocumento: e.target.value as 'US' | 'CA' | 'BR' | 'OUTRO' })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                >
                  <option value="BR">Brasil (CPF)</option>
                  <option value="US">EUA (SSN)</option>
                  <option value="CA">Canadá (SIN)</option>
                  <option value="OUTRO">Outro País</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  {FORMATOS_DOCUMENTO[form.paisDocumento].exemplo}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
                <input
                  type="text"
                  value={form.documento}
                  onChange={e => setForm({ ...form, documento: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  placeholder={FORMATOS_DOCUMENTO[form.paisDocumento].exemplo}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Dias Faltou</label>
                <input
                  type="number"
                  min="0"
                  value={form.diasFaltou}
                  onChange={e => setForm({ ...form, diasFaltou: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Data Admissão</label>
                <input
                  type="date"
                  value={form.dataAdmissao}
                  onChange={e => setForm({ ...form, dataAdmissao: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Idade</label>
                <input
                  type="number"
                  min="0"
                  value={form.idade}
                  onChange={e => setForm({ ...form, idade: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
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
                  onClick={adicionarMembro}
                  disabled={!form.nome.trim() || !form.documento.trim()}
                  className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Adicionar Membro
                </button>
              </div>
            </div>
          </div>
        )}

        {membros.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum membro da equipe adicionado.</p>
            {!isReadOnly && <p className="text-xs mt-1">Use o formulário acima para lançar os trabalhadores.</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {membros.map((membro) => {
              const isEditing = editandoId === membro.id;
              const diasTrabalhados = Math.max(0, DIAS_UTEIS_MES - (membro.diasFaltou || 0));
              const formatoDoc = FORMATOS_DOCUMENTO[membro.paisDocumento];

              return (
                <div key={membro.id} className="p-5 hover:bg-gray-50 transition">
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
                          <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
                          <input
                            value={form.cargo}
                            onChange={e => setForm({ ...form, cargo: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Remuneração</label>
                          <select
                            value={form.tipoRemuneracao}
                            onChange={e => setForm({ ...form, tipoRemuneracao: e.target.value as 'hora' | 'diaria' })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          >
                            <option value="hora">Por Hora</option>
                            <option value="diaria">Por Dia</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Valor Unitário</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.valorRemuneracao}
                            onChange={e => setForm({ ...form, valorRemuneracao: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">País Documento</label>
                          <select
                            value={form.paisDocumento}
                            onChange={e => setForm({ ...form, paisDocumento: e.target.value as 'US' | 'CA' | 'BR' | 'OUTRO' })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          >
                            <option value="BR">Brasil (CPF)</option>
                            <option value="US">EUA (SSN)</option>
                            <option value="CA">Canadá (SIN)</option>
                            <option value="OUTRO">Outro País</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
                          <input
                            value={form.documento}
                            onChange={e => setForm({ ...form, documento: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Dias Faltou</label>
                          <input
                            type="number"
                            min="0"
                            value={form.diasFaltou}
                            onChange={e => setForm({ ...form, diasFaltou: Math.max(0, Number(e.target.value) || 0) })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Admissão</label>
                          <input
                            type="date"
                            value={form.dataAdmissao}
                            onChange={e => setForm({ ...form, dataAdmissao: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Idade</label>
                          <input
                            type="number"
                            min="0"
                            value={form.idade}
                            onChange={e => setForm({ ...form, idade: Math.max(0, Number(e.target.value) || 0) })}
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
                          <span className="font-semibold text-gray-900 truncate">{membro.nome}</span>
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                            {membro.cargo}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span><IdCard size={14} className="mr-1" /> {membro.documento}</span>
                          <span className="text-xs text-gray-400">{formatoDoc.label}</span>
                          <span><Calendar size={14} className="mr-1" /> Adm: {membro.dataAdmissao || '—'}</span>
                          <span><AlertTriangle size={14} className="mr-1" /> Faltou: {membro.diasFaltou} dia{membro.diasFaltou !== 1 ? 's' : ''}</span>
                          <span><Clock size={14} className="mr-1" /> {tipoRemuneracaoLabel(membro.tipoRemuneracao)}</span>
                          <span><Scale size={14} className="mr-1" /> R$ {membro.valorRemuneracao.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>Idade: {membro.idade}</span>
                          <span>Dias trabalhados (mês): {diasTrabalhados}</span>
                        </div>
                        {membro.observacoes && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500 italic">{membro.observacoes}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          R$ {calcularValorTotal(membro).toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {diasTrabalhados} dias × {membro.valorRemuneracao.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => abrirEdicao(membro)}
                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => removerMembro(membro.id)}
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
            <span className="text-sm font-medium text-gray-600">Custo Total da Equipe</span>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            R$ {valorTotalGeral.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>
    </div>
  );
};
