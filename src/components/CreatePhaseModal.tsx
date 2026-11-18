import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Plus, Trash2, Wrench, Package,
  Users, Truck, Hammer, Camera, AlertTriangle,
  Info, Save
} from 'lucide-react';
import { usePhasesData } from '../contexts/PhasesContext';
import { DEFAULT_PHASE_ICON_ID, PHASE_ICONS } from '../utils/phaseIcons';
import { useLocale } from '../contexts/LocaleContext';

interface ComponentOption {
  id: string;
  nome: string;
  icon: any;
}

const AVAILABLE_COMPONENTS: ComponentOption[] = [
  { id: 'geral', nome: 'Geral', icon: Info },
  { id: 'equipe', nome: 'Equipe', icon: Users },
  { id: 'servicos', nome: 'Serviços', icon: Wrench },
  { id: 'maquinarios', nome: 'Maquinários', icon: Truck },
  { id: 'materiais', nome: 'Materiais', icon: Package },
  { id: 'ferramentas', nome: 'Ferramentas', icon: Hammer },
  { id: 'fotos', nome: 'Fotos', icon: Camera },
  { id: 'observacoes', nome: 'Observações', icon: AlertTriangle },
];

interface TemplatePhaseOption {
  id: string;
  phaseId: string;
  nameKey: string;
  nome: string;
  icon: string;
  components: string[];
}

interface CreatePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  constructionId: string;
}

