//Responsável: Bruno Macedo
import { Camera } from "lucide-react";

interface FotosRegistrosProps {
    isReadOnly?: boolean;
}

export const FotosRegistros: React.FC<FotosRegistrosProps> = ({ isReadOnly }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
                <Camera className="mr-2 text-indigo-600" />
                <h2 className="text-2xl font-bold">Fotos e Registros</h2>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-4">Arraste fotos aqui ou clique para selecionar</p>
                <input type="file" multiple accept="image/*" className="hidden" id="upload-fotos" />
                <label htmlFor="upload-fotos" className="bg-indigo-600 text-white px-6 py-2 rounded cursor-pointer hover:bg-indigo-700 inline-block">
                    Selecionar Fotos
                </label>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Legenda</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="Adicione uma legenda às fotos" />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select className="w-full p-2 border rounded">
                    <option value="">Selecione</option>
                    <option value="progresso">Progresso</option>
                    <option value="problema">Problema</option>
                    <option value="antes">Antes</option>
                    <option value="depois">Depois</option>
                    <option value="seguranca">Segurança</option>
                </select>
            </div>
        </div>
    );
};
