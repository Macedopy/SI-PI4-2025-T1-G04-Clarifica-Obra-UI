//Responsável de User: Bruno Macedo

import React, { useState, useEffect } from "react";
import { PhasesBreadcrumb } from "./components/PhasesBreadcrumb";
import Login from "./components/Login";

import { ResumoDashboard } from "./components/dashboard/dashboard"; 
import { ObraProvider } from "./contexts/ObraContext";
import { usePhaseNavigation, PhasesProvider, usePhasesData } from "./contexts/PhasesContext";
import { UserTypeProvider, useUserType } from "./contexts/UserTypeContext";
import { DynamicPhase } from "./phases/DynamicPhase";
import { ConstructionLoader } from "./components/general/ConstructionLoader";
import { UserMenu } from "./components/UserMenu";
import { UiSizeProvider, useUiSize } from "./contexts/UiSizeContext";
import { LocaleProvider } from "./contexts/LocaleContext";

const AppContent = () => {
  const { currentPhaseId } = usePhaseNavigation();
  const { phases } = usePhasesData();
  const { isAuthenticated, loading, customerId } = useUserType();
  const [constructionId, setConstructionId] = useState<string | null>(null);

  useEffect(() => {
    if (customerId && !constructionId) {
      fetch(`http://localhost:8080/constructions/user/${customerId}`, { credentials: 'include' })
        .then(async (res) => {
          if (res.ok) {
            const data: any[] = await res.json();
            if (data && data.length > 0) {
              setConstructionId(data[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [customerId, constructionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ConstructionLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Se estiver no dashboard, renderiza o ResumoDashboard
  if (currentPhaseId === "dashboard") {
    return (
      <LayoutWrapper>
        <ResumoDashboard constructionId={constructionId || undefined} />
      </LayoutWrapper>
    );
  }

  // Se houver uma fase selecionada, tenta renderizá-la dinamicamente
  const dynamicPhaseInfo = phases.find(p => p.id === currentPhaseId);
  
  const renderContent = () => {
    if (dynamicPhaseInfo) {
      return (
        <DynamicPhase 
          phaseId={dynamicPhaseInfo.id} 
          phaseName={dynamicPhaseInfo.nome} 
          componentIds={dynamicPhaseInfo.components || []}
          constructionId={constructionId || undefined}
        />
      );
    }
    // Se não houver nada criado, mostra uma mensagem amigável ou o dashboard
    return <ResumoDashboard constructionId={constructionId || undefined} />;
  };

  return (
    <LayoutWrapper>
      {renderContent()}
    </LayoutWrapper>
  );
};

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LocaleProvider>
    <UiSizeProvider>
      <LayoutShell>{children}</LayoutShell>
    </UiSizeProvider>
  </LocaleProvider>
);

const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uiSize, size } = useUiSize();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior: navegação das fases + menu do usuário */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3"
          style={uiSize === 'large' ? { maxWidth: '108rem' } : undefined}
        >
          <div className="flex-1 min-w-0">
            <PhasesBreadcrumb />
          </div>
          <div className="flex-shrink-0 self-stretch flex items-center pl-3 border-l border-gray-200">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Conteúdo dinâmico */}
      <main
        className="container mx-auto px-6 py-10"
        style={{ maxWidth: size.maxWidth, zoom: size.zoom }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white text-gray-400 text-center py-6 mt-16">
        <p className="text-xs">
          © 2025 RepObra — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <UserTypeProvider>
      <ObraProvider>
        <PhasesProvider>
          <AppContent />
        </PhasesProvider>
      </ObraProvider>
    </UserTypeProvider>
  );
}
