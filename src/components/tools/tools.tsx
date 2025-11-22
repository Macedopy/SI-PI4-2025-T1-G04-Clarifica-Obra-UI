import React, { useState, useEffect } from 'react';
import { Hammer, X, Plus, Edit3, Save, Wrench, CheckCircle } from 'lucide-react';

interface FerramentaItem {
    id: string;
    nome: string;
    categoria: string;
    quantidadeTotal: number;
    emUso: number;
    disponivel: number;
    emManutencao: number;
    condicao: 'ótima' | 'boa' | 'ruim' | 'indisponível';
    observacao: string;
}

interface FerramentasUtilizadasProps {
    isReadOnly?: boolean;
    faseId: string;

}

export const FerramentasUtilizadas: React.FC<FerramentasUtilizadasProps> = ({
    isReadOnly = false,
    faseId

}) => {
    const STORAGE_KEY = `ferramentas-fase-${faseId}`;
    const [ferramentas, setFerramentas] = useState<FerramentaItem[]>([]);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    const [editTemp, setEditTemp] = useState<{
        nome: string;
        categoria: string;
        quantidadeTotal: number;
        emUso: number;
        emManutencao: number;
        condicao: 'ótima' | 'boa' | 'ruim' | 'indisponível';
        observacao: string;
    }>({
        nome: '',
        categoria: 'Manual',
        quantidadeTotal: 1,
        emUso: 0,
        emManutencao: 0,
        condicao: 'boa',
        observacao: ''
    });


    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setFerramentas(JSON.parse(saved));



    }, [faseId]);


    useEffect(() => {
        if (ferramentas.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ferramentas));















        }
    }, [ferramentas]);

    const adicionarFerramenta = () => {
        const nova: FerramentaItem = {
            id: Date.now().toString(),
            nome: 'Nova Ferramenta',
            categoria: 'Manual',
            quantidadeTotal: 1,
            emUso: 0,
            disponivel: 1,
            emManutencao: 0,
            condicao: 'boa',
            observacao: ''
        };
        setFerramentas(prev => [...prev, nova]);
    };

    const removerFerramenta = (id: string) => {
        setFerramentas(prev => prev.filter(f => f.id !== id));
        setEditandoId(null);
    };

    const atualizarFerramenta = (id: string, updates: Partial<FerramentaItem>) => {
        setFerramentas(prev =>
            prev.map(f =>
                f.id === id
                    ? {
                        ...f,
                        ...updates,
                        disponivel: f.quantidadeTotal - f.emUso - f.emManutencao


                    }
                    : f
            )
        );
    };

    const abrirEdicao = (ferramenta: FerramentaItem) => {
        setEditandoId(ferramenta.id);
        setEditTemp({
            nome: ferramenta.nome,
            categoria: ferramenta.categoria,
            quantidadeTotal: ferramenta.quantidadeTotal,
            emUso: ferramenta.emUso,
            emManutencao: ferramenta.emManutencao,
            condicao: ferramenta.condicao,
            observacao: ferramenta.observacao
        });
    };

    const salvarEdicao = () => {
        if (!editandoId) return;
        atualizarFerramenta(editandoId, {
            nome: editTemp.nome,
            categoria: editTemp.categoria,
            quantidadeTotal: editTemp.quantidadeTotal,
            emUso: editTemp.emUso,
            emManutencao: editTemp.emManutencao,
            condicao: editTemp.condicao,
            observacao: editTemp.observacao
        });
        setEditandoId(null);
    };

    const usarFerramenta = () => {
        if (editTemp.emUso >= editTemp.quantidadeTotal - editTemp.emManutencao) return;

        setEditTemp(prev => ({ ...prev, emUso: prev.emUso + 1 }));
    };

    const devolverFerramenta = () => {
        if (editTemp.emUso <= 0) return;
        setEditTemp(prev => ({ ...prev, emUso: prev.emUso - 1 }));
    };

    const enviarManutencao = () => {
        if (editTemp.emManutencao >= editTemp.quantidadeTotal - editTemp.emUso) return;

        setEditTemp(prev => ({ ...prev, emManutencao: prev.emManutencao + 1 }));
    };

    const retornarManutencao = () => {
        if (editTemp.emManutencao <= 0) return;
        setEditTemp(prev => ({ ...prev, emManutencao: prev.emManutencao - 1 }));
    };

    const disponivel = editTemp.quantidadeTotal - editTemp.emUso - editTemp.emManutencao;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Hammer className="text-orange-600" size={28} />
                    <h3 className="text-xl font-bold">Ferramentas Utilizadas</h3>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={adicionarFerramenta}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow"
                    >
                        <Plus size={18} />
                        Adicionar Ferramenta
                    </button>
                )}
            </div>

            {ferramentas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Hammer size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma ferramenta adicionada ainda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {ferramentas.map(ferramenta => (
                        <div
                            key={ferramenta.id}
                            className={`border rounded-xl p-5 shadow-sm transition-all relative ${editandoId === ferramenta.id
                                    ? 'ring-2 ring-orange-500 bg-orange-50'
                                    : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow'
                                }`}
                        >
                            {!isReadOnly && (
                                <div className="absolute top-3 right-3 flex gap-2 z-10">
                                    {editandoId !== ferramenta.id ? (
                                        <button
                                            onClick={() => abrirEdicao(ferramenta)}
                                            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={salvarEdicao}
                                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
                                        >
                                            <Save size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => removerFerramenta(ferramenta.id)}
                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}


                            {editandoId === ferramenta.id ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={editTemp.nome}
                                                onChange={e => setEditTemp({ ...editTemp, nome: e.target.value })}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
                                                placeholder="Ex: Martelete 10kg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Categoria</label>
                                            <select
                                                value={editTemp.categoria}
                                                onChange={e => setEditTemp({ ...editTemp, categoria: e.target.value })}
                                                className="w-full p-2 border rounded"
                                            >
                                                <option>Manual</option>
                                                <option>Elétrica</option>
                                                <option>Pneumática</option>
                                                <option>Medição</option>
                                                <option>Corte</option>
                                                <option>Outros</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Quantidade Total</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editTemp.quantidadeTotal}
                                                onChange={e => setEditTemp({ ...editTemp, quantidadeTotal: Number(e.target.value) })}
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Condição</label>
                                            <select
                                                value={editTemp.condicao}
                                                onChange={e =>
                                                    setEditTemp({
                                                        ...editTemp,
                                                        condicao: e.target.value as 'ótima' | 'boa' | 'ruim' | 'indisponível'
                                                    })
                                                }
                                                className="w-full p-2 border rounded"
                                            >
                                                <option value="ótima">Ótima</option>
                                                <option value="boa">Boa</option>
                                                <option value="ruim">Ruim</option>
                                                <option value="indisponível">Indisponível</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Em Uso</p>
                                            <p className="text-2xl font-bold text-blue-600">{editTemp.emUso}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={usarFerramenta}
                                                    disabled={editTemp.emUso >= editTemp.quantidadeTotal - editTemp.emManutencao}
                                                    className="flex-1 bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    Usar
                                                </button>
                                                <button
                                                    onClick={devolverFerramenta}
                                                    disabled={editTemp.emUso <= 0}
                                                    className="flex-1 bg-gray-500 text-white text-xs py-1 rounded hover:bg-gray-600 disabled:opacity-50"
                                                >
                                                    Devolver
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Disponível</p>
                                            <p className="text-2xl font-bold text-green-600">{disponivel}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Manutenção</p>
                                            <p className="text-2xl font-bold text-orange-600">{editTemp.emManutencao}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={enviarManutencao}
                                                    disabled={editTemp.emManutencao >= editTemp.quantidadeTotal - editTemp.emUso}
                                                    className="flex-1 bg-orange-500 text-white text-xs py-1 rounded hover:bg-orange-600 disabled:opacity-50"
                                                >
                                                    Enviar
                                                </button>
                                                <button
                                                    onClick={retornarManutencao}
                                                    disabled={editTemp.emManutencao <= 0}
                                                    className="flex-1 bg-teal-500 text-white text-xs py-1 rounded hover:bg-teal-600 disabled:opacity-50"
                                                >
                                                    Retornar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Total</p>
                                            <p className="text-2xl font-bold text-gray-800">{editTemp.quantidadeTotal}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="block text-sm font-medium mb-1">Observação</label>
                                        <textarea
                                            value={editTemp.observacao}
                                            onChange={e => setEditTemp({ ...editTemp, observacao: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            rows={2}
                                            placeholder="Ex: Cabo danificado"
                                        />
                                    </div>
                                </div>
                            ) : (

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-gray-800">{ferramenta.nome}</p>
                                            <p className="text-sm text-gray-600">{ferramenta.categoria}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {ferramenta.condicao === 'ótima' && <CheckCircle className="text-green-600" size={20} />}
                                            {ferramenta.condicao === 'ruim' && <Wrench className="text-orange-600" size={20} />}
                                            {ferramenta.condicao === 'indisponível' && <X className="text-red-600" size={20} />}
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${ferramenta.condicao === 'ótima'
                                                        ? 'bg-green-100 text-green-800'
                                                        : ferramenta.condicao === 'boa'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : ferramenta.condicao === 'ruim'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {ferramenta.condicao}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                        <div className="bg-blue-50 p-2 rounded">
                                            <p className="text-xs text-gray-600">Em Uso</p>
                                            <p className="font-bold text-blue-700">{ferramenta.emUso}</p>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                            <p className="text-xs text-gray-600">Disponível</p>
                                            <p className="font-bold text-green-700">{ferramenta.disponivel}</p>
                                        </div>
                                        <div className="bg-orange-50 p-2 rounded">
                                            <p className="text-xs text-gray-600">Manutenção</p>
                                            <p className="font-bold text-orange-700">{ferramenta.emManutencao}</p>
                                        </div>
                                    </div>
                                    {ferramenta.observacao && (
                                        <p className="text-xs text-gray-500 mt-2 italic">"{ferramenta.observacao}"</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
