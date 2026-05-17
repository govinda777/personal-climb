# Backlog - Personal Climb

Este documento centraliza o mapeamento dos Casos de Uso (UCs) e épicos técnicos da plataforma Personal Climb.

**Objetivo do MVP / Próxima Release:** Estabilizar o motor de onboarding dinâmico e o core hotsite white-label da aplicação, executar o fluxo de prescrição de treinos ponta a ponta com a IA (Gemini), suportar mecânicas avançadas de Web3/gamificação e garantir tratamento de erros robusto, especialmente no check-in físico de atletas.

---

## 🏗️ Infra & Core Engine

Mapeamento dos fluxos de fundação, arquitetura e negócios principais.

- [x] **UC01: Seleção de Perfil (Onboarding)**
  - Redirecionamento dinâmico entre Aluno (Hotsite) e Personal (Produto Business). Modal `hasSeenUserTypeModal` no `sessionStorage`.
- [x] **UC02: Autenticação Universal (Privy)**
  - Login passwordless (OTP/Magic Link) gerando Embedded Web3 Wallets via `@privy-io/react-auth`. DIDs do Privy persistidos no Postgres.
- [x] **UC03: Assinatura e Pagamentos (Stripe Checkout)**
  - Contratação de pacotes pelo atleta no Hotsite do treinador.
- [x] **UC04: Gestão de Assinaturas (Billing Tracker)**
  - Usage-based billing para Personals atrelado à flag `athletes.isActive`. Sincronização via Stripe Webhooks.
- [x] **UC05: Hotsite White-label Dinâmico**
  - Next.js estático (`generateStaticParams`) sob a rota `/personal/[slug]`. SSR híbrido usando Drizzle e Sanity CMS.
- [ ] **UC08: Gestão de Agenda e Horários (Core Check-in)**
  - **Descrição:** Motor para criação de `schedule_slots` e controle rigoroso de capacidade.
  - **Critérios de Aceite:** Utilizar constraints de banco (ex: isolamento no Postgres e chaves compostas) para prevenir overbooking em escala sem introduzir filas de mensageria prematuras.
- [ ] **UC16: Relatórios Financeiros Avançados (Novo)**
  - **Descrição:** Extensão do painel do treinador com visualização de LTV de alunos, churn rate projetado e exportação de relatórios.
  - **Critérios de Aceite:** Agregações SQL (via Drizzle) otimizadas com materialized views, caso o volume exija; exibição de gráficos simples no frontend.

---

## 🖥️ Frontend & UX

Tarefas focadas na experiência, parametrização e interfaces voltadas ao treinador e ao aluno.

- [ ] **UC06: Configuração de Marca e Perfil (CMS/DB Integration)**
  - **Descrição:** Interface de setup para o Personal definir brand, cores, bio e pacotes.
  - **Critérios de Aceite:** Integração dual: dados relacionais no banco (Drizzle) e conteúdo dinâmico salvo no Sanity Studio. Form state em `react-hook-form` com validação Zod.
- [ ] **UC09: CRM e Dashboard de Atletas**
  - **Descrição:** Painel analítico de overview de alunos (níveis técnicos, pagamento, adesão a treinos).
  - **Critérios de Aceite:** Consultas performáticas evitando N+1 no banco; virtualização de listas no Next.js caso a base do treinador passe de 100 alunos ativos.
- [ ] **UC11: Onboarding Clínico e Anamnese**
  - **Descrição:** Formulário rico para coletar lesões, nível físico e biomecânica do atleta.
  - **Critérios de Aceite:** Estrutura resiliente de formulários em múltiplos passos (Multi-step form) com persistência em localStorage para evitar perda de estado durante o preenchimento.
- [ ] **UC12: Agendamento e Check-in de Treinos (UX)**
  - **Descrição:** Interface de calendário para reserva e check-in em tempo real.
  - **Critérios de Aceite:** Validação de UUID de slots via Zod e feedback otimista (Optimistic UI) para respostas rápidas de agendamento.
- [ ] **UC13: Execução do Treino e Feedback Subjetivo (Log de RPE)**
  - **Descrição:** Interface para o aluno logar o treino executado no dia e registrar o Rate of Perceived Exertion (RPE).
  - **Critérios de Aceite:** Design mobile-first; offline-ready (persistência local) para caso a rede falhe no meio do ginásio.

---

## 🤖 IA & Prescrição (Integração Gemini)

Inteligência e autonomia na geração e controle de treinos físicos.

