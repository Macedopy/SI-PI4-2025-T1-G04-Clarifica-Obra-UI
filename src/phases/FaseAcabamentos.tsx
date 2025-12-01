// src/phases/FaseAcabamentos.tsx
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

export const FaseAcabamentos = () => {
  const { customerId } = useUserType();
  const { phasesData, loading, error } = usePhasesData();

  if (loading) return <div>Carregando dados da fase...</div>;
  if (error) return <div>{error}</div>;

  const initialData = phasesData['acabamentos'];

  const handleSave = async (dados: any) => {
    const payload = { phaseName: "Acabamentos Finais", contractor: "Construtora Clarifica", ...dados };
    try {
      const res = await fetch(`http://localhost:8080/finishing/${customerId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      alert(res.ok ? "Relatório de Acabamentos enviado!" : "Erro");
    } catch { alert("Falha na conexão"); }
  };

  return (
    <PhaseLayout phase={{ id: "acabamentos", nome: "Acabamentos", icon: Package, secoes }} onSave={handleSave} initialData={initialData}>
      <SecaoConteudo secaoId="equipe" faseId="acabamentos" initialData={initialData?.equipe} />
      <SecaoConteudo secaoId="servicos" faseId="acabamentos" initialData={initialData?.servicos} />
      <SecaoConteudo secaoId="maquinarios" faseId="acabamentos" initialData={initialData?.maquinarios} />
      <SecaoConteudo secaoId="materiais" faseId="acabamentos" initialData={initialData?.materiais} />
      <SecaoConteudo secaoId="ferramentas" faseId="acabamentos" initialData={initialData?.ferramentas} />
      <SecaoConteudo secaoId="fotos" faseId="acabamentos" initialData={initialData?.fotos} />
    </PhaseLayout>
  );
};
