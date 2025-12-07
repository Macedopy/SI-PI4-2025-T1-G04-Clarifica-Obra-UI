//Responsável: Bruno Macedo, Bruno Martins, Felipe Teles

// src/components/dashboard/ResumoDashboard.tsx
import React from "react";
import { 
  CheckCircle, Clock, AlertCircle, TrendingUp,
  Calendar, Wrench, Package, Truck, Users, Hammer, Camera 
} from "lucide-react";
import { usePhasesData } from "../contexts/PhasesContext";
import { useObra } from "../contexts/ObraContext";

interface ResumoDashboardProps {
  isReadOnly?: boolean;
}

const fasesConfig = [
  { id: "preparacao", nome: "Preparação do Terreno", icon: Calendar },
  { id: "fundacao", nome: "Fundação", icon: Wrench },
  { id: "estrutura", nome: "Estrutura", icon: Package },
  { id: "alvenaria", nome: "Alvenaria", icon: Wrench },
  { id: "cobertura", nome: "Cobertura", icon: Package },
  { id: "instalacoes-hidraulicas", nome: "Inst. Hidráulicas", icon: Wrench },
  { id: "instalacoes-eletricas", nome: "Inst. Elétricas", icon: Wrench },
  { id: "revestimentos", nome: "Revestimentos", icon: Package },
  { id: "acabamentos", nome: "Acabamentos", icon: Package },
  { id: "finalizacao", nome: "Finalização", icon: CheckCircle },
];

export const ResumoDashboard = ({ isReadOnly = false }: ResumoDashboardProps) => {
  // 1. Traz os dados reais do Backend e a função de cálculo
  const { loading, error } = usePhasesData();
  const { getPhaseProgress } = useObra();

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando dados da obra...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Erro ao carregar: {error}</div>;

  // 2. Cálculo dos Indicadores em Tempo Real
  let somaProgressos = 0;
  let fasesConcluidas = 0;
  let fasesEmAndamento = 0;
  const totalFases = fasesConfig.length;

  // Cria o array de fases com o progresso real para usar na timeline
  const fasesReais = fasesConfig.map((faseConfig) => {
    const progresso = getPhaseProgress(faseConfig.id);
    
    // Atualiza estatísticas
    somaProgressos += progresso;
    if (progresso === 100) fasesConcluidas++;
    else if (progresso > 0) fasesEmAndamento++;

    return {
      ...faseConfig,
      progresso: progresso
    };
  });

  const fasesPendentes = totalFases - fasesConcluidas - fasesEmAndamento;
  
  // Média simples do progresso total da obra
  const progressoGeral = Math.round(somaProgressos / totalFases);

  const handleEnviarRelatorioFinal = () => {
    // Futuramente você pode implementar o POST para /finish-construction aqui
    alert("Relatório final da obra gerado com os dados atuais!");
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Título */}
      <h3 className="text-3xl font-bold flex items-center gap-4 text-gray-800">
        <TrendingUp className="text-green-600" size={40} />
        Resumo Geral da Obra
      </h3>

      {/* Progresso Geral */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden">
        {/* Efeito de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        
        <div className="text-6xl font-extrabold mb-4">{progressoGeral}%</div>
        <div className="text-2xl opacity-90">Progresso Total da Construção</div>
        <div className="mt-6 w-full bg-white bg-opacity-30 rounded-full h-8 overflow-hidden shadow-inner">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressoGeral}%` }}
          />
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition duration-300">
          <CheckCircle size={60} className="mx-auto mb-4 opacity-90" />
          <div className="text-5xl font-bold">{fasesConcluidas}</div>
          <div className="text-xl mt-2 opacity-90">Fases Concluídas</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition duration-300">
          <Clock size={60} className="mx-auto mb-4 opacity-90" />
          <div className="text-5xl font-bold">{fasesEmAndamento}</div>
          <div className="text-xl mt-2 opacity-90">Em Andamento</div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-700 text-white p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition duration-300">
          <AlertCircle size={60} className="mx-auto mb-4 opacity-90" />
          <div className="text-5xl font-bold">{fasesPendentes}</div>
          <div className="text-xl mt-2 opacity-90">Pendentes</div>
        </div>
      </div>

      {/* Timeline das Fases */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h4 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Timeline das Fases</h4>
        <div className="space-y-6">
          {fasesReais.map((fase, i) => {
             // Definindo cor baseada no status
             const isCompleted = fase.progresso === 100;
             const isStarted = fase.progresso > 0;
             
             return (
              <div key={fase.id} className="flex items-center gap-5 group">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-colors duration-500 ${
                    isCompleted
                      ? "bg-green-500"
                      : isStarted
                      ? "bg-yellow-500"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle size={28} /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-semibold text-lg ${isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                      {fase.nome}
                    </span>
                    <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {fase.progresso}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isCompleted ? "bg-green-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${fase.progresso}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mensagem motivacional */}
      <div className="text-center py-8">
        {fasesPendentes > 0 ? (
          <p className="text-3xl font-bold text-gray-700">
            Faltam apenas{" "}
            <span className="text-5xl text-blue-600 font-extrabold">
              {fasesPendentes}
            </span>{" "}
            fases para a entrega!
          </p>
        ) : (
          <p className="text-3xl font-bold text-green-600 animate-bounce">
            🎉 Todas as fases foram concluídas! A obra está pronta.
          </p>
        )}
      </div>

      {/* BOTÃO GRANDE NO FINAL */}
      <div className="flex justify-center pt-5 pb-10">
        <button
          onClick={handleEnviarRelatorioFinal}
          disabled={isReadOnly || fasesPendentes > 0} // Só habilita se tudo estiver pronto (opcional)
          className={`
            px-12 py-6 text-2xl font-bold text-white rounded-2xl shadow-2xl transition-all transform
            ${isReadOnly || fasesPendentes > 0
              ? "bg-gray-400 cursor-not-allowed opacity-70" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105"
            }
          `}
        >
          {fasesPendentes > 0 ? "Conclua as fases para finalizar" : "Enviar Relatório Final da Obra"}
        </button>
      </div>
    </div>
  );
};