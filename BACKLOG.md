# Backlog - Personal Climb

Este documento centraliza o mapeamento dos Casos de Uso (UCs) da plataforma Personal Climb, organizados por épicos e com o detalhamento necessário para a execução técnica.

A visão atual de produto foca em estabilizar o motor de onboarding dinâmico e o core hotsite white-label da aplicação, visando suportar a expansão das mecânicas avançadas, integração Web3, tracking de wearables e a retroalimentação de IA baseada no modelo LLM escolhido (Gemini).

---

## 🏗️ Épico 1: Infra & Core Engine (Concluídos / Em Curso)

Esta seção mapeia os fluxos fundamentais de fundação e negócios principais da plataforma.

- [x] **UC01: Seleção de Perfil (Onboarding)**
  - Redirecionamento inteligente na landing page entre Aluno (Hotsite White-label) e Personal (Produto Business).
  - *Técnico:* Modal exibido na página inicial e estado salvo em `sessionStorage` (`hasSeenUserTypeModal`).
- [x] **UC02: Autenticação Universal (Privy)**
  - Login exclusivo via email (OTP/Magic Link passwordless), com provisionamento invisível de carteira Web3 (Embedded Wallet) gerada automaticamente para o usuário.
  - *Técnico:* Integração `@privy-io/react-auth` no front com flag `createOnLogin` habilitada para embedded wallets. O identificador principal é o DID do Privy no banco (SQL/Postgres).
- [x] **UC03: Assinatura e Pagamentos (Stripe Checkout)**
  - Contratação de pacotes de treinamento pelo atleta no Hotsite do treinador.
- [x] **UC04: Gestão de Assinaturas (Billing Tracker)**
  - Cobrança baseada no uso para o Personal (usage-based billing). Controlado ativamente pela flag `athletes.isActive`.
  - *Técnico:* Acompanhamento em background via Stripe Webhooks e sincronização com a tabela `personals` (`stripeSubscriptionId`, `subscriptionStatus`).

---

## 🖥️ Épico 2: Frontend & UX (Dashboard & White-label)

Tarefas focadas na experiência, parametrização e gestão tanto do treinador quanto do atleta.

- [x] **UC05: Hotsite White-label Dinâmico**
  - Carregamento customizado de cores, nome e treinos baseado na rota.
  - *Técnico:* Roteamento dinâmico `/personal/[slug]` em Next.js com geração estática (`generateStaticParams`). Informações dinâmicas mescladas do banco de dados (SQL) e Sanity CMS.
- [ ] **UC06: Configuração de Marca e Perfil (CMS/DB Integration)**
  - **Descrição:** Interface no dashboard do treinador para definir/editar nome, cores primárias/secundárias, biografia e pacotes de treinamento.
  - **Critérios de Aceite:** Alterações salvas com sucesso em banco de dados e refletidas imediatamente no hotsite com integração dual de Sanity CMS e Drizzle (SQL).
- [ ] **UC08: Gestão de Agenda e Horários**
  - **Descrição:** Criação e gerenciamento de `schedule_slots` de horário para treinos presenciais e online, incluindo a definição de capacidade máxima de vagas por horário.
  - **Critérios de Aceite:** Validação eficiente para evitar overbooking, delegando para constraints e isolamento padrão do PostgreSQL (sem necessidade imediata de filas assíncronas custosas, dado o volume inicialmente projetado).
- [ ] **UC09: CRM e Dashboard de Atletas**
  - **Descrição:** Painel analítico onde o treinador visualiza uma lista geral de seus alunos ativos (`athletes.isActive = true`), os respectivos níveis técnicos, status de pagamentos, taxas de adesão aos treinos e métricas de evolução.
- [ ] **UC11: Onboarding Clínico (Anamnese e Avaliação Física)**
  - **Descrição:** Primeiro passo pós-contratação. Fluxo para o atleta preencher o formulário de anamnese, detalhando histórico de lesões, características físicas e seu nível base atual.
  - **Critérios de Aceite:** Inserção em massa controlada (`anamnesis`, `physical_stats`) e flags para lesões ativadas no input da IA.
- [ ] **UC12: Agendamento e Check-in de Treinos**
  - **Descrição:** Visualização em calendário da disponibilidade do Personal e marcação do check-in pelo aluno.
  - **Critérios de Aceite:** Validação de UUID de agendamento usando Zod via middleware do Hono no backend e prevenção em real-time contra reservas duplicadas.
- [ ] **UC13: Execução do Treino e Feedback Subjetivo (Log de RPE)**
  - **Descrição:** Visualização diária do treino e entrada obrigatória da Percepção Subjetiva de Esforço (RPE) no fim da sessão para o `workout_log`.

---

## 🤖 Épico 3: IA & Base de Conhecimento

Desenvolvimento da inteligência de geração e controle do treinamento físico, evoluída para o paradigma de Agentes autônomos.

- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - **Descrição:** O treinador poderá pré-cadastrar exercícios e blocos de treino no Sanity CMS. Esta base servirá como biblioteca e insumo estrito para as decisões do Agente de IA na montagem das sessões.
  - **Critérios de Aceite:** Criação e integração dos schemas (e.g., `exercise.ts`, `trainingBlock.ts`) no Sanity Studio, com consultas otimizadas via GROQ disponibilizadas para o backend (Hono).
