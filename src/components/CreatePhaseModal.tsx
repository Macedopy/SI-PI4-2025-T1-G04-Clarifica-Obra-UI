import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Plus, Trash2, Wrench, Package,
  Users, Truck, Hammer, Camera, AlertTriangle,
  Info, Save
} from 'lucide-react';
import { usePhasesData } from '../contexts/PhasesContext';
import { DEFAULT_PHASE_ICON_ID, PHASE_ICONS } from '../utils/phaseIcons';

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

interface CreatePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export const CreatePhaseModal: React.FC<CreatePhaseModalProps> = ({ isOpen, onClose, customerId }) => {
  const { refreshPhases } = usePhasesData();
  const [phaseName, setPhaseName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_PHASE_ICON_ID);
  const [selectedComponents, setSelectedComponents] = useState<ComponentOption[]>([]);
  const [saving, setSaving] = useState(false);

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

  const resetAndClose = () => {
    setPhaseName('');
    setSelectedIcon(DEFAULT_PHASE_ICON_ID);
    setSelectedComponents([]);
    onClose();
  };

  const handleConfirm = async () => {
    if (!phaseName.trim()) {
      alert('Por favor, insira o nome da fase.');
      return;
    }
    if (selectedComponents.length === 0) {
      alert('Por favor, selecione ao menos um componente.');
      return;
    }

    const payload = {
      constructionId: customerId,
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
        alert('Erro ao criar fase. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar fase:', error);
      alert('Falha na conexão com o servidor.');
    } finally {
      setSaving(false);
    }
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
              Configurar Nova Fase
            </h2>
            <p className="text-sm text-gray-500 mt-1">Arraste os componentes ou clique para montar a sua fase</p>
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
          {/* Nome da fase */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nome da Fase
            </label>
            <input
              type="text"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              placeholder="Ex: Instalação de Esquadrias, Pintura..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none text-base transition"
              autoFocus
            />
          </div>

          {/* Ícone da fase */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ícone da Fase
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
                Componentes disponíveis
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
                      <span className="font-medium text-sm">{comp.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selecionados */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Save size={16} className="text-green-500" />
                Componentes da nova fase
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
                    <p className="text-sm font-medium">Arraste os componentes aqui</p>
                    <p className="text-xs mt-1">ou clique nos itens ao lado</p>
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
                          <span className="font-medium text-gray-700 text-sm truncate">{comp.nome}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeComponent(comp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          aria-label={`Remover ${comp.nome}`}
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
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Criando...' : 'Confirmar Criação'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
