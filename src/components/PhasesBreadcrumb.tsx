//Responsável: Bruno Macedo, Bruno Martins, Felipe Teles
// src/components/PhasesBreadcrumb.tsx
import React, { useEffect, useState } from "react";
import { 
  Package, CheckCircle, LayoutDashboard, Plus, Trash2 
} from "lucide-react";
import { useObra } from "../contexts/ObraContext";
import { usePhaseNavigation, usePhasesData } from "../contexts/PhasesContext";
import { useUserType } from "../contexts/UserTypeContext";
import { useLocale } from "../contexts/LocaleContext";
import { UserType } from "../types/UserTypes";
import { CreatePhaseModal } from "./CreatePhaseModal";
import { deletePhase } from "../services/phases.service";

export const PhasesBreadcrumb = () => {
  const { currentPhaseId, setCurrentPhaseId } = usePhaseNavigation();
  const { phases, refreshPhases } = usePhasesData();
  const { getPhaseProgress, updateSecaoProgress } = useObra();
  const { userType, customerId } = useUserType();
  const { t } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [constructionId, setConstructionId] = useState<string>('');
  const [constructionLoading, setConstructionLoading] = useState(false);
   
  // Normalização para evitar problemas de case-sensitivity ou strings antigas no localStorage
  const normalizedUserType = userType?.toUpperCase();
  const canEdit = normalizedUserType !== 'CLIENT' && normalizedUserType !== 'CLIENTE' && userType !== null;

  console.log("PhasesBreadcrumb Debug - Original:", userType, "Normalized:", normalizedUserType, "CanEdit:", canEdit);

  useEffect(() => {
    if (currentPhaseId && currentPhaseId !== "dashboard") {
      updateSecaoProgress(currentPhaseId, 'some-section', getPhaseProgress(currentPhaseId));
    }
  }, [currentPhaseId, updateSecaoProgress, getPhaseProgress]);

  // Carrega a obra do usuário para obter o constructionId e templateId
  useEffect(() => {
    if (!customerId) return;
    setConstructionLoading(true);
    fetch(`http://localhost:8080/constructions/user/${customerId}`)
      .then(async (res) => {
        if (res.ok) {
          const data: any[] = await res.json();
          if (data && data.length > 0) {
            setConstructionId(data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setConstructionLoading(false));
  }, [customerId]);

  // Traduz o nome da fase usando a chave do template ou o nome como fallback
  const getPhaseDisplayName = (fase: any): string => {
    const templatePhaseId = fase.templatePhaseId || fase.id;
    return t(`phase.${templatePhaseId}`, {}) || fase.nome;
  };

  const handleDeletePhase = async (e: React.MouseEvent, phaseId: string) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta fase? Isso recalculará o dashboard.")) return;

    try {
      const success = await deletePhase(phaseId, customerId || "");

      if (success) {
        await refreshPhases();
        if (currentPhaseId === phaseId) setCurrentPhaseId("dashboard");
        alert("Fase excluída com sucesso!");
      } else {
        alert("Erro ao excluir fase.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha na conexão.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 py-3 items-center">
        
        {/* Botão de Adição (Estilizado como os botões de fase) */}
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 border border-dashed border-gray-300"
            title="Adicionar Nova Fase"
          >
            <Plus size={16} />
            <span>Nova Fase</span>
          </button>
        )}

        {/* Separador Visual */}
        {canEdit && <div className="hidden md:block w-px h-6 bg-gray-200 mx-1 self-center"></div>}

        {/* Renderiza os botões das Fases */}
        {Array.isArray(phases) && phases.map((fase) => {
          const Icon = (fase as any).icon || Package;
          const isActive = currentPhaseId === fase.id;
          const progresso = getPhaseProgress(fase.id);
          const isCompleted = progresso === 100;

          return (
            <div key={fase.id} className="relative group">
              <button
                onClick={() => setCurrentPhaseId(fase.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-200"
                    : isCompleted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={`${getPhaseDisplayName(fase)}: ${progresso}%`}
              >
                <Icon size={16} />
                <span>{getPhaseDisplayName(fase)}</span>
                {isCompleted && <CheckCircle size={14} className="ml-0.5" />}
              </button>
              
              {canEdit && !isActive && (
                <button 
                  onClick={(e) => handleDeletePhase(e, fase.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}

        {/* Separador Visual */}
        <div className="hidden md:block w-px h-6 bg-gray-200 mx-1 self-center"></div>

        {/* Botão Especial do Dashboard */}
        <button
          onClick={() => setCurrentPhaseId("dashboard")}
          className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPhaseId === "dashboard"
              ? "bg-indigo-700 text-white shadow-sm ring-2 ring-indigo-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
          title="Visão Geral da Obra"
        >
          <LayoutDashboard size={16} />
          <span className="hidden sm:inline">Dashboard Geral</span>
          <span className="sm:hidden font-bold">Dash</span>
        </button>
      </div>

      <CreatePhaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        constructionId={constructionId}
      />
    </>
  );
};
