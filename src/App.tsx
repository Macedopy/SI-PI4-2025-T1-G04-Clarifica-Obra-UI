// src/App.tsx
import React from "react";
import { PhasesBreadcrumb } from "./components/PhasesBreadcrumb";

// === IMPORTAÇÃO DAS 10 FASES ===
import { FasePreparacaoTerreno } from "./phases/FasePreparacaoTerreno";
import { FaseFundacao } from "./phases/FaseFundacao";
import { FaseEstrutura } from "./phases/FaseEstrutura";
import { FaseAlvenaria } from "./phases/FaseAlvenaria";
import { FaseCobertura } from "./phases/FaseCobertura";
import { FaseInstalacoesHidraulicas } from "./phases/FaseInstalacoesHidraulicas";
import { FaseInstalacoesEletricas } from "./phases/FaseInstalacoesEletricas";
import { FaseRevestimentos } from "./phases/FaseRevestimentos";
import { FaseAcabamentos } from "./phases/FaseAcabamentos";
import { ObraProvider } from "./contexts/ObraContext";
import { usePhaseNavigation, PhasesProvider } from "./contexts/PhasesContext";

const phaseComponents: Record<string, React.FC> = {
  preparacao: FasePreparacaoTerreno,
  fundacao: FaseFundacao,
  estrutura: FaseEstrutura,
  alvenaria: FaseAlvenaria,
  cobertura: FaseCobertura,
  "instalacoes-hidraulicas": FaseInstalacoesHidraulicas,
  "instalacoes-eletricas": FaseInstalacoesEletricas,
  revestimentos: FaseRevestimentos,
  acabamentos: FaseAcabamentos,
};

// === COMPONENTE QUE MOSTRA A FASE ATUAL ===
const AppContent = () => {
  const { currentPhaseId } = usePhaseNavigation();

  // Pega o componente correto ou cai na primeira fase
  const CurrentPhaseComponent = phaseComponents[currentPhaseId] || FasePreparacaoTerreno;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-10 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold">Clarifica Obra</h1>
          <p className="text-xl mt-3 opacity-90">
            Gerenciamento completo da sua construção
          </p>
        </div>
      </header>

      {/* Breadcrumb de fases (com progresso real) */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <PhasesBreadcrumb />
        </div>
      </div>

      {/* Conteúdo da fase atual */}
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <CurrentPhaseComponent />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8 mt-20">
        <p className="text-sm">
          © 2025 Clarifica Obra — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

// === APP PRINCIPAL (com os dois Providers) ===
export default function App() {
  return (
    <ObraProvider>
      <PhasesProvider>
        <AppContent />
      </PhasesProvider>
    </ObraProvider>
  );
}