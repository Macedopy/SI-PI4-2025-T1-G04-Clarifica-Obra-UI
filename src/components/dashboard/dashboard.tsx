//Responsável: Bruno Macedo
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface ResumoDashboardProps {
    isReadOnly?: boolean;
}

export const ResumoDashboard: React.FC<ResumoDashboardProps> = ({ isReadOnly }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
                <TrendingUp className="mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold">Resumo Geral</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">% Progresso Geral da Obra</label>
                    <div className="flex items-center gap-4">
                        <input type="range" min="0" max="100" className="flex-1" defaultValue="45" disabled={true} />
                        <span className="font-bold text-lg">45%</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-600 h-4 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Prazo</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-blue-50 rounded">
                            <p className="text-sm text-gray-600">Dias Trabalhados</p>
                            <p className="text-2xl font-bold">45</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded">
                            <p className="text-sm text-gray-600">Dias Previstos</p>
                            <p className="text-2xl font-bold">100</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Prazo Estimado de Conclusão</label>
                    <input type="date" className="w-full p-2 border rounded" disabled={true}     defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Alertas Críticos</label>
                    <div className="space-y-2">
                        <div className="flex items-center p-3 bg-red-50 border-l-4 border-red-600 rounded">
                            <AlertTriangle className="text-red-600 mr-2" size={20} />
                            <span className="text-sm">Cimento em estoque crítico (5 sacos)</span>
                        </div>
                        <div className="flex items-center p-3 bg-yellow-50 border-l-4 border-yellow-600 rounded">
                            <AlertTriangle className="text-yellow-600 mr-2" size={20} />
                            <span className="text-sm">Betoneira necessita manutenção</span>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 border-l-4 border-green-600 rounded">
                            <CheckCircle className="text-green-600 mr-2" size={20} />
                            <span className="text-sm">Nenhum atraso registrado hoje</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
