//Responsável: Bruno Macedo
import { AlertTriangle } from "lucide-react";

interface ObservacoesPendenciasProps {
    isReadOnly?: boolean;
}

export const ObservacoesPendencias: React.FC<ObservacoesPendenciasProps> = ({ isReadOnly }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
                <AlertTriangle className="mr-2 text-red-600" />
                <h2 className="text-2xl font-bold">Observações e Pendências</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Problemas Encontrados</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="Descreva os problemas encontrados durante o dia..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Atrasos</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={2}
                        placeholder="Descreva os atrasos..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Motivo do Atraso</label>
                    <select className="w-full p-2 border rounded">
                        <option value="">Selecione</option>
                        <option value="chuva">Chuva</option>
                        <option value="falta_material">Falta de Material</option>
                        <option value="falta_mao_obra">Falta de Mão de Obra</option>
                        <option value="problema_tecnico">Problema Técnico</option>
                        <option value="retrabalho">Retrabalho</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Necessidades Urgentes</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="Liste as necessidades urgentes..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Visitas Técnicas</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Ex: Engenheiro João - Aprovação de estrutura"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Entregas Programadas</label>
                    <div className="flex gap-2">
                        <input type="date" className="flex-1 p-2 border rounded" />
                        <input type="text" className="flex-1 p-2 border rounded" placeholder="Descrição da entrega" />
                    </div>
                </div>
            </div>
        </div>
    );
};