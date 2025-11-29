// src/components/PhasesBreadcrumb.tsx
import { 
  Calendar, Wrench, Package, CheckCircle 
} from "lucide-react";
import { useObra } from "../contexts/ObraContext";
import { usePhaseNavigation } from "../contexts/PhasesContext";

const fases = [
  { id: "preparacao", nome: "Preparação", icon: Calendar },
  { id: "fundacao", nome: "Fundação", icon: Wrench },
  { id: "estrutura", nome: "Estrutura", icon: Package },
  { id: "alvenaria", nome: "Alvenaria", icon: Wrench },
  { id: "cobertura", nome: "Cobertura", icon: Package },
  { id: "instalacoes-hidraulicas", nome: "Inst. Hidráulicas", icon: Wrench },
  { id: "instalacoes-eletricas", nome: "Inst. Elétricas", icon: Wrench },
  { id: "revestimentos", nome: "Revestimentos", icon: Package },
  { id: "acabamentos", nome: "Acabamentos", icon: Package },
] as const;

export const PhasesBreadcrumb = () => {
  const { currentPhaseId, setCurrentPhaseId } = usePhaseNavigation();
  const { getPhaseProgress } = useObra();

  return (
    <div className="flex flex-wrap justify-center gap-3 py-4 bg-white shadow-md">
      {fases.map((fase, index) => {
        const Icon = fase.icon;
        const isActive = currentPhaseId === fase.id;
        const progresso = getPhaseProgress(fase.id);
        const isCompleted = progresso === 100;

        return (
          <button
            key={fase.id}
            onClick={() => setCurrentPhaseId(fase.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              isActive
                ? "bg-blue-600 text-white shadow-2xl ring-4 ring-blue-300"
                : isCompleted
                ? "bg-green-500 text-white hover:bg-green-600 shadow-xl"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={`${fase.nome}: ${progresso}%`}
          >
            <Icon size={22} />
            <span className="hidden sm:inline">{fase.nome}</span>
            <span className="sm:hidden font-bold">{index + 1}</span>
            {isCompleted && <CheckCircle size={18} className="ml-1" />}
          </button>
        );
      })}
    </div>
  );
};
