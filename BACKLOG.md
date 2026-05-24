# 📋 Produto: Personal Climb - Backlog & Mapa de Execução

**Contexto:** Plataforma de gestão para Personal Trainers. Conta com motor de hotsites white-label dinâmicos, prescrição de treinos assistida por IA (Copilot via Gemini), assinaturas gerenciadas pelo Stripe e gamificação (Web3 hybrid off-chain).
**Stack Principal:** Next.js 15, React 19, Tailwind v4, Bun, Hono (Edge), Drizzle ORM/PostgreSQL, Sanity CMS, Privy (Auth + Web3 Wallet), Hardhat.
**Objetivo do MVP / Próxima Release:** Estabilizar fluxos operacionais críticos (agenda e check-in), lançar o Agente IA (Copilot do Treinador com base no Sanity e sugestões dinâmicas) e consolidar o motor de gamificação de XP off-chain com endpoints de validação para terceiros.

---

## 🏗️ Infra & Core Engine
*Fluxos fundacionais de negócio e identidade já estabelecidos ou em estabilização.*

- [x] **UC01: Seleção de Perfil (Onboarding)**
  - *Técnico:* Redirecionamento dinâmico inteligente (Aluno vs Personal). Estado efêmero persistido via `sessionStorage` (`hasSeenUserTypeModal`).
- [x] **UC02: Autenticação Universal & Web3 (Privy)**
  - *Técnico:* Auth passwordless (OTP/Magic Link) provendo Embedded Wallet invisível (flag `createOnLogin`). Entidade primária mapeada via Privy DID em Postgres (`text`).
- [x] **UC03: Assinatura e Pagamentos (Stripe Checkout)**
  - *Técnico:* Fluxo de checkout integrado no hotsite do treinador.
- [x] **UC04: Gestão de Assinaturas (Billing Tracker)**
  - *Técnico:* Usage-based billing sincronizado em background via Stripe Webhooks. Status reflete nas tabelas `personals` e `athletes` (controle de acesso).

## 🖥️ Frontend & UX (Hotsite & Dashboard)
*Gestão e parametrização das áreas do Treinador (Dashboard) e do Aluno (Hotsite).*

- [x] **UC05: Hotsite White-label Dinâmico (Core Engine)**
  - *Técnico:* Roteamento dinâmico `/personal/[slug]` em Next.js (SSG via `generateStaticParams`). Mesclagem de configurações (Drizzle ORM + Sanity CMS).
- [ ] **UC06: Setup de Marca e Perfil (CMS/DB Integration)**
  - **Critério de Aceite:** Interface no Dashboard do Personal para atualizar cores, bio e pacotes. Os dados devem atualizar nos respectivos bancos de origem (ex: Postgres para pacotes, CMS Sanity para bio/cores). O Hotsite deve buscar os dados corretamente de cada fonte, assumindo que eles são entidades distintas na arquitetura. Requer cobertura E2E com Playwright.
- [ ] **UC08: Motor de Agenda e Capacidade (Schedule Slots)**
  - **Critério de Aceite:** CRUD de `schedule_slots` para horários presenciais/online com vagas limitadas. *Gap Técnico:* Garantir bloqueios contra overbooking delegando para as constraints transacionais e isolation level `serializable` do Postgres, sem necessidade de filas. Requer testes no `server` com `bun:test`.
- [ ] **UC09: CRM do Treinador (Gestão de Atletas)**
  - **Critério de Aceite:** Tabela analítica consolidando alunos ativos (`isActive = true`), status de pagamento Stripe e sumário de progresso (XP/Nível). Requer cobertura E2E no `client` com Playwright.
- [ ] **UC11: Onboarding Clínico do Atleta (Anamnese)**
  - **Critério de Aceite:** Formulário pós-checkout validado via Zod. Os dados estruturados (`anamnesis`, `physical_stats`) atuarão como contexto base para o Agente de IA. Requer testes E2E para submissão do formulário.
- [ ] **UC12: Agendamento e Check-in de Treinos**
  - **Critério de Aceite:** Fluxo crítico. A API `/checkin` (Edge via Hono) deve aplicar validação rigorosa de UUIDs (Zod) e prevenir _data races_ na marcação concorrente de slots de horário. Requer testes unitários intensivos via `bun:test` usando `mock.module` para simular concorrência e erros de restrição (duplicação de chaves).
- [ ] **UC13: Feedback Subjetivo Pós-Treino (Log RPE)**
  - **Critério de Aceite:** Input diário de Percepção Subjetiva de Esforço persistido no `workout_log` que irá retroalimentar heurísticas da IA.

