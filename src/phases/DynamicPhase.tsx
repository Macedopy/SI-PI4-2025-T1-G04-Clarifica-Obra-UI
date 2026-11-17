import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Camera, Hammer, Package, Truck, Users, Wrench, 
  Info, AlertTriangle, FileText 
} from "lucide-react";
import { PhaseLayout } from "../components/PhaseLayout";
import { SecaoConteudo } from "../components/SecaoConteudo";
import { PhaseAnnotations } from "../components/PhaseAnnotations";
import { CostControl } from "../components/CostControl";
import { useUserType } from "../contexts/UserTypeContext";
import { usePhasesData } from "../contexts/PhasesContext";
import { useUiSize } from "../contexts/UiSizeContext";

const ICON_MAP: Record<string, any> = {
  geral: Info,
  equipe: Users,
  servicos: Wrench,
  maquinarios: Truck,
  materiais: Package,
  ferramentas: Hammer,
  fotos: Camera,
  observacoes: AlertTriangle,
};

const NAME_MAP: Record<string, string> = {
  geral: "Geral",
  equipe: "Equipe",
  servicos: "Serviços",
  maquinarios: "Maquinários",
  materiais: "Materiais",
  ferramentas: "Ferramentas",
  fotos: "Fotos",
  observacoes: "Observações",
};

interface DynamicPhaseProps {
  phaseId: string;
  phaseName: string;
  componentIds: string[];
  constructionId?: string;
}

export const DynamicPhase: React.FC<DynamicPhaseProps> = ({ phaseId, phaseName, componentIds, constructionId }) => {
  const { customerId, userType } = useUserType();
  const { phases, phasesData, loading } = usePhasesData();
  const { uiSize, size } = useUiSize();
  const [showFixedAction, setShowFixedAction] = useState(false);
  const actionRef = useRef<HTMLDivElement | null>(null);

  // O botão nasce no fim do conteúdo da fase. Quando ele sai por cima da tela
  // (ou seja, o usuário já passou para as anotações), a barra fixa aparece embaixo.
  useEffect(() => {
    if (loading || userType === 'CLIENT') {
      setShowFixedAction(false);
      return;
    }

    const update = () => {
      const el = actionRef.current;
      if (!el) return;
      setShowFixedAction(el.getBoundingClientRect().bottom < 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [loading, userType, phaseId]);

  if (loading) return <div className="p-10 text-center text-xl font-semibold">Carregando dados da fase...</div>;

  const initialData = phasesData[phaseId] || {};
  const phaseInfo = phases.find((phase) => phase.id === phaseId);

  const secoes = componentIds.map(id => ({
    id,
    nome: NAME_MAP[id] || id,
    icon: ICON_MAP[id] || FileText
  }));

  const handleSave = async (dados: any) => {
    try {
      const res = await fetch(`http://localhost:8080/dynamic-phase/${phaseId}/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (res.ok) {
        alert(`Relatório de ${phaseName} enviado com sucesso!`);
      } else {
        alert("Erro ao enviar o relatório. Tente novamente.");
      }
    } catch (err) {
      alert("Falha na conexão com o servidor.");
    }
  };

  const readStored = (key: string, fallback: any) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const handleSendReport = () => {
    const dadosDaFase = {
      geral: readStored(`geral-fase-${phaseId}`, {}),
      equipe: readStored(`equipe-fase-${phaseId}`, []),
      servicos: readStored(`servicos-fase-${phaseId}`, []),
      maquinarios: readStored(`maquinarios-fase-${phaseId}`, []),
      materiais: readStored(`materiais-fase-${phaseId}`, []),
      ferramentas: readStored(`ferramentas-fase-${phaseId}`, []),
      fotos: readStored(`fotos-fase-${phaseId}`, []),
    };

    handleSave(initialData ? { ...initialData, ...dadosDaFase } : dadosDaFase);
  };

  return (
    <div className={showFixedAction ? 'pb-24' : ''}>
      <PhaseLayout
        phase={{ id: phaseId, nome: phaseName, icon: phaseInfo?.icon || Package, secoes }}
        initialData={initialData}
      >
        {componentIds.map(id => (
          <SecaoConteudo 
            key={id}
            secaoId={id} 
            faseId={phaseId} 
            initialData={initialData[id] || (id === 'equipe' ? initialData.teamMembers : initialData[id])}
            isReadOnly={userType === 'CLIENT'}
          />
        ))}
      </PhaseLayout>

      {/* Botão original: permanece no lugar, no fim do conteúdo da fase */}
      {userType !== 'CLIENT' && (
        <div ref={actionRef} className="flex justify-center md:justify-end mt-4 md:mt-8">
          <button
            onClick={handleSendReport}
            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-5 rounded-2xl shadow-2xl transition transform hover:scale-105"
          >
            Enviar Relatório – {phaseName}
          </button>
        </div>
      )}

      {/* Anotações da fase - visível para Mestre de Obras e Proprietário */}
      {userType !== 'CLIENT' && (
        <PhaseAnnotations
          phaseId={phaseId}
          userId={customerId || ''}
          userRole={userType || ''}
        />
      )}

      {/* Lançamento de custos - feito dentro de cada fase (Mestre/Proprietário) */}
      {userType !== 'CLIENT' && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <CostControl
            mode="entry"
            phaseId={phaseId}
            userId={customerId || ''}
            userRole={userType || ''}
            constructionId={constructionId || ''}
          />
        </div>
      )}

      {/* Barra fixa: aparece depois de passar o botão original (já nas anotações) */}
      {showFixedAction && userType !== 'CLIENT' && createPortal(
        <div className="fixed inset-x-0 bottom-0 z-[120] bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-6px_20px_rgba(0,0,0,0.10)]">
          <div
            className="mx-auto px-4 sm:px-6 py-3 flex justify-end"
            style={{ maxWidth: uiSize === 'large' ? '108rem' : size.maxWidth }}
          >
            <button
              type="button"
              onClick={handleSendReport}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base sm:text-lg px-6 sm:px-10 py-3 rounded-xl shadow-lg transition transform hover:scale-[1.02]"
            >
              <span className="hidden sm:inline">Enviar Relatório – {phaseName}</span>
              <span className="sm:hidden">Enviar Relatório</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