export const CreatePhaseModal: React.FC<CreatePhaseModalProps> = ({ isOpen, onClose, constructionId }) => {
  const { refreshPhases } = usePhasesData();
  const { t, language } = useLocale();
  const [templatePhases, setTemplatePhases] = useState<TemplatePhaseOption[]>([]);
  const [phaseName, setPhaseName] = useState('');
  const [selectedTemplatePhase, setSelectedTemplatePhase] = useState<TemplatePhaseOption | null>(null);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_PHASE_ICON_ID);
  const [selectedComponents, setSelectedComponents] = useState<ComponentOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Trava o scroll do fundo enquanto o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Carrega fases do template quando o modal abre
  useEffect(() => {
    if (!isOpen || !constructionId) return;

    const loadTemplatePhases = async () => {
      setLoadingTemplates(true);
      try {
        // Busca a obra para obter o template_id
        const constructionRes = await fetch(`http://localhost:8080/constructions/user/${constructionId}`);
        if (!constructionRes.ok) return;
        const constructions: any[] = await constructionRes.json();
        if (constructions.length === 0) return;

        const construction = constructions[0];
        const templateId = construction.templateId;

        if (!templateId) {
          // Sem template: usa fases genéricas (modo Brasil atual)
          setTemplatePhases([]);
          return;
        }

        // Busca as fases do template
        const templateRes = await fetch(`http://localhost:8080/api/templates/${templateId}/phases`);
        if (!templateRes.ok) return;
        const templatePhasesData: any[] = await templateRes.json();

        const phasesWithNames: TemplatePhaseOption[] = templatePhasesData.map((p: any) => ({
          id: p.id,
          phaseId: p.phaseId,
          nome: t(`phase.${p.phaseId}`, {}) || p.nameKey,
          nameKey: p.nameKey,
          icon: p.icon || 'package',
          components: p.components ? JSON.parse(p.components) : ['equipe', 'servicos', 'maquinarios', 'materiais', 'ferramentas', 'fotos'],
        }));

        setTemplatePhases(phasesWithNames);
      } catch (err) {
        console.error('Erro ao carregar fases do template:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplatePhases();
  }, [isOpen, constructionId, language, t]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, comp: ComponentOption) => {
    e.dataTransfer.setData('componentId', comp.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData('componentId');
    const component = AVAILABLE_COMPONENTS.find(c => c.id === componentId);

    if (component && !selectedComponents.find(c => c.id === componentId)) {
      setSelectedComponents([...selectedComponents, component]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addComponent = (comp: ComponentOption) => {
    if (!selectedComponents.find(c => c.id === comp.id)) {
      setSelectedComponents([...selectedComponents, comp]);
    }
  };

  const removeComponent = (id: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.id !== id));
  };

  const selectTemplatePhase = (phase: TemplatePhaseOption) => {
    setSelectedTemplatePhase(phase);
    setPhaseName(phase.nome);
    setSelectedIcon(phase.icon as any);
    // Aplica componentes padrão do template
    const defaultComps = phase.components.map((cid: string) => {
      const comp = AVAILABLE_COMPONENTS.find(c => c.id === cid);
      return comp || AVAILABLE_COMPONENTS[0];
    });
    setSelectedComponents(defaultComps);
  };

  const resetAndClose = () => {
    setPhaseName('');
    setSelectedTemplatePhase(null);
    setSelectedIcon(DEFAULT_PHASE_ICON_ID);
    setSelectedComponents([]);
    onClose();
  };

  const handleConfirm = async () => {
    if (!phaseName.trim()) {
      alert(t('phase.name'));
      return;
    }
    if (selectedComponents.length === 0) {
      alert('Por favor, selecione ao menos um componente.');
      return;
    }

    const payload = {
      constructionId: constructionId,
      name: phaseName.trim(),
      icon: selectedIcon,
      components: selectedComponents.map(c => c.id)
    };

    try {
      setSaving(true);
      const response = await fetch('http://localhost:8080/create-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await refreshPhases();
        resetAndClose();
      } else {
        alert(t('phase.reportError'));
      }
    } catch (error) {
      console.error('Erro ao criar fase:', error);
      alert(t('phase.connectionError'));
    } finally {
      setSaving(false);
    }
  };

  const tComponent = (id: string) => {
    const comp = AVAILABLE_COMPONENTS.find(c => c.id === id);
    return comp ? comp.nome : id;
  };

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 p-4 sm:p-6 modal-backdrop backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-phase-title"
    >
      <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-phase-title" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Plus size={22} className="text-blue-600" />
              {t('phase.title')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{t('phase.dragComponents')}</p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6">
          {/* Seleção de fase do template */}
          {templatePhases.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t('phase.name')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {templatePhases.map((phase) => {
                  const isSelected = selectedTemplatePhase?.phaseId === phase.phaseId;
                  const Icon = PHASE_ICONS.find(o => o.id === phase.icon)?.icon || Package;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => selectTemplatePhase(phase)}
                      aria-label={phase.nome}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-300 text-gray-600'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs font-medium text-center truncate">{phase.nome}</span>
                    </button>
                  );
                })}
              </div>
              {selectedTemplatePhase && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {selectedTemplatePhase.nome} — {selectedTemplatePhase.components.length} componentes padrão
                </p>
              )}
            </div>
          )}

          {/* Nome da fase (editável) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('phase.name')}
            </label>
            <input
              type="text"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              placeholder={t('phase.namePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none text-base transition"
              autoFocus
            />
          </div>

          {/* Ícone da fase */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t('phase.icon')}
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {PHASE_ICONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedIcon === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedIcon(option.id)}
                    title={option.nome}
                    aria-label={`Ícone ${option.nome}`}
                    aria-pressed={isSelected}
                    className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {PHASE_ICONS.find((option) => option.id === selectedIcon)?.nome} — aparece na barra de fases.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Componentes disponíveis */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package size={16} className="text-blue-500" />
                {t('phase.availableComponents')}
              </h3>
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[320px] content-start">
                {AVAILABLE_COMPONENTS.map(comp => {
                  const isSelected = selectedComponents.some(c => c.id === comp.id);
                  const Icon = comp.icon;
                  return (
                    <button
                      type="button"
                      key={comp.id}
                      draggable={!isSelected}
                      onDragStart={(e) => handleDragStart(e, comp)}
                      onClick={() => addComponent(comp)}
                      disabled={isSelected}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-700 cursor-pointer'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-gray-200' : 'bg-blue-50'}`}>
                        <Icon size={20} className={isSelected ? 'text-gray-400' : 'text-blue-600'} />
                      </div>
                      <span className="font-medium text-sm">{tComponent(comp.id)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selecionados */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Save size={16} className="text-green-500" />
                {t('phase.selectedComponents')}
              </h3>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed transition-all min-h-[320px] ${
                  selectedComponents.length === 0
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-blue-200 bg-blue-50/40'
                }`}
              >
                {selectedComponents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center px-6">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Plus size={26} />
                    </div>
                    <p className="text-sm font-medium">{t('phase.dragComponents')}</p>
                    <p className="text-xs mt-1">{t('phase.clickComponents')}</p>
                  </div>
                ) : (
                  selectedComponents.map((comp, index) => {
                    const Icon = comp.icon;
                    return (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <Icon size={18} className="text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-gray-700 text-sm truncate">{tComponent(comp.id)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeComponent(comp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          aria-label={`Remover ${tComponent(comp.id)}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? t('phase.creating') : t('phase.confirm')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