- [ ] **UC07: Definição do Protocolo de Treino (Setup da IA)**
  - **Descrição:** Configuração do prompt do treinador (regras de ouro, equipamentos).
  - **Critérios de Aceite:** Versionamento do payload de prompt; estrutura semântica injetada na chamada do Gemini de maneira previsível.
- [ ] **UC10: Revisão e Aprovação de Treinos (Human-in-the-loop)**
  - **Descrição:** IA gera os treinos (cruzando anamnese, Sanity CMS de exercícios e regras), pré-cadastra no banco e aguarda aprovação manual do treinador.
  - **Critérios de Aceite:** Implementação do tool calling. O output da IA deve ser um JSON estritamente validado contra o schema Zod das tabelas de treinos.
- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - **Descrição:** Cadastro de exercícios e blocos formatados no Sanity Studio, servindo de biblioteca restrita para a IA.
  - **Critérios de Aceite:** Queries GROQ expostas ao backend Hono com tempo de resposta em cache agressivo (Edge Cache).

---

## 🎮 Web3 & Integrações Avançadas

Mecânicas de gamificação e consumo de dados de terceiros.

- [ ] **UC14: Gamificação e Progressão de Nível (Core Web3)**
  - **Descrição:** O aluno ganha XP ao concluir treinos físicos, convertidos em badges/níveis Web3 via meta-transactions.
  - **Critérios de Aceite:** Emissão de tokens ERC/EIP-712 com gás pago pelo sistema de patrocínio do Privy (Paymaster).
- [ ] **UC17: Novas Mecânicas de Gamificação Web3 (Novo)**
  - **Descrição:** Sistema de "Streaks" (sequência de check-ins) mintando NFTs de recompensa sazonais.
  - **Critérios de Aceite:** Lógica implementada via contratos Hardhat (Solidity) com `evmVersion: 'cancun'`. Backend emite as assinaturas de autorização.
- [ ] **UC18: Integração com Wearables e Strava (Novo)**
  - **Descrição:** Sincronização de treinos (frequência cardíaca, carga cardiovascular) com Apple Health/Google Fit/Strava para nutrir a IA.
  - **Critérios de Aceite:** Configuração de OAuth/Webhooks ou SDK front-end para leitura primária de dados. Mapeamento de métricas para a tabela `physical_stats`.

---

## 📈 Monitoramento & Analytics

Observabilidade pragmática focada em resolução rápida e acompanhamento de erros.

- [ ] **Configuração do Sentry (ou análogo simples)**
  - **Descrição:** Rastreamento de erros full-stack e performance (Next.js e Hono).
  - **Critérios de Aceite:** Integração nativa, capturando boundary errors no React e unhandled exceptions no Hono.
- [ ] **Logging Centralizado da IA**
  - **Descrição:** Armazenar entradas, saídas (mesmo que com falha) e uso de tokens do Gemini para auditoria e controle de custos.
  - **Critérios de Aceite:** Tabela `ai_logs` ou integração com Vercel Logs, armazenando metadados de requisição para análise de falhas de parse JSON.

---

## 🔒 Segurança, Resiliência & Pontos Cegos (Edge Cases)

Requisitos estritos de mitigação de risco e disponibilidade.

- [ ] **Garantia de SLA e Alta Disponibilidade no Check-in (Crítico):** O fluxo de UC12 (Check-in) não pode cair. Implementar circuit breakers ou fallbacks para acesso direto ao banco (bypassing camadas complexas se necessário) durante horários de pico.
- [ ] **Resiliência da Engine de IA:** Se a API do Gemini der timeout ou devolver um JSON malformado que fure a validação Zod, não crashear. Prover templates de treino estáticos "fallback" para o treinador.
- [ ] **Prevenção de Abuso no Farming de XP (Web3):** Rate-limiting forte e cooldowns checados server-side (Drizzle) e on-chain (contrato) para evitar a inflação do sistema de evolução.
- [ ] **Prevenção contra Vazamento em Next.js Static Export:** Garantir nos jobs de CI/CD (GitHub Actions) que variáveis com chaves sensíveis não fiquem expostas nos artefatos `client/out`, limitando o prefixo `NEXT_PUBLIC_` apenas ao necessário.
- [ ] **Data Race em Agendamento:** Validação com isolamento transacional no Postgres e constraints (UNIQUE) para `slot_id + user_id` a fim de blindar contra duplicações concorrentes.
- [ ] **Alerta de Drenagem de Gás (Paymaster Privy):** Criar um webhook/notificação simples (ex: Discord) que dispare se a taxa de mint/gastos Web3 passar do limite diário estipulado, congelando novas emissões on-chain até averiguação manual.
