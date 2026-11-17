import {
  Package, Home, Building2, Layers, BrickWall, Hammer, Wrench,
  PaintBucket, Zap, Droplets, Trees, HardHat
} from 'lucide-react';

export type PhaseIconComponent = typeof Package;

export interface PhaseIconOption {
  id: string;
  nome: string;
  icon: PhaseIconComponent;
}

/**
 * Ícones disponíveis para as fases. O id é o que fica salvo no banco;
 * o componente é resolvido na UI.
 */
export const PHASE_ICONS: PhaseIconOption[] = [
  { id: 'package', nome: 'Caixa', icon: Package },
  { id: 'home', nome: 'Casa', icon: Home },
  { id: 'building-2', nome: 'Prédio', icon: Building2 },
  { id: 'layers', nome: 'Estrutura', icon: Layers },
  { id: 'brick-wall', nome: 'Alvenaria', icon: BrickWall },
  { id: 'hammer', nome: 'Martelo', icon: Hammer },
  { id: 'wrench', nome: 'Chave', icon: Wrench },
  { id: 'paint-bucket', nome: 'Pintura', icon: PaintBucket },
  { id: 'zap', nome: 'Elétrica', icon: Zap },
  { id: 'droplets', nome: 'Hidráulica', icon: Droplets },
  { id: 'trees', nome: 'Terreno', icon: Trees },
  { id: 'hard-hat', nome: 'Segurança', icon: HardHat },
];

export const DEFAULT_PHASE_ICON_ID = 'package';

export function resolvePhaseIcon(id?: string | null): PhaseIconComponent {
  return PHASE_ICONS.find((option) => option.id === id)?.icon || Package;
}
