# Backlog - Personal Climb

Este documento centraliza o mapeamento dos Casos de Uso (UCs) da plataforma Personal Climb, organizados por épicos e detalhados para execução técnica.

A visão do produto foca na estabilização do motor de onboarding dinâmico, hotsite white-label e na expansão para IA e mecânicas Web3 avançadas.

---

## 🏗️ Infra & Core Engine

Foco nos fluxos fundamentais de plataforma, infraestrutura de banco de dados e roteamento principal.

- [x] **UC01: Seleção de Perfil (Onboarding)**
  - Redirecionamento na landing page entre Aluno e Personal.
  - *Técnico:* Modal via UI; estado de sessão em `sessionStorage` (`hasSeenUserTypeModal`).
- [x] **UC02: Autenticação Universal (Privy)**
  - Login passwordless via e-mail e provisionamento transparente de Embedded Wallet.
  - *Técnico:* Uso de `@privy-io/react-auth` (`createOnLogin: true`). DID persistido como chave primária em PostgreSQL (tipo texto).
- [x] **UC03: Assinatura e Pagamentos (Stripe Checkout)**
  - Contratação de pacotes pelo atleta via Hotsite.
  - *Técnico:* Integração Stripe Checkout (modo subscription).
- [x] **UC04: Gestão de Assinaturas (Billing Tracker)**
  - Cobrança baseada no uso para o Personal (usage-based billing).
  - *Técnico:* Webhooks Stripe para update assíncrono; controle de acesso via flag `athletes.isActive`.

---

## 🖥️ Frontend & UX

Tarefas focadas na experiência, parametrização de Hotsite, CRM e UI/UX geral.

- [x] **UC05: Hotsite White-label Dinâmico**
  - Hotsite do treinador com rota dedicada.
  - *Técnico:* Next.js static export (`output: 'export'`) em `/personal/[slug]` via `generateStaticParams`.
- [ ] **UC06: Configuração de Marca e Perfil (CMS/DB Integration)**
  - **Descrição:** Dashboard do treinador para gestão de nome, cores, biografia e pacotes de venda.
  - **Critérios de Aceite:** Integração dual Sanity CMS (design/content) e PostgreSQL (Drizzle) para persistência; reflexo automático no hotsite estático.
- [ ] **UC09: CRM e Dashboard de Atletas**
  - **Descrição:** Visão unificada de alunos ativos (`athletes.isActive = true`), níveis, inadimplência e evolução.
  - **Critérios de Aceite:** Otimização de queries no PostgreSQL utilizando índices nas tabelas relacionais; carregamento lazy de métricas não críticas.
- [ ] **UC11: Onboarding Clínico (Anamnese e Avaliação Física)**
  - **Descrição:** Formulário transacional para captação do histórico clínico do aluno, lesões e medidas base.
  - **Critérios de Aceite:** Inserção relacional e tipada (Zod) de formulários grandes na tabela `anamnesis`.

---

## 🤖 Agente de Inteligência Artificial (Gemini)

Módulo de prescrição de treinos utilizando LLM.

- [ ] **UC07: Definição do Protocolo de Treino (Setup da IA)**
  - **Descrição:** Setup de "regras de ouro" (prompt de sistema personalizado do treinador).
  - **Critérios de Aceite:** Armazenamento do payload versionado; constraints e fallback configuráveis.
- [ ] **UC10: Revisão e Aprovação de Treinos (Human-in-the-loop IA)**
  - **Descrição:** O agente de IA cruza anamnese com o Sanity CMS, sugere o treino e exige a aprovação do personal.
  - **Critérios de Aceite:** Utilizar *tool calling* do modelo Gemini para persistir drafts de treino. Implementar UI para fallback em caso de rejeição de output ou indisponibilidade da API do LLM.
- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - **Descrição:** Biblioteca de exercícios e templates injetados na memória do Agente de IA.
  - **Critérios de Aceite:** Schemas no Sanity (`exercise.ts`) expostos via queries GROQ eficientes para o backend (Hono).

---

## 📅 Agenda & Check-in

- [ ] **UC08: Gestão de Agenda e Horários**
  - **Descrição:** Gerenciamento de `schedule_slots` de capacidade definida pelo treinador.
  - **Critérios de Aceite:** Prevenção de overbooking delegada a constraints de banco (`UNIQUE`, `CHECK`) e isolation levels do PG (`serializable`).
- [ ] **UC12: Agendamento e Check-in de Treinos**
  - **Descrição:** Calendário atleta-treinador; reserva de horários físicos/online.
  - **Critérios de Aceite:** Validação de payload de entrada via Hono e middleware Zod (checagem estrita de UUIDs do atleta e slot).
- [ ] **UC13: Execução do Treino e Log de RPE**
  - **Descrição:** Entrada diária da Percepção Subjetiva de Esforço (RPE) no fim da sessão.
  - **Critérios de Aceite:** Registro no `workout_log` interligado ao cálculo do Agente de IA.

---

## ⛓️ Web3 & Gamificação

- [ ] **UC14: Gamificação e Progressão de Nível**
  - **Descrição:** Concluir treinos gera XP via sistema de cooldown limit (on/off-chain).
  - **Critérios de Aceite:** Geração e assinatura de payloads EIP-712 com Viem; validação via smart contract `XpAttestation`. Taxas de rede subsidiadas via Privy Paymaster (Meta-transactions).
- [ ] **UC17: Web3 Streaks (Nova Adição)**
  - **Descrição:** Mecânica de retenção baseada em streaks de treinos consecutivos com recompensa on-chain adicional.
  - **Critérios de Aceite:** Oráculo on-chain ou validação em batch no backend Hono para aprimorar recompensas em XP ou emissões de NFTs de conquista (sem atrito de wallet).

---

## 📈 Monitoramento & Analytics

- [ ] **UC16: Relatórios Financeiros (Nova Adição)**
  - **Descrição:** Dashboard analítico avançado de faturamento e churn para o treinador.
  - **Critérios de Aceite:** Como o core via Hono roda no Vercel Edge Runtime (incompatível com cargas pesadas de Node/PDF), delegar a geração de relatórios massivos a lambdas Serverless padrão (Node.js) ou workers assíncronos.

---

## 🔒 Segurança & Resiliência (Pontos Cegos & Edge Cases)

Tarefas focadas em segurança proativa e arquitetura defensiva.

- [ ] **Resiliência da Engine de IA:** Se a API do Gemini falhar (rate limit, timeout) ou retornar payload corrompido (falha na Zod schema), o backend não deve quebrar a UI. Requer UI de fallback ("Modo Manual") e logging crítico no Sentry.
- [ ] **Isolamento de Transações (Checkins):** Validar a configuração de Drizzle/PG para impedir race conditions no agendamento e gasto duplo de gamificação sob concorrência.
- [ ] **Prevenção de Abuso no Farming de XP:** Implementar rate limiter e validações cronológicas (cooldown via `setSystemTime` mocks nos testes do Bun) para evitar scripts maliciosos injetando EIP-712 repetidamente.
- [ ] **Gestão de Segredos no Static Export:** O build do Next.js via GitHub Actions necessita injeção correta das vars (`NEXT_PUBLIC_`) sem vazar credenciais sensíveis no bundle `client/out`.
- [ ] **Monitoramento Financeiro Web3:** Alerting contínuo do consumo de Paymaster (Privy); travas de segurança caso as taxas subam vertiginosamente.
