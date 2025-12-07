//Responsável: Bruno Macedo

// src/components/SecaoConteudo.tsx
import { Camera, AlertTriangle, TrendingUp } from "lucide-react";
import { MateriaisUtilizados } from "./used-materials/used-materials";
import { FerramentasUtilizadas } from "./tools/tools";
import { MaquinariosUtilizados } from "./machinery/machinery";
import { EquipeUtilizada } from "./team-present/team-present";
import { ServicosExecutados } from "./executed-services/executed-services";
import { InformacoesGerais } from "./general/general-information";

interface SecaoConteudoProps {
  secaoId: string;
  faseId: string;
  isReadOnly?: boolean;
  initialData?: any;
}

export const SecaoConteudo = ({ secaoId, faseId, isReadOnly = false, initialData }: SecaoConteudoProps) => {
  if (secaoId === "fotos") {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <Camera className="text-blue-600" size={32} />
          Fotos da Fase
        </h3>
        <div className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-400 transition">
          <Camera className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-xl text-gray-600 font-medium">Clique para adicionar fotos</p>
          <p className="text-sm text-gray-500 mt-2">Suporta múltiplas imagens</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center hover:bg-gray-300 transition">
              <span className="text-gray-500 font-medium">Foto {i}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (secaoId === "observacoes") {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <AlertTriangle className="text-yellow-600" size={32} />
          Observações e Pendências
        </h3>
        <textarea
          className="w-full p-5 border-2 border-gray-300 rounded-xl h-48 text-lg resize-none focus:border-blue-500 focus:outline-none transition"
          placeholder="Adicione observações importantes, pendências ou alertas desta fase..."
          disabled={isReadOnly}
        />
        <div className="space-y-4 mt-8">
          <div className="p-5 bg-yellow-50 border-l-8 border-yellow-500 rounded-r-xl">
            <div className="font-bold text-yellow-900">Aguardando aprovação do cliente</div>
            <div className="text-sm text-yellow-700 mt-1">Alteração no projeto de elétrica</div>
          </div>
          <div className="p-5 bg-red-50 border-l-8 border-red-500 rounded-r-xl">
            <div className="font-bold text-red-900">Atraso na entrega de material</div>
            <div className="text-sm text-red-700 mt-1">Aço CA-50 previsto para 28/04</div>
          </div>
        </div>
      </div>
    );
  }

  if (secaoId === "resumo") {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <TrendingUp className="text-green-600" size={32} />
          Resumo Final da Obra
        </h3>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-10 rounded-2xl shadow-2xl">
          <h4 className="text-3xl font-bold mb-4">Obra Concluída com Sucesso!</h4>
          <p className="text-xl opacity-90">Todas as fases foram finalizadas dentro do prazo e com qualidade.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-green-100 p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-green-600">100%</div>
            <div className="text-lg font-medium text-green-800">Conclusão</div>
          </div>
          <div className="bg-blue-100 p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-blue-600">10</div>
            <div className="text-lg font-medium text-blue-800">Fases</div>
          </div>
          <div className="bg-purple-100 p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-purple-600">0</div>
            <div className="text-lg font-medium text-purple-800">Pendências</div>
          </div>
        </div>
      </div>
    );
  }

  if (secaoId === "materiais") {
    return <MateriaisUtilizados isReadOnly={isReadOnly} faseId={faseId} initialData={initialData} />;
  }
  if (secaoId === "ferramentas") {
    return <FerramentasUtilizadas isReadOnly={isReadOnly} faseId={faseId} initialData={initialData} />;
  }
  if (secaoId === "maquinarios") {
    return <MaquinariosUtilizados isReadOnly={isReadOnly} faseId={faseId} initialData={initialData} />;
  }
  if (secaoId === "equipe") {
    return <EquipeUtilizada isReadOnly={isReadOnly} faseId={faseId} initialData={initialData} />;
  }
  if (secaoId === "servicos") {
    return <ServicosExecutados isReadOnly={isReadOnly} faseId={faseId} initialData={initialData} />;
  }
  if (secaoId === "geral") {
    return <InformacoesGerais isReadOnly={isReadOnly} faseId={faseId} initialData={initialData} />;
  }

  const camposMock: string[] = {
    equipe: ["Engenheiro", "Mestre de obras", "Pedreiro", "Ajudante"],
    servicos: ["Escavação", "Armação", "Concretagem"],
    maquinarios: ["Betoneira", "Guindaste"],
    ferramentas: ["Nível", "Trena", "Martelo"],
  }[secaoId] || [];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold capitalize">{secaoId}</h3>
      <div className="grid gap-6">
        {camposMock.length > 0 ? (
          camposMock.map((campo, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition"
            >
              <label className="text-lg font-medium text-gray-800 cursor-pointer">{campo}</label>
              <input
                type="checkbox"
                className="w-8 h-8 text-blue-600 rounded focus:ring-blue-500"
                disabled={isReadOnly}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-12 text-lg">
            Nenhum item cadastrado para esta seção.
          </p>
        )}
      </div>
    </div>
  );
};