## 🤖 IA Copilot & Base de Conhecimento
*O núcleo inteligente: O treinador atua como piloto de alto nível, e a IA monta os treinos baseada em parâmetros.*

- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - **Critério de Aceite:** Estruturação de schemas (ex: `exercise.ts`) no Sanity para criar a biblioteca de referência da IA.
- [ ] **UC07: Definição do Protocolo Base de IA**
  - **Critério de Aceite:** Persistir (via Drizzle) as regras de ouro, métricas e maquinário base do treinador. Esse artefato comporá o *System Prompt* determinístico do LLM.
- [ ] **UC10: Geração de Treino Assistida (Copilot Human-in-the-Loop)**
  - **Critério de Aceite:** Agente (Gemini) gera treinos via Tool Calling analisando a anamnese (UC11), as regras do treinador (UC07) e o acervo (UC15). Deve sugerir exercícios do Sanity mas ter autonomia para novas sugestões. É obrigatório o fluxo de *Human-in-the-loop* (treinador aprova antes de expor ao aluno). Requer testes extensivos de fallback visual da interface caso a API falhe (via Playwright) e testes no Hono verificando validação do output via Zod.

## 🎮 Gamificação & Progressão (Web3-Hybrid)
*Engajamento via XP gerenciado off-chain com validação criptográfica.*

- [ ] **UC14: Motor de XP Off-Chain**
  - **Critério de Aceite:** Consolidar saldo/nível em relacional (Postgres). Deve usar limites rígidos (caps diários/semanais de XP) controlados centralmente no `lib/gamification.ts`, rodando obrigatoriamente do lado do servidor (validando fusos horários seguros) para impedir manipulação client-side e farming. Requer `bun:test` focado nos limites de taxa de cooldown.
- [ ] **UC17: Endpoints de Verificação de Autenticidade (Third-Party Check)**
  - **Critério de Aceite:** Desenvolver API de emissão/verificação de Provas usando assinaturas EIP-712 com o contrato `XpAttestation`, permitindo a terceiros auditar streaks sem a necessidade de gravar cada check-in na blockchain.

## 📈 Monitoramento & Analytics
*Tarefas financeiras delegadas.*

- [ ] **UC16: Relatórios e Faturamento via Stripe Dashboard**
  - **Critério de Aceite:** Criar proxy seguro para gerar sessões no Portal do Cliente da Stripe, que cuidará de MRR, Churn e faturas, evitando processamento analítico no Vercel Edge.

---

## 🔒 Pontos Cegos & Edge Cases
*Tarefas de infraestrutura essenciais para resiliência arquitetural e segurança preventiva.*

- [ ] **Tratamento de Falhas e Degradação Graciosa da IA:**
  - **Contexto:** Timouts ou rate limits do Gemini não podem paralisar o app.
  - **Ação:** Implementar circuito de fallback visual (UI degraded) na aprovação de treinos e validação estrita (Zod parsing) de Tool Calling JSON emitidos pela IA.
- [ ] **Validação Estrita de Carga de Slots (Overbooking):**
  - **Contexto:** Prevenção contra data races.
  - **Ação:** Usar nível de isolamento `serializable` em transações chave no banco e simular (via `mock.module` no `bun:test`) conflitos de concorrência massiva no agendamento e check-in.
- [ ] **Segurança de XP / Abuso de Gamificação:**
  - **Contexto:** Usuários maliciosos podem tentar fraudar timestamps via client para farmar XP (ex: mudando timezone no browser).
  - **Ação:** Centralizar regras e caps diários/semanais em `lib/gamification.ts`, avaliando os tempos e cooldowns baseados *apenas* no relógio seguro do servidor.
- [ ] **Segurança de Segredos e Válvulas de Escape em Export Estático:**
  - **Contexto:** Proteção contra vazamento de chaves privadas em builds de client Next.js.
  - **Ação:** Auditar flags `NEXT_PUBLIC_` e os arquivos de deploy de GitHub Actions, e assegurar que as dependências/secrets sensíveis do Hono (backend) fiquem blindados do bundle de `output: 'export'`.
- [ ] **Idempotência de Webhooks de Pagamento:**
  - **Contexto:** Prevenir cobranças duplicadas ou interrupções de acesso indevidas caso a Stripe reenvie payloads idênticos.
  - **Ação:** Registrar processamentos e lidar de forma idempotente em eventos críticos como `customer.subscription.updated`.