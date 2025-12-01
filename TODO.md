# TODO: Implementar carregamento dinâmico de dados das fases via GET após login

## Tarefas Concluídas
- [x] Criar serviço `phases.service.ts` para buscar dados das fases via GET
- [x] Atualizar `PhasesContext.tsx` para carregar dados após login
- [x] Adicionar hook `useCurrentPhaseData` no contexto
- [x] Atualizar `PhaseLayout.tsx` para aceitar `initialData`
- [x] Atualizar `FaseEstrutura.tsx` para usar dados carregados
- [x] Atualizar `PhaseLayout.tsx` para usar `initialData` em `handleSaveWithData` em vez de localStorage
- [x] Atualizar `SecaoConteudo.tsx` para passar `initialData` aos componentes filhos
- [x] Atualizar componente `team-present` para aceitar e usar `initialData`

## Tarefas Pendentes
- [ ] Atualizar componentes individuais restantes (executed-services, machinery, tools, used-materials, etc.) para aceitar e usar `initialData`
- [ ] Aplicar mudanças similares a todas as outras fases (FaseFundacao, FaseAlvenaria, etc.)
- [ ] Testar o carregamento dinâmico após login
