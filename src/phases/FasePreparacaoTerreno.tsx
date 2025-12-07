//Responsável de User: Bruno Macedo
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

  // Usa 'as any' para burlar o TypeScript temporariamente e acessa a propriedade correta
  const rawData = phasesData['preparacao'] as any; 
  
  // Tenta pegar de 'geral' (DTO) ou 'generalInformations' (Entidade)
  // E se for uma lista, pega o primeiro item.
  const infoGeralNoBanco = rawData?.geral || rawData?.generalInformations;
  const dadosGeraisIniciais = Array.isArray(infoGeralNoBanco) ? infoGeralNoBanco[0] : infoGeralNoBanco;

  const handleSave = async (dados: any) => {
    // Pega o dado que veio do formulário (pode vir como array ou objeto)
    const formGeral = Array.isArray(dados.geral) ? dados.geral[0] : dados.geral;
    const dadosGerais = formGeral || {};

    const payload = {
      phaseName: "Preparação do Terreno",
      contractor: "Construtora Clarifica",
      
      // Empacota o objeto único dentro de uma Lista [ ] para o Java aceitar
      geral:
        {
          endereco: dadosGerais.endereco || "",
          areaTerreno: Number(dadosGerais.areaTerreno) || 0,
          topografia: dadosGerais.topografia || "plana",
          dataInicio: dadosGerais.dataInicio || String(dados.dataInicio),
          responsavel: dadosGerais.responsavel || "",
          observacao: dadosGerais.observacao || ""
        }
      ,

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

    console.log("Payload Enviado:", payload);

    try {
      const res = await fetch(`http://localhost:8080/terrain-preparation/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Relatório da Preparação do Terreno enviado com sucesso!");
      } else {
        const txt = await res.text();
        console.error("Erro Backend:", txt);
        alert("Erro ao enviar. Verifique o console.");
      }
    } catch (err) {
      alert("Falha na conexão com o servidor.");
    }
  };

  return (
    <PhaseLayout
      phase={{ id: "preparacao", nome: "Preparação do Terreno", icon: Calendar, secoes }}
      onSave={handleSave}
      initialData={rawData} // Passa o objeto completo
    >
      {/* AQUI ESTAVA O ERRO DO TYPESCRIPT:
         Mudamos para passar 'dadosGeraisIniciais' que calculamos ali em cima.
         Isso garante que o formulário abra preenchido se já tiver dados no banco.
      */}
      <SecaoConteudo 
        secaoId="geral" 
        faseId="preparacao" 
        initialData={dadosGeraisIniciais} 
      />
      
      <SecaoConteudo secaoId="equipe" faseId="preparacao" initialData={rawData?.teamMembers || rawData?.equipe} />
      <SecaoConteudo secaoId="servicos" faseId="preparacao" initialData={rawData?.services || rawData?.servicos} />
      <SecaoConteudo secaoId="maquinarios" faseId="preparacao" initialData={rawData?.machinery || rawData?.maquinarios} />
      <SecaoConteudo secaoId="materiais" faseId="preparacao" initialData={rawData?.materials || rawData?.materiais} />
      <SecaoConteudo secaoId="fotos" faseId="preparacao" initialData={rawData?.photoRecords || rawData?.fotos} />
    </PhaseLayout>
  );
};