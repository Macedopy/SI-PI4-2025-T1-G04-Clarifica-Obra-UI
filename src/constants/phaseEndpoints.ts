// src/constants/phaseEndpoints.ts
export const phaseEndpoints: Record<string, string> = {
  preparacao: 'terrain-preparation',
  fundacao: 'foundation',
  estrutura: 'structure',
  alvenaria: 'masonry',
  cobertura: 'roofing',
  'instalacoes-hidraulicas': 'hydraulic', // Corrigido para consistência com o código das fases (anteriormente 'plumbing'; ajuste se necessário)
  'instalacoes-eletricas': 'eletric', // Corrigido para consistência (anteriormente 'electrical')
  revestimentos: 'coatings', // Corrigido para consistência (anteriormente 'finishing')
  acabamentos: 'finishing',
};
