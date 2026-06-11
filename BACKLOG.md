# 📋 Produto: Personal Climb - Backlog & Mapa de Execução

**Contexto:** Plataforma de gestão para Personal Trainers. Motor de hotsites white-label dinâmicos, prescrição de treinos assistida por IA (Copilot via Gemini), assinaturas gerenciadas pelo Stripe e gamificação (Web3 hybrid off-chain).
**Stack Principal:** Next.js 15, React 19, Tailwind v4, Bun, Hono (Edge), Drizzle ORM/PostgreSQL, Sanity CMS, Privy (Auth + Web3 Wallet), Hardhat.
**Objetivo do MVP / Próxima Release:** Estabilizar fluxos operacionais críticos (agenda e check-in), lançar o Agente IA (Copilot do Treinador com base no Sanity e sugestões dinâmicas) e consolidar o motor de gamificação de XP off-chain com endpoints de validação para terceiros.

---

## 🏗️ Infra & Core Engine
*Fluxos fundacionais de negócio e identidade já estabelecidos ou em estabilização.*

- [x] **UC01: Seleção de Perfil (Onboarding)**
  - *Status:* Implementado.
  - *Técnico:* Redirecionamento dinâmico inteligente (Aluno vs Personal). Estado efêmero persistido via `sessionStorage` (`hasSeenUserTypeModal`).
- [x] **UC02: Autenticação Universal & Web3 (Privy)**
  - *Status:* Implementado.
  - *Técnico:* Auth passwordless (OTP/Magic Link) provendo Embedded Wallet invisível (flag `createOnLogin`). Entidade primária mapeada via Privy DID em Postgres (`text`).
- [x] **UC03: Assinatura e Pagamentos (Stripe Checkout)**
  - *Status:* Implementado.
  - *Técnico:* Fluxo de checkout integrado no hotsite do treinador.
- [x] **UC04: Gestão de Assinaturas (Billing Tracker)**
  - *Status:* Implementado.
  - *Técnico:* Usage-based billing sincronizado em background via Stripe Webhooks. Status reflete nas tabelas `personals` e `athletes` (controle de acesso).

## 🖥️ Frontend & UX (Hotsite & Dashboard)
*Gestão e parametrização das áreas do Treinador (Dashboard) e do Aluno (Hotsite).*

- [x] **UC05: Hotsite White-label Dinâmico (Core Engine)**
  - *Status:* Implementado.
  - *Técnico:* Roteamento dinâmico `/personal/[slug]` em Next.js (SSG via `generateStaticParams`). Mesclagem de configurações (Drizzle ORM + Sanity CMS).
- [ ] **UC06: Setup de Marca e Perfil (CMS/DB Integration)**
  - *Critério de Aceite:* Interface no Dashboard do Personal para atualizar cores, bio e pacotes. Os dados devem atualizar nos respectivos bancos de origem (ex: Postgres para pacotes, CMS Sanity para bio/cores). O Hotsite deve buscar os dados corretamente de cada fonte. Requer cobertura E2E com Playwright.
- [x] **UC08: Motor de Agenda e Capacidade (Schedule Slots)**
  - *Critério de Aceite:* CRUD de `schedule_slots` para horários presenciais/online com vagas limitadas. *Gap Técnico:* Garantir bloqueios contra overbooking delegando para as constraints transacionais e isolation level `serializable` do Postgres, sem necessidade de filas. Requer testes no `server` com `bun:test`.
- [ ] **UC09: CRM do Treinador (Gestão de Atletas)**
  - *Critério de Aceite:* Tabela analítica consolidando alunos ativos (`isActive = true`), status de pagamento Stripe e sumário de progresso. *Regra de Negócio:* Em caso de cancelamento da assinatura pelo aluno, o acesso deve ser mantido até o final do ciclo de faturamento atual (Stripe billing cycle). Requer cobertura E2E no `client` com Playwright.
- [ ] **UC11: Onboarding Clínico do Atleta (Anamnese)**
  - *Critério de Aceite:* Formulário pós-checkout validado via Zod. Os dados estruturados (`anamnesis`, `physical_stats`) atuarão como contexto base para o Agente de IA. Requer testes E2E para submissão do formulário.
- [x] **UC12: Agendamento e Check-in de Treinos**
  - *Status:* Implementado.
  - *Critério de Aceite:* Fluxo crítico. A API `/checkin` (Edge via Hono) deve aplicar validação rigorosa de UUIDs (Zod) e prevenir _data races_ na marcação concorrente de slots de horário. Requer testes unitários intensivos via `bun:test` usando `mock.module` para simular concorrência e erros de restrição (duplicação de chaves).
