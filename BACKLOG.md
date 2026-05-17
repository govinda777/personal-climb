# Backlog - Personal Climb

Este documento centraliza o mapeamento dos Casos de Uso (UCs) da plataforma Personal Climb, organizados por épicos e com o detalhamento necessário para a execução técnica.

A visão atual de produto foca em estabilizar o motor de onboarding dinâmico e o core hotsite white-label da aplicação, visando suportar a expansão das mecânicas avançadas e a retroalimentação de IA baseada no modelo LLM escolhido (Gemini).

---

## 🏗️ Épico 1: Core Engine & Onboarding Base (Concluídos / Em Curso)

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
- [x] **UC05: Hotsite White-label Dinâmico**
  - Carregamento customizado de cores, nome e treinos baseado na rota.
  - *Técnico:* Roteamento dinâmico `/personal/[slug]` em Next.js com geração estática (`generateStaticParams`). Informações dinâmicas mescladas do banco de dados (SQL) e Sanity CMS.

---

## 🖥️ Épico 2: Dashboard do Personal & Configurações

Tarefas focadas na experiência, parametrização e gestão do treinador.

- [x] **UC06: Configuração de Marca e Perfil (CMS/DB Integration)**
  - **Descrição:** Interface no dashboard do treinador para definir/editar nome, cores primárias/secundárias, biografia e pacotes de treinamento.
  - **Critérios de Aceite:** Alterações salvas com sucesso em banco de dados e refletidas imediatamente no hotsite com integração dual de Sanity CMS e Drizzle (SQL).
- [x] **UC08: Gestão de Agenda e Horários**
  - **Descrição:** Criação e gerenciamento de `schedule_slots` de horário para treinos presenciais e online, incluindo a definição de capacidade máxima de vagas por horário.
  - **Critérios de Aceite:** Validação eficiente para evitar overbooking, delegando para constraints e isolamento padrão do PostgreSQL (sem necessidade imediata de filas assíncronas custosas, dado o volume inicialmente projetado).
- [x] **UC09: CRM e Dashboard de Atletas**
  - **Descrição:** Painel analítico onde o treinador visualiza uma lista geral de seus alunos ativos (`athletes.isActive = true`), os respectivos níveis técnicos, status de pagamentos, taxas de adesão aos treinos e métricas de evolução.
- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - **Descrição:** O treinador poderá pré-cadastrar exercícios e blocos de treino no Sanity CMS. Esta base servirá como biblioteca e insumo estrito para as decisões do Agente de IA na montagem das sessões.
  - **Critérios de Aceite:** Criação e integração dos schemas (e.g., `exercise.ts`, `trainingBlock.ts`) no Sanity Studio, com consultas otimizadas via GROQ disponibilizadas para o backend (Hono).

---

## 🤖 Épico 3: Agente de Inteligência Artificial (Gemini) & Prescrição

Desenvolvimento da inteligência de geração e controle do treinamento físico, evoluída para o paradigma de Agentes autônomos.

- [x] **UC07: Definição do Protocolo de Treino (Setup da IA)**
  - **Descrição:** Tela para configuração do "prompt customizado" do treinador. Envolve definir as métricas preferidas para avaliação, regras de ouro do treinador e limitações padrões de equipamento.
  - **Critérios de Aceite:** O payload de configuração deve ser versionado no banco. Estruturar inputs flexíveis que alimentem o prompt de sistema do Google Gemini de forma determinística.
- [x] **UC10: Revisão e Aprovação de Treinos (Human-in-the-loop IA)**
  - **Descrição:** O Agente atuará de forma ativa: ele vai ler o contexto (dados e anamnese do atleta + conversa/protocolo com o treinador), cruzar com a base de exercícios (Sanity), gerar o treino dinamicamente, *pré-cadastrá-lo* no CMS/DB, e solicitar a aprovação. O treinador recebe sugestões estruturadas e pode aprovar ou editar manualmente.
  - **Critérios de Aceite:** Implementar tool calling no LLM (Gemini) para interagir com o Sanity/Drizzle. Se a API do Gemini falhar (timeout ou erro de output), exibir feedback visual claro ao usuário e recuar para a geração de "treino template estático", impedindo o bloqueio da esteira do treinador.

---

## 🧗 Épico 4: Jornada do Atleta & UX

Experiência do usuário final no aplicativo e check-in físico.

- [x] **UC11: Onboarding Clínico (Anamnese e Avaliação Física)**
  - **Descrição:** Primeiro passo pós-contratação. Fluxo para o atleta preencher o formulário de anamnese, detalhando histórico de lesões, características físicas e seu nível base atual.
  - **Critérios de Aceite:** Inserção em massa controlada (`anamnesis`, `physical_stats`) e flags para lesões ativadas no input da IA.
- [x] **UC12: Agendamento e Check-in de Treinos**
  - **Descrição:** Visualização em calendário da disponibilidade do Personal e marcação do check-in pelo aluno.
  - **Critérios de Aceite:** Validação de UUID de agendamento usando Zod via middleware do Hono no backend e prevenção em real-time contra reservas duplicadas.
- [x] **UC13: Execução do Treino e Feedback Subjetivo (Log de RPE)**
  - **Descrição:** Visualização diária do treino e entrada obrigatória da Percepção Subjetiva de Esforço (RPE) no fim da sessão para o `workout_log`.

---

## ⛓️ Épico 5: Web3, Gamificação & Econômia

- [x] **UC14: Gamificação e Progressão de Nível**
  - **Descrição:** Concluir treinos gera XP, gerido via sistema de rate limit de cooldowns.
  - **Critérios de Aceite:** A infraestrutura de meta-transaction/patrocínio do Privy garantirá as gas fees. O atleta não necessita fundos nativos para assinar e resgatar tokens via EIP-712 com o smart contract `XpAttestation`.

---

## 🚨 Pontos Cegos & Edge Cases (Segurança, Resiliência & Monitoramento)

Tarefas contínuas para mitigar riscos técnicos e aumentar a resiliência arquitetural.

- [ ] **Resiliência de IA (Degradação Graciosa):** Garantir que timeouts, fallbacks da API do Gemini e validações via Zod do output não crashem o app. Se o Gemini falhar, servir modelos base pré-aprovados ou sinalizar clareza de indisponibilidade da engine ao treinador.
- [ ] **Data Race e Overbooking (Checkins):** Validar constraints (`UNIQUE`, `CHECK`) no banco de dados e isolation levels do PostgreSQL para `schedule_slots`, bloqueando alocações simultâneas inválidas no backend (Hono).
- [ ] **Segurança no Export Estático do Next.js:** Auditoria constante nas chaves públicas (`NEXT_PUBLIC_*`). Assegurar que os artefatos em `client/out` não exponham segredos inadvertidos em bundlers, em alinhamento com a limitação de variáveis de ambiente do GitHub Actions.
- [ ] **Manejo Abusivo de XP (Farming):** Validação rígida e testada via `bun:test` sobre a mecânica de cooldown de recompensas em `lib/gamification.ts`, impossibilitando exploração rápida de checkins fake por endpoints maliciosos.
- [ ] **Monitoramento de Gas Fees (Web3):** Criação de um dashboard ou alertas (e.g. Discord webhook) para monitorar o consumo do Paymaster do Privy para evitar drenagem de fundos no patrocínio das taxas de rede do `XpAttestation`.
