//Responsável: Bruno Macedo
import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, Users } from "lucide-react";
import { useUserType } from '../../contexts/UserTypeContext';
import { CostControl } from '../CostControl';

interface ResumoDashboardProps {
    constructionId?: string;
    isReadOnly?: boolean;
}

interface PhaseProgress {
    phaseName: string;
    progress: number;
    totalServices: number;
    completedServices: number;
    plannedHours: number;
    executedHours: number;
}

interface DashboardData {
    overallProgress: number;
    totalPlannedHours: number;
    totalExecutedHours: number;
    totalServices: number;
    completedServices: number;
    inProgressServices: number;
    plannedServices: number;
    phases: PhaseProgress[];
}

interface Construction {
    id: string;
    name: string;
    status: string;
    overallProgress: number;
}

export const ResumoDashboard: React.FC<ResumoDashboardProps> = ({
    constructionId: initialConstructionId,
    isReadOnly
}) => {
    const { customerId, userType } = useUserType();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedConstructionId, setSelectedConstructionId] = useState<string | null>(null);

    useEffect(() => {
        const id = initialConstructionId || selectedConstructionId;
        if (!id) {
            // Tentar buscar a primeira construção do usuário
            if (customerId) {
                fetchUserConstructions(customerId);
            } else {
                setLoading(false);
            }
            return;
        }
        fetchDashboard(id);
    }, [initialConstructionId, selectedConstructionId, customerId]);

    const fetchUserConstructions = async (userId: string) => {
        try {
            const res = await fetch(`http://localhost:8080/constructions/user/${userId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to load constructions');
            const data: Construction[] = await res.json();
            if (data && data.length > 0) {
                setSelectedConstructionId(data[0].id);
            } else {
                setLoading(false);
                setError('Nenhuma obra encontrada para este usuário.');
            }
        } catch (err) {
            setError('Erro ao carregar obras do usuário.');
            console.error(err);
            setLoading(false);
        }
    };

    const fetchDashboard = async (id: string) => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`http://localhost:8080/dashboard/${id}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to load dashboard');
            const data = await res.json();
            setDashboard({
                overallProgress: data.overallProgress ?? 0,
                totalPlannedHours: data.totalPlannedHours ?? 0,
                totalExecutedHours: data.totalExecutedHours ?? 0,
                totalServices: data.totalServices ?? 0,
                completedServices: data.completedServices ?? 0,
                inProgressServices: data.inProgressServices ?? 0,
                plannedServices: data.plannedServices ?? 0,
                phases: (data.phases ?? []).map((p: any) => ({
                    phaseName: p.phaseName,
                    progress: p.progress ?? 0,
                    totalServices: p.totalServices ?? 0,
                    completedServices: p.completedServices ?? 0,
                    plannedHours: p.plannedHours ?? 0,
                    executedHours: p.executedHours ?? 0,
                }))
            });
        } catch (err) {
            setError('Erro ao carregar dados do dashboard.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center justify-center py-8">
                    <span className="text-gray-500 text-sm">Carregando dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                </div>
            </div>
        );
    }

    if (!dashboard && selectedConstructionId) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center justify-center py-8">
                    <span className="text-gray-500 text-sm">Carregando dashboard...</span>
                </div>
            </div>
        );
    }

    if (!dashboard && !selectedConstructionId && !initialConstructionId) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-4">Nenhuma obra selecionada</p>
                    {customerId && (
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchUserConstructions(customerId);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            Carregar Obras
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center justify-center py-8">
                    <span className="text-gray-500 text-sm">Carregando dashboard...</span>
                </div>
            </div>
        );
    }

    const overallProgress = dashboard.overallProgress;
    const activeConstructionId = initialConstructionId || selectedConstructionId;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
                <TrendingUp className="mr-2 text-blue-600" />
                <h2 className="text-2xl font-bold">Resumo Geral da Obra</h2>
            </div>

            {/* Seletor de obra (quando há múltiplas) */}
            {customerId && !initialConstructionId && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Obra</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedConstructionId || ''}
                        onChange={(e) => {
                            const id = e.target.value;
                            if (id) {
                                setSelectedConstructionId(id);
                            }
                        }}
                    >
                        <option value="">Escolha uma obra...</option>
                        {dashboard ? null : null}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                        Carregando obras... Selecione acima para ver o detalhamento.
                    </p>
                </div>
            )}

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-600 uppercase">Progresso Geral</p>
                            <p className="text-3xl font-bold text-gray-900">{overallProgress}%</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div className={`bg-blue-600 h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
                    </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-green-600 uppercase">Serviços Concluídos</p>
                            <p className="text-3xl font-bold text-gray-900">{dashboard.completedServices}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        de {dashboard.totalServices} totais
                    </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-yellow-600 uppercase">Em Andamento</p>
                            <p className="text-3xl font-bold text-gray-900">{dashboard.inProgressServices}</p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-indigo-600 uppercase">Horas Executadas</p>
                            <p className="text-3xl font-bold text-gray-900">{dashboard.totalExecutedHours.toFixed(1)}h</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        de {dashboard.totalPlannedHours.toFixed(1)}h previstas
                    </p>
                </div>
            </div>

            {/* Progresso por fase */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Progresso por Fase
                </h3>
                <div className="space-y-3">
                    {dashboard.phases.map((phase, index) => (
                        <div key={phase.phaseName || index} className="group">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{phase.phaseName}</span>
                                <span className="text-sm font-bold {phase.progress >= 100 ? 'text-green-600' : 'text-gray-900'}">
                                    {phase.progress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(phase.progress, 100)}%`,
                                        backgroundColor: phase.progress >= 100
                                            ? '#10b981'
                                            : phase.progress >= 50
                                            ? '#3b82f6'
                                            : '#f59e0b'
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{phase.completedServices} de {phase.totalServices} serviços concluídos</span>
                                <span>{phase.executedHours.toFixed(1)}h / {phase.plannedHours.toFixed(1)}h</span>
                            </div>
                        </div>
                    ))}
                    {dashboard.phases.length === 0 && (
                        <div className="py-4 text-center text-gray-400 text-sm">
                            Nenhuma fase com serviços cadastrados ainda.
                        </div>
                    )}
                </div>
            </div>

            {/* Alertas críticos */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-gray-500" />
                    Alertas e Status
                </h3>
                <div className="space-y-2">
                    {dashboard.plannedServices > 0 && (
                        <div className="flex items-center p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
                            <Clock className="text-blue-600 mr-2" size={20} />
                            <span className="text-sm text-gray-700">
                                {dashboard.plannedServices} serviço(s) ainda não iniciado(s)
                            </span>
                        </div>
                    )}
                    {dashboard.inProgressServices > 0 && (
                        <div className="flex items-center p-3 bg-yellow-50 border-l-4 border-yellow-600 rounded">
                            <Clock className="text-yellow-600 mr-2" size={20} />
                            <span className="text-sm text-gray-700">
                                {dashboard.inProgressServices} serviço(s) em andamento
                            </span>
                        </div>
                    )}
                    {dashboard.completedServices > 0 && (
                        <div className="flex items-center p-3 bg-green-50 border-l-4 border-green-600 rounded">
                            <CheckCircle className="text-green-600 mr-2" size={20} />
                            <span className="text-sm text-gray-700">
                                {dashboard.completedServices} serviço(s) concluído(s) com sucesso
                            </span>
                        </div>
                    )}
                    {overallProgress >= 100 && (
                        <div className="flex items-center p-3 bg-green-50 border-l-4 border-green-600 rounded">
                            <CheckCircle className="text-green-600 mr-2" size={20} />
                            <span className="text-sm text-gray-700">
                                Obra concluída! Parabéns!
                            </span>
                        </div>
                    )}
                    {overallProgress > 0 && overallProgress < 100 && dashboard.plannedServices === 0 && dashboard.inProgressServices === 0 && (
                        <div className="flex items-center p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
                            <TrendingUp className="text-blue-600 mr-2" size={20} />
                            <span className="text-sm text-gray-700">
                                Obra em progresso. Acompanhe o andamento pelas fases acima.
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controle de Custos da Obra */}
            {activeConstructionId && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <CostControl
                        mode="dashboard"
                        constructionId={activeConstructionId}
                        userId={customerId || ''}
                        userRole={userType || ''}
                    />
                </div>
            )}
        </div>
    );
};
