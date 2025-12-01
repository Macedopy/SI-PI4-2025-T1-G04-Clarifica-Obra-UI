// src/phases/FaseInstalacoesHidraulicas.tsx
import { Camera, Hammer, Package, Truck, Users, Wrench } from "lucide-react";
import { PhaseLayout } from "../components/PhaseLayout";
import { SecaoConteudo } from "../components/SecaoConteudo";
import { useUserType } from "../contexts/UserTypeContext";
import { usePhasesData } from "../contexts/PhasesContext";

const secoes = [
  { id: "equipe", nome: "Equipe", icon: Users },
  { id: "servicos", nome: "Serviços", icon: Wrench },
  { id: "maquinarios", nome: "Maquinários", icon: Truck },
  { id: "materiais", nome: "Materiais", icon: Package },
  { id: "ferramentas", nome: "Ferramentas", icon: Hammer },
  { id: "fotos", nome: "Fotos", icon: Camera },
];

export const FaseInstalacoesHidraulicas = () => {
  const { customerId } = useUserType();
  const { phasesData, loading, error } = usePhasesData();

  if (loading) return <div>Carregando dados da fase...</div>;
  if (error) return <div>{error}</div>;

  const initialData = phasesData['instalacoes-hidraulicas'];

  const handleSave = async (dados: any) => {
    const payload = {
      equipe: dados.equipe || [],
      servicos: dados.servicos || [],
      maquinarios: dados.maquinarios || [],
      materiais: dados.materiais || [],
      ferramentas: dados.ferramentas || [],
      fotos: (dados.fotos || []).map((f: any) => ({
        id: "",
        filePath: f.url || "/fotos/default.jpg",
        caption: f.caption || "Foto das instalações hidráulicas",
        category: "PROGRESS",
        uploadedAt: new Date().toISOString(),
      })),
    };

    try {
      const res = await fetch(`http://localhost:8080/hydraulic/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Relatório Hidráulico enviado com sucesso!");
      } else {
        alert("Erro ao enviar o relatório. Tente novamente.");
      }
    } catch (err) {
      alert("Falha na conexão com o servidor.");
    }
  };

  return (
    <PhaseLayout
      phase={{ id: "instalacoes-hidraulicas", nome: "Inst. Hidráulicas", icon: Wrench, secoes }}
      onSave={handleSave}
      initialData={initialData}
    >
      <SecaoConteudo secaoId="equipe" faseId="instalacoes-hidraulicas" initialData={initialData?.equipe} />
      <SecaoConteudo secaoId="servicos" faseId="instalacoes-hidraulicas" initialData={initialData?.servicos} />
      <SecaoConteudo secaoId="maquinarios" faseId="instalacoes-hidraulicas" initialData={initialData?.maquinarios} />
      <SecaoConteudo secaoId="materiais" faseId="instalacoes-hidraulicas" initialData={initialData?.materiais} />
      <SecaoConteudo secaoId="ferramentas" faseId="instalacoes-hidraulicas" initialData={initialData?.ferramentas} />
      <SecaoConteudo secaoId="fotos" faseId="instalacoes-hidraulicas" initialData={initialData?.fotos} />
    </PhaseLayout>
  );
};
