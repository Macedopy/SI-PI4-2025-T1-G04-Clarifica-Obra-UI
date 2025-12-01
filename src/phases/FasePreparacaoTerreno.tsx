// src/phases/FasePreparacaoTerreno.tsx
import { Calendar, Users, Wrench, Truck, Package, Camera } from "lucide-react";
import { PhaseLayout } from "../components/PhaseLayout";
import { SecaoConteudo } from "../components/SecaoConteudo";
import { useUserType } from "../contexts/UserTypeContext";
import { usePhasesData } from "../contexts/PhasesContext";

const secoes = [
  { id: "geral", nome: "Informações Gerais", icon: Calendar },
  { id: "equipe", nome: "Equipe", icon: Users },
  { id: "servicos", nome: "Serviços", icon: Wrench },
  { id: "maquinarios", nome: "Maquinários", icon: Truck },
  { id: "materiais", nome: "Materiais", icon: Package },
  { id: "fotos", nome: "Fotos", icon: Camera },
];

export const FasePreparacaoTerreno = () => {
  const { customerId } = useUserType();
  const { phasesData, loading, error } = usePhasesData();

  if (loading) return <div>Carregando dados da fase...</div>;
  if (error) return <div>{error}</div>;

  const initialData = phasesData['preparacao'];

  const handleSave = async (dados: any) => {
    const payload = {
      geral: dados.geral || {},
      equipe: dados.equipe || [],
      servicos: dados.servicos || [],
      maquinarios: dados.maquinarios || [],
      materiais: dados.materiais || [],
      fotos: (dados.fotos || []).map((f: any) => ({
        id: "",
        filePath: f.url || "/fotos/default.jpg",
        caption: f.caption || "Foto da preparação do terreno",
        category: "PROGRESS",
        uploadedAt: new Date().toISOString(),
      })),
    };

    try {
      const res = await fetch(`http://localhost:8080/terrain-preparation/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Relatório da Preparação do Terreno enviado com sucesso!");
      } else {
        alert("Erro ao enviar o relatório. Tente novamente.");
      }
    } catch (err) {
      alert("Falha na conexão com o servidor.");
    }
  };

  return (
    <PhaseLayout
      phase={{ id: "preparacao", nome: "Preparação do Terreno", icon: Calendar, secoes }}
      onSave={handleSave}
      initialData={initialData}
    >
      <SecaoConteudo secaoId="geral" faseId="preparacao" initialData={initialData?.geral} />
      <SecaoConteudo secaoId="equipe" faseId="preparacao" initialData={initialData?.equipe} />
      <SecaoConteudo secaoId="servicos" faseId="preparacao" initialData={initialData?.servicos} />
      <SecaoConteudo secaoId="maquinarios" faseId="preparacao" initialData={initialData?.maquinarios} />
      <SecaoConteudo secaoId="materiais" faseId="preparacao" initialData={initialData?.materiais} />
      <SecaoConteudo secaoId="fotos" faseId="preparacao" initialData={initialData?.fotos} />
    </PhaseLayout>
  );
};