- [ ] **UC13: Feedback Subjetivo Pós-Treino (Log RPE)**
  - *Critério de Aceite:* Input diário de Percepção Subjetiva de Esforço persistido no `workout_log` que irá retroalimentar heurísticas da IA.

## 🤖 IA Copilot & Base de Conhecimento
*O núcleo inteligente: O treinador atua como piloto de alto nível, e a IA monta os treinos baseada em parâmetros.*

- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - *Critério de Aceite:* Estruturação de schemas (ex: `exercise.ts`) no Sanity para criar a biblioteca de referência da IA.
- [ ] **UC07: Definição do Protocolo Base de IA**
  - *Critério de Aceite:* Persistir (via Drizzle) as regras de ouro, métricas e maquinário base do treinador. Esse artefato comporá o *System Prompt* determinístico do LLM.
- [ ] **UC10: Geração de Treino Assistida (Copilot Human-in-the-Loop)**
  - *Critério de Aceite:* Agente (Gemini) gera treinos via Tool Calling analisando a anamnese (UC11), regras do treinador (UC07). Não há necessidade de RAG: o agente usará uma tool simples para buscar/consultar exercícios baseados no acervo do Sanity. É obrigatório o fluxo de *Human-in-the-loop* (treinador aprova antes de expor ao aluno). Requer testes de fallback visual da interface caso a API falhe (via Playwright) e testes no Hono verificando validação do output (Zod).

## 🎮 Gamificação Web3 & XP
*Engajamento via XP gerenciado off-chain com validação criptográfica simples.*

- [x] **UC14: Motor de XP Off-Chain**
  - *Critério de Aceite:* Consolidar saldo/nível em relacional (Postgres). Limites rígidos (caps diários/semanais de XP) controlados centralmente no `lib/gamification.ts`, rodando no servidor (validando fusos horários seguros) para impedir manipulação client-side e farming. Requer `bun:test` focado nos limites de taxa de cooldown.
- [ ] **UC17: Endpoints de Verificação de Autenticidade e Claims (Web3)**
  - *Critério de Aceite:* Utilizar a Smart Wallet gerada nativamente no login da Privy para registrar conquistas/XP. A solução deve ser simples, prática e barata (ex: patrocínio de gas via Privy / Paymasters em L2). A principal exigência é que outra plataforma possa checar o XP e conquistas do usuário de maneira aberta.

## 📈 Monitoramento & Analytics
*Tarefas financeiras delegadas e relatórios.*

- [ ] **UC16: Relatórios e Faturamento via Stripe Dashboard**
  - *Critério de Aceite:* Criar proxy seguro para gerar sessões no Portal do Cliente da Stripe, delegando para eles a gestão de faturas, MRR e Churn, evitando sobrecarregar o Edge Runtime da Vercel com processamento analítico pesado.

---

## 🔒 Pontos Cegos & Edge Cases (Resiliência)
*Tarefas focadas em segurança, arquitetura preventiva e resiliência a falhas.*

- [ ] **Tratamento de Falhas e Degradação Graciosa da IA:**
  - *Descrição:* Timeout/rate-limit do Gemini. Implementar fallback visual para o treinador. Validação estrita via esquema (Zod) da saída JSON da IA.
- [x] **Validação Estrita de Carga de Slots (Overbooking):**
  - *Status:* Implementado.
  - *Descrição:* Prevenção contra data races. Usar isolation level `serializable` nas transações críticas no PostgreSQL (Hono/Drizzle).
- [x] **Segurança de XP / Abuso de Gamificação (Anti-farming):**
  - *Descrição:* Prevenir manipulação de relógio do cliente. Centralizar a lógica de XP (`lib/gamification.ts`) usando o relógio do servidor para calcular cooldowns e limites.
- [x] **Segurança de Segredos e Válvulas de Escape em Export Estático:**
  - *Descrição:* Prevenir vazamento de variáveis de ambiente. Auditar `NEXT_PUBLIC_` env vars no `next.config.mjs` e workflows de CI/CD para que segredos do banco não entrem no client bundle.
- [ ] **Idempotência de Webhooks de Pagamento:**
  - *Descrição:* Prevenir cobranças duplicadas ou cancelamento incorreto de assinaturas. A lógica do Stripe Webhook deve ser idempotente (checar banco antes de agir e confirmar a data de expiração do ciclo para não cortar o acesso antecipadamente).
- [x] **Performance de Renderização & Fontes Next.js:**
  - *Descrição:* Prevenir avisos do browser de preload de fontes mal utilizados, garantindo que variáveis CSS exportadas (como `next/font/local`) sejam efetivamente referenciadas em `globals.css` dentro do fluxo estático.