- [ ] **UC07: Definição do Protocolo de Treino (Setup da IA)**
  - **Descrição:** Tela para configuração do "prompt customizado" do treinador. Envolve definir as métricas preferidas para avaliação, regras de ouro do treinador e limitações padrões de equipamento.
  - **Critérios de Aceite:** O payload de configuração deve ser versionado no banco. Estruturar inputs flexíveis que alimentem o prompt de sistema do Google Gemini de forma determinística.
- [ ] **UC10: Revisão e Aprovação de Treinos (Human-in-the-loop IA)**
  - **Descrição:** O Agente atuará de forma ativa: ele vai ler o contexto (dados e anamnese do atleta + conversa/protocolo com o treinador), cruzar com a base de exercícios (Sanity), gerar o treino dinamicamente, *pré-cadastrá-lo* no CMS/DB, e solicitar a aprovação. O treinador recebe sugestões estruturadas e pode aprovar ou editar manualmente.
  - **Critérios de Aceite:** Implementar tool calling no LLM (Gemini) para interagir com o Sanity/Drizzle. Se a API do Gemini falhar (timeout ou erro de output), exibir feedback visual claro ao usuário e recuar para a geração de "treino template estático", impedindo o bloqueio da esteira do treinador.

---

## 📈 Épico 4: Monitoramento & Analytics (Financeiro & Performance)

Tarefas focadas na extração de métricas de negócio e dados fisiológicos do atleta.

- [ ] **UC16: Relatórios Financeiros via Stripe**
  - **Descrição:** Redirecionamento seguro para o portal nativo de Billing/Dashboard da Stripe, delegando a visualização de faturamento, assinaturas ativas e churn para o provedor financeiro.
  - **Critérios de Aceite:** O dashboard do Personal deve conter um CTA protegido que gera uma sessão de portal da Stripe (`stripe.billingPortal.sessions.create`) para visualização direta pelo treinador, sem necessidade de construir UI customizada robusta de relatórios neste MVP.
- [ ] **UC18: Integração com Wearables (Strava/Garmin)**
  - **Descrição:** Ingestão de dados reais de atividades físicas e recuperação passiva para enriquecer as métricas contextuais do Agente de IA antes da geração do treino.
  - **Critérios de Aceite:** Implementar endpoints no Hono (`/api/webhooks/wearables`) para receber payloads via webhooks. Garantir normalização dos dados e inserção em tabelas apropriadas (`physical_stats` / `activity_logs`).

---

## ⛓️ Épico 5: Web3 & Gamificação

- [ ] **UC14: Gamificação e Progressão de Nível**
  - **Descrição:** Concluir treinos gera XP, gerido via sistema de rate limit de cooldowns.
  - **Critérios de Aceite:** A infraestrutura de meta-transaction/patrocínio do Privy garantirá as gas fees. O atleta não necessita fundos nativos para assinar e resgatar tokens via EIP-712 com o smart contract `XpAttestation`.
- [ ] **UC17: Web3 Streaks (Ofensivas off-chain/on-chain)**
  - **Descrição:** Rastreamento de dias consecutivos de treino (streaks), emitindo badges/prêmios on-chain após marcos de consistência.
  - **Critérios de Aceite:** Manter o estado contínuo (contador de dias) em PostgreSQL (off-chain) para performance. Apenas ao alcançar marcos específicos (ex: 7 ou 30 dias de ofensiva), gerar payloads EIP-712 assinados pelo backend para atestar (mint) a recompensa via contrato inteligente.

---

## 🔒 Pontos Cegos & Edge Cases (Segurança, Resiliência & Performance)

Tarefas contínuas para mitigar riscos técnicos e aumentar a resiliência arquitetural.

- [ ] **Resiliência de IA (Degradação Graciosa):** Garantir que timeouts, fallbacks da API do Gemini e validações via Zod do output não crashem o app. Se o Gemini falhar, servir modelos base pré-aprovados ou sinalizar clareza de indisponibilidade da engine ao treinador.
- [ ] **Data Race e Overbooking (Checkins):** Validar constraints (`UNIQUE`, `CHECK`) no banco de dados e isolation levels do PostgreSQL para `schedule_slots`, bloqueando alocações simultâneas inválidas no backend (Hono).
- [ ] **Segurança no Export Estático do Next.js:** Auditoria constante nas chaves públicas (`NEXT_PUBLIC_*`). Assegurar que os artefatos em `client/out` não exponham segredos inadvertidos em bundlers, em alinhamento com a limitação de variáveis de ambiente do GitHub Actions.
- [ ] **Manejo Abusivo de XP (Farming):** Validação rígida e testada via `bun:test` sobre a mecânica de cooldown de recompensas em `lib/gamification.ts`, impossibilitando exploração rápida de checkins fake por endpoints maliciosos.
- [ ] **Monitoramento de Gas Fees (Web3):** Criação de um dashboard ou alertas (e.g. Discord webhook) para monitorar o consumo do Paymaster do Privy para evitar drenagem de fundos no patrocínio das taxas de rede do `XpAttestation`.
- [ ] **Falhas de Webhooks de Wearables:** Implementar filas de retry (ex: Dead Letter Queue ou tabela de controle no Drizzle) para payloads não processados de integrações externas de forma a garantir consistência caso o parse dos dados originais falhe.
