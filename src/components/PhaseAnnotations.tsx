//Responsável de User: Bruno Macedo
import React, { useState, useEffect, useCallback } from 'react';
import { useUserType } from '../contexts/UserTypeContext';

interface PhaseAnnotation {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdById: string;
  createdByName?: string;
  componentType: string | null;
  componentId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface PhaseAnnotationsProps {
  phaseId: string;
  userId: string;
  userRole: string;
  componentType?: string;
  componentId?: string;
}

const roleCanSeePrivate = (role: string) => {
  const r = role.toUpperCase();
  return r === 'MASTER_BUILDER' || r === 'OWNER';
};

export const PhaseAnnotations: React.FC<PhaseAnnotationsProps> = ({
  phaseId,
  userId,
  userRole,
  componentType,
  componentId,
}) => {
  const { customerId } = useUserType();
  const [annotations, setAnnotations] = useState<PhaseAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchAnnotations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const isClient = userRole.toUpperCase() === 'CLIENT';
      const url = isClient
        ? `http://localhost:8080/phases/${phaseId}/annotations?publicOnly=true`
        : `http://localhost:8080/phases/${phaseId}/annotations${
            componentType && componentId
              ? `&componentType=${encodeURIComponent(componentType)}&componentId=${encodeURIComponent(componentId)}`
              : ''
          }`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load annotations');
      const data: PhaseAnnotation[] = await res.json();
      setAnnotations(data);
    } catch (err) {
      setError('Erro ao carregar anotações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [phaseId, userRole, componentType, componentId]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`http://localhost:8080/phases/${phaseId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdById: userId,
          title: formTitle,
          content: formContent,
          isPublic: formIsPublic,
          componentType: componentType || null,
          componentId: componentId || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create annotation');
      }

      const created: PhaseAnnotation = await res.json();
      setAnnotations((prev) => [created, ...prev]);
      setShowForm(false);
      setFormTitle('');
      setFormContent('');
      setFormIsPublic(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar anotação.');
    }
  };

  const handleUpdate = async (id: string) => {
    setError('');
    try {
      const res = await fetch(
        `http://localhost:8080/phases/${phaseId}/annotations/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: formTitle,
            content: formContent,
            isPublic: formIsPublic,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update annotation');
      }

      const updated: PhaseAnnotation = await res.json();
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      setShowForm(false);
      setFormTitle('');
      setFormContent('');
      setFormIsPublic(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar anotação.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta anotação?')) return;
    try {
      const res = await fetch(
        `http://localhost:8080/phases/${phaseId}/annotations/${id}?userId=${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete annotation');
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError('Erro ao excluir anotação.');
    }
  };

  const isOwner = (annotation: PhaseAnnotation) =>
    annotation.createdById === userId;

  const canViewPrivate = roleCanSeePrivate(userRole);
  const isClient = userRole.toUpperCase() === 'CLIENT';

  const visibleAnnotations = annotations.filter((a) => {
    if (a.isPublic) return true;
    if (!isClient && canViewPrivate) return true;
    return false;
  });

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Anotações da Fase
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Registre o que aconteceu nesta fase da obra
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Fechar' : 'Nova Anotação'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="mb-6 bg-white p-5 rounded-xl shadow border border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId) {
                handleUpdate(editingId);
              } else {
                handleSubmit(e);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Problema com encanamento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              {editingId ? null : (
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={formIsPublic}
                      onChange={(e) => setFormIsPublic(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Público (cliente também vê)
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição / Relatório
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                placeholder="O que aconteceu nesta fase? Detalhes de serviços, maquinário, materiais, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              ></textarea>
            </div>

            {!editingId && isClient && (
              <p className="text-xs text-gray-400 italic">
                Sua anotação será visível apenas para você e para a equipe da obra.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                disabled={!formTitle || !formContent}
              >
                {editingId ? 'Atualizar' : 'Salvar Anotação'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormTitle('');
                  setFormContent('');
                  setFormIsPublic(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de anotações */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
            Carregando anotações...
          </div>
        ) : visibleAnnotations.length === 0 ? (
          <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">
              Nenhuma anotação ainda.{!showForm ? ' Clique em "Nova Anotação" para começar.' : ''}
            </p>
          </div>
        ) : (
          visibleAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      annotation.isPublic
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {annotation.isPublic ? 'Público' : 'Privado'}
                  </span>
                  {annotation.componentType && (
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {annotation.componentType}
                    </span>
                  )}
                </div>
                {isOwner(annotation) && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setFormTitle(annotation.title);
                        setFormContent(annotation.content);
                        setFormIsPublic(annotation.isPublic);
                        setEditingId(annotation.id);
                        setShowForm(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(annotation.id)}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                {annotation.title}
              </h4>
              <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words">
                {annotation.content}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>
                    {annotation.createdByName ||
                      [annotation.createdBy?.firstName, annotation.createdBy?.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                      'Usuário'}
                  </span>
                  <span>•</span>
                  <span>{new Date(annotation.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {annotation.updatedAt && (
                  <span>Atualizado: {new Date(annotation.updatedAt).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isClient && visibleAnnotations.length === 0 && !showForm && (
        <p className="mt-4 text-xs text-gray-400 text-center">
          As anotações privadas da equipe aparecerão aqui quando forem compartilhadas como públicas.
        </p>
      )}
    </div>
  );
};
