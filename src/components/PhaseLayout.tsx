//Responsável: Bruno Macedo
// src/components/PhaseLayout.tsx
import { CheckCircle } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useObra } from "../contexts/ObraContext";

interface PhaseLayoutProps {
  phase: {
    id: string;
    nome: string;
    icon: any;
    secoes: { id: string; nome: string; icon: any }[];
  };
  children: ReactNode[];
  onSave: (dadosDaFase: any) => void;
  initialData?: any;
}

export const PhaseLayout = ({ phase, children, onSave, initialData }: PhaseLayoutProps) => {
  const { getPhaseProgress, updateSecaoProgress } = useObra();
  const [activeTab, setActiveTab] = useState(0);
  const progressoReal = getPhaseProgress(phase.id);
  const Icon = phase.icon;

  useEffect(() => {
    const currentPhaseId = phase.id;
    // Carregar e atualizar progresso apenas da seção de serviços a partir do localStorage ou initialData

    // Seção: servicos
    const servicosKey = `servicos-fase-${currentPhaseId}`;
    const savedServicos = localStorage.getItem(servicosKey);
    let servicosProgress = 0;
    let servicosData: { progress: number }[] = [];
    if (savedServicos) {
      servicosData = JSON.parse(savedServicos) as { progress: number }[];
    } else if (initialData?.services && initialData.services.length > 0) {
      servicosData = initialData.services as { progress: number }[];
      // Salvar no localStorage para consistência futura
      localStorage.setItem(servicosKey, JSON.stringify(initialData.services.map((service: any) => ({
        id: service.id,
        name: service.name,
        team: service.team,
        plannedHours: service.plannedHours,
        executedHours: service.executedHours,
        status: service.status,
        progress: service.progress,
        notes: service.notes
      }))));
    }
    if (servicosData.length > 0) {
      const total = servicosData.reduce((sum: number, s: { progress: number }) => sum + s.progress, 0);
      servicosProgress = Math.round(total / servicosData.length);
    }
    updateSecaoProgress(currentPhaseId, 'servicos', servicosProgress);
  }, [phase.id, activeTab, updateSecaoProgress, initialData]);

  const handleSaveWithData = () => {
    // Coleta TODOS os dados reais dessa fase do localStorage (ou do contexto)
    const dadosDaFase = {
      geral: JSON.parse(localStorage.getItem(`geral-fase-${phase.id}`) || "{}"),
      equipe: JSON.parse(localStorage.getItem(`equipe-fase-${phase.id}`) || "[]"),
      servicos: JSON.parse(localStorage.getItem(`servicos-fase-${phase.id}`) || "[]"),
      maquinarios: JSON.parse(localStorage.getItem(`maquinarios-fase-${phase.id}`) || "[]"),
      materiais: JSON.parse(localStorage.getItem(`materiais-fase-${phase.id}`) || "[]"),
      ferramentas: JSON.parse(localStorage.getItem(`ferramentas-fase-${phase.id}`) || "[]"),
      fotos: JSON.parse(localStorage.getItem(`fotos-fase-${phase.id}`) || "[]"),
    };

    // Se temos initialData, mescla com os dados atuais
    const dadosFinais = initialData ? { ...initialData, ...dadosDaFase } : dadosDaFase;

    onSave(dadosFinais); // Envia tudo pro componente da fase
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Fase */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <h2 className="text-4xl font-bold flex items-center gap-4">
            <Icon size={40} className="text-blue-600" />
            {phase.nome}
          </h2>
          <div className="text-right">
            <div className="text-5xl font-bold text-blue-600">{progressoReal}%</div>
            <div className="text-lg text-gray-600">Conclusão da fase</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span>Progresso atual</span>
            <span>{progressoReal}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${progressoReal === 100 ? "bg-green-500" : "bg-blue-600"}`}
              style={{ width: `${progressoReal}%` }}
            />
          </div>
        </div>

        {progressoReal === 100 && (
          <div className="mt-6 p-5 bg-green-50 border-2 border-green-300 rounded-xl flex items-center gap-4">
            <CheckCircle className="text-green-600" size={36} />
            <span className="text-xl font-bold text-green-800">Fase concluída com sucesso!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {phase.secoes.map((secao, i) => {
          const SecIcon = secao.icon;
          return (
            <button
              key={secao.id}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === i
                  ? "bg-blue-600 text-white shadow-xl scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <SecIcon size={22} />
              {secao.nome}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-2xl shadow-xl p-10">
        {children[activeTab]}
      </div>

      {/* Botão de Envio */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveWithData}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl transition transform hover:scale-105"
        >
          Enviar Relatório – {phase.nome}
        </button>
      </div>
    </div>
  );
};