import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Square, Mountain, User, Edit3, Save, X } from 'lucide-react';

interface InfoGeral {
  endereco: string;
  areaTerreno: number;
  topografia: 'plana' | 'inclinada' | 'acidentada' | 'com desnível';
  dataInicio: string;
  responsavel: string;
  observacao: string;
}

interface InformacoesGeraisProps {
  isReadOnly?: boolean;
  faseId: string;
  initialData?: InfoGeral;
}

export const InformacoesGerais: React.FC<InformacoesGeraisProps> = ({
  isReadOnly = false,
  faseId,
  initialData
}) => {
  const STORAGE_KEY = `info-geral-fase-${faseId}`;
  const [editando, setEditando] = useState(false);
  const [info, setInfo] = useState<InfoGeral>({
    endereco: '',
    areaTerreno: 0,
    topografia: 'plana',
    dataInicio: new Date().toISOString().split('T')[0],
    responsavel: '',
    observacao: ''
  });

  useEffect(() => {
    if (initialData) {
      setInfo(initialData);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setInfo({ ...info, ...parsed });
      }
    }
  }, [faseId, initialData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  }, [info]);

  const salvar = () => {
    setEditando(false);
  };

  const cancelar = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setInfo(JSON.parse(saved));
    }
    setEditando(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-cyan-600" size={28} />
          <h3 className="text-xl font-bold">Informações Gerais</h3>
        </div>
        {!isReadOnly && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition shadow"
          >
            <Edit3 size={18} />
            Editar
          </button>
        )}
      </div>

      <div className={`space-y-5 ${editando ? 'ring-2 ring-cyan-500 bg-cyan-50 p-5 rounded-xl' : ''}`}>
        {/* Endereço */}
        <div className="flex items-start gap-3">
          <MapPin className="text-cyan-600 mt-1" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Localização</p>
            {editando ? (
              <input
                type="text"
                value={info.endereco}
                onChange={e => setInfo({ ...info, endereco: e.target.value })}
                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-cyan-500"
                placeholder="Rua, número, bairro, cidade - UF"
              />
            ) : (
              <p className="font-semibold text-gray-800">
                {info.endereco || 'Não informado'}
              </p>
            )}
          </div>
        </div>

        {/* Área */}
        <div className="flex items-start gap-3">
          <Square className="text-cyan-600 mt-1" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Área do Terreno</p>
            {editando ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={info.areaTerreno}
                  onChange={e => setInfo({ ...info, areaTerreno: Number(e.target.value) })}
                  className="w-32 p-2 border rounded focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium">m²</span>
              </div>
            ) : (
              <p className="font-bold text-2xl text-cyan-700">
                {info.areaTerreno > 0 ? `${info.areaTerreno} m²` : '—'}
              </p>
            )}
          </div>
        </div>

        {/* Topografia */}
        <div className="flex items-start gap-3">
          <Mountain className="text-cyan-600 mt-1" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Topografia</p>
            {editando ? (
              <select
                value={info.topografia}
                onChange={e => setInfo({ ...info, topografia: e.target.value as any })}
                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="plano">Plano</option>
                <option value="inclinado">Inclinado</option>
                <option value="colinoso">Colinoso</option>
                <option value="montanhoso">Montanhoso</option>
              </select>
            ) : (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                info.topografia === 'plana' ? 'bg-green-100 text-green-800' :
                info.topografia === 'inclinada' ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {info.topografia}
              </span>
            )}
          </div>
        </div>

        {/* Data de Início */}
        <div className="flex items-start gap-3">
          <Calendar className="text-cyan-600 mt-1" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Data de Início</p>
            {editando ? (
              <input
                type="date"
                value={info.dataInicio}
                onChange={e => setInfo({ ...info, dataInicio: e.target.value })}
                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-cyan-500"
              />
            ) : (
              <p className="font-semibold text-gray-800">
                {info.dataInicio ? new Date(info.dataInicio).toLocaleDateString('pt-BR') : 'Não definida'}
              </p>
            )}
          </div>
        </div>

        {/* Responsável */}
        <div className="flex items-start gap-3">
          <User className="text-cyan-600 mt-1" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Responsável Técnico</p>
            {editando ? (
              <input
                type="text"
                value={info.responsavel}
                onChange={e => setInfo({ ...info, responsavel: e.target.value })}
                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-cyan-500"
                placeholder="Nome do engenheiro ou mestre"
              />
            ) : (
              <p className="font-semibold text-gray-800">
                {info.responsavel || 'Não informado'}
              </p>
            )}
          </div>
        </div>

        {/* Observação */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-gray-600 mb-2">Observações</p>
          {editando ? (
            <textarea
              value={info.observacao}
              onChange={e => setInfo({ ...info, observacao: e.target.value })}
              className="w-full p-3 border rounded h-24 focus:ring-2 focus:ring-cyan-500"
              placeholder="Ex: Terreno com solo argiloso, acesso por estrada de terra..."
            />
          ) : (
            <p className="text-gray-700 italic">
              {info.observacao || 'Nenhuma observação adicionada.'}
            </p>
          )}
        </div>

        {/* Botões de ação */}
        {editando && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={cancelar}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow"
            >
              <Save size={16} />
              Salvar Alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
