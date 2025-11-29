// src/components/dashboard/ResumoDashboard.tsx
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

interface ResumoDashboardProps {
  isReadOnly?: boolean;
}

export const ResumoDashboard = ({ isReadOnly = false }: ResumoDashboardProps) => {
  // Dados mock (depois você pode vir do contexto ou backend)
  const progressoGeral = 68;
  const fasesConcluidas = 3;
  const fasesEmAndamento = 2;
  const totalFases = 10;

  const fases = [
    { nome: "Preparação do Terreno", progresso: 100 },
    { nome: "Fundação", progresso: 100 },
    { nome: "Estrutura", progresso: 65 },
    { nome: "Alvenaria", progresso: 0 },
    { nome: "Cobertura", progresso: 0 },
    { nome: "Inst. Hidráulicas", progresso: 0 },
    { nome: "Inst. Elétricas", progresso: 0 },
    { nome: "Revestimentos", progresso: 0 },
    { nome: "Acabamentos", progresso: 0 },
  ];

  const handleEnviarRelatorioFinal = () => {
    alert("Relatório final da obra enviado com sucesso!");
    // Aqui você chama sua API
  };

  return (
    <div className="space-y-10">
      {/* Título */}
      <h3 className="text-3xl font-bold flex items-center gap-4 text-gray-800">
        <TrendingUp className="text-green-600" size={40} />
        Resumo Geral da Obra
      </h3>

      {/* Progresso Geral */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-10 rounded-3xl shadow-2xl text-center">
        <div className="text-6xl font-extrabold mb-4">{progressoGeral}%</div>
        <div className="text-2xl opacity-90">Progresso Total da Construção</div>
        <div className="mt-6 w-full bg-white bg-opacity-30 rounded-full h-8 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progressoGeral}%` }}
          />
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition">
          <CheckCircle size={60} className="mx-auto mb-4" />
          <div className="text-5xl font-bold">{fasesConcluidas}</div>
          <div className="text-xl mt-2 opacity-90">Fases Concluídas</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition">
          <Clock size={60} className="mx-auto mb-4" />
          <div className="text-5xl font-bold">{fasesEmAndamento}</div>
          <div className="text-xl mt-2 opacity-90">Em Andamento</div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-700 text-white p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition">
          <AlertCircle size={60} className="mx-auto mb-4" />
          <div className="text-5xl font-bold">{totalFases - fasesConcluidas - fasesEmAndamento}</div>
          <div className="text-xl mt-2 opacity-90">Pendentes</div>
        </div>
      </div>

      {/* Timeline das Fases */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h4 className="text-2xl font-bold mb-8 text-gray-800">Timeline das Fases</h4>
        <div className="space-y-6">
          {fases.map((fase, i) => (
            <div key={i} className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                  fase.progresso === 100
                    ? "bg-green-500"
                    : fase.progresso > 0
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }`}
              >
                {fase.progresso === 100 ? <CheckCircle size={28} /> : i + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">{fase.nome}</span>
                  <span className="text-sm font-medium text-gray-600">{fase.progresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      fase.progresso === 100 ? "bg-green-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${fase.progresso}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensagem motivacional */}
      <div className="text-center py-8">
        <p className="text-3xl font-bold text-gray-700">
          Faltam apenas{" "}
          <span className="text-5xl text-blue-600">
            {totalFases - fasesConcluidas - fasesEmAndamento}
          </span>{" "}
          fases para a entrega!
        </p>
      </div>

      {/* BOTÃO GRANDE NO FINAL */}
      <div className="flex justify-center pt-10">
        <button
          onClick={handleEnviarRelatorioFinal}
          disabled={isReadOnly}
          className={`
            px-12 py-6 text-2xl font-bold text-white rounded-2xl shadow-2xl transition-all transform
            ${isReadOnly 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105"
            }
          `}
        >
          Enviar Relatório Final da Obra
        </button>
      </div>
    </div>
  );
};
