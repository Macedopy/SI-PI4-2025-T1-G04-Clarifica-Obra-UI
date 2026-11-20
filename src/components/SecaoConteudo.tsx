//Responsável: Bruno Macedo

// src/components/SecaoConteudo.tsx
import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, TrendingUp, Package, Truck, Wrench } from "lucide-react";
import { LancamentoItensCusto } from "./LancamentoItensCusto";
import { LancamentoServicosCusto } from "./LancamentoServicosCusto";
import { LancamentoEquipeCusto } from "./LancamentoEquipeCusto";
import { InformacoesGerais } from "./general/general-information";
import { useUserType } from '../contexts/UserTypeContext';
import { UserType } from '../types/UserTypes';

interface SecaoConteudoProps {
  secaoId: string;
  faseId: string;
  isReadOnly?: boolean;
  initialData?: any;
  editable?: boolean;
}

export const SecaoConteudo = ({
  secaoId,
  faseId,
  isReadOnly = false,
  initialData,
  editable = false,
}: SecaoConteudoProps & Omit<React.HTMLAttributes<HTMLDivElement>, keyof SecaoConteudoProps>) => {
  const { userType } = useUserType();
  const effectiveIsReadOnly = isReadOnly || userType === UserType.Cliente;
  const effectiveEditable = editable && userType !== UserType.Cliente;

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(initialData);

  useEffect(() => {
    if (effectiveEditable && !editMode) {
      setEditMode(true);
    } else if (!effectiveEditable && editMode) {
      setEditMode(false);
    }
  }, [effectiveEditable, editMode]);

  const handleInputChange = (field: string, value: string) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
  };

  if (secaoId === "fotos") {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <Camera className="text-blue-600" size={32} />
          Fotos da Fase
        </h3>
        {!effectiveIsReadOnly && (
          <div className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-400 transition cursor-pointer">
            <Camera className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600 font-medium">Clique para adicionar fotos</p>
            <p className="text-sm text-gray-500 mt-2">Suporta múltiplas imagens</p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center hover:bg-gray-300 transition">
              <span className="text-gray-500 font-medium">Foto {i}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (secaoId === "observacoes") {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <AlertTriangle className="text-yellow-600" size={32} />
          Observações e Pendências
        </h3>
        <textarea
          className="w-full p-5 border-2 border-gray-300 rounded-xl h-48 text-lg resize-none focus:border-blue-500 focus:outline-none transition"
          placeholder="Adicione observações importantes, pendências ou alertas desta fase..."
          disabled={effectiveIsReadOnly || !effectiveEditable}
          value={localData?.observacoes || ""}
          onChange={(e) => handleInputChange('observacoes', e.target.value)}
        />
        <div className="flex gap-4 mt-4">
          {effectiveEditable ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleSave}
            >
              Salvar
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-not-allowed"
              disabled
            >
              Visualizar
            </button>
          )}
        </div>
        <div className="space-y-4 mt-8">
          <div className="p-5 bg-yellow-50 border-l-8 border-yellow-500 rounded-r-xl">
            <div className="font-bold text-yellow-900">Aguardando aprovação do cliente</div>
            <div className="text-sm text-yellow-700 mt-1">Alteração no projeto de elétrica</div>
          </div>
          <div className="p-5 bg-red-50 border-l-8 border-red-500 rounded-r-xl">
            <div className="font-bold text-red-900">Atraso na entrega de material</div>
            <div className="text-sm text-red-700 mt-1">Aço CA-50 previsto para 28/04</div>
          </div>
        </div>
      </div>
    );
  }

  if (secaoId === "resumo") {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <TrendingUp className="text-green-600" size={32} />
          Resumo Final da Obra
        </h3>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-10 rounded-2xl shadow-2xl">
          <h4 className="text-3xl font-bold mb-4">Obra Concluída com Sucesso!</h4>
          <p className="text-xl opacity-90">Todas as fases foram finalizadas dentro do prazo e com qualidade.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-green-100 p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-green-600">100%</div>
            <div className="text-lg font-medium text-green-800">Conclusão</div>
          </div>
          <div className="bg-blue-100 p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-blue-600">10</div>
            <div className="text-lg font-medium text-blue-800">Fases</div>
          </div>
          <div className="bg-purple-100 p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-purple-600">0</div>
            <div className="text-lg font-medium text-purple-800">Pendências</div>
          </div>
        </div>
      </div>
    );
  }

  if (secaoId === "materiais") {
    return <LancamentoItensCusto faseId={faseId} secaoId="materiais" secaoNome="Materiais" isReadOnly={effectiveIsReadOnly} />;
  }

  if (secaoId === "servicos") {
    return <LancamentoServicosCusto faseId={faseId} isReadOnly={effectiveIsReadOnly} />;
  }

  if (secaoId === "equipe") {
    return <LancamentoEquipeCusto faseId={faseId} isReadOnly={effectiveIsReadOnly} />;
  }

  if (secaoId === "maquinarios") {
    return <LancamentoItensCusto faseId={faseId} secaoId="maquinarios" secaoNome="Maquinários" isReadOnly={effectiveIsReadOnly} />;
  }

  if (secaoId === "ferramentas") {
    return <LancamentoItensCusto faseId={faseId} secaoId="ferramentas" secaoNome="Ferramentas" isReadOnly={effectiveIsReadOnly} />;
  }

  if (secaoId === "geral") {
    return <InformacoesGerais isReadOnly={effectiveIsReadOnly} faseId={faseId} initialData={initialData} />;
  }

  return null;
};
