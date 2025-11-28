import { Camera, Hammer, Package, Truck, Users, Wrench } from "lucide-react";
import { PhaseLayout } from "../components/PhaseLayout";
import { SecaoConteudo } from "../components/SecaoConteudo";

// src/phases/FaseInstalacoesEletricas.tsx

const secoes = [
  { id: "equipe", nome: "Equipe", icon: Users },
  { id: "servicos", nome: "Serviços", icon: Wrench },
  { id: "maquinarios", nome: "Maquinários", icon: Truck },
  { id: "materiais", nome: "Materiais", icon: Package },
  { id: "ferramentas", nome: "Ferramentas", icon: Hammer },
  { id: "fotos", nome: "Fotos", icon: Camera },
];

export const FaseInstalacoesEletricas = () => {
  const handleSave = async (dados: any) => {
    const payload = { phaseName: "Instalações Elétricas", contractor: "Construtora Clarifica", ...dados };
    try {
      const res = await fetch("http://localhost:8080/eletric", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      alert(res.ok ? "Relatório Elétrico enviado!" : "Erro");
    } catch { alert("Falha na conexão"); }
  };

  return (
    <PhaseLayout phase={{ id: "instalacoes-eletricas", nome: "Inst. Elétricas", icon: Wrench, secoes }} onSave={handleSave}>
      <SecaoConteudo secaoId="equipe" faseId="instalacoes-eletricas" />
      <SecaoConteudo secaoId="servicos" faseId="instalacoes-eletricas" />
      <SecaoConteudo secaoId="maquinarios" faseId="instalacoes-eletricas" />
      <SecaoConteudo secaoId="materiais" faseId="instalacoes-eletricas" />
      <SecaoConteudo secaoId="ferramentas" faseId="instalacoes-eletricas" />
      <SecaoConteudo secaoId="fotos" faseId="instalacoes-eletricas" />
    </PhaseLayout>
  );
};
