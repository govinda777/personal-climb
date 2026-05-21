# 📋 Produto: Personal Climb - Backlog & Mapa de Execução

**Contexto:** Plataforma de gestão para Personal Trainers. Conta com motor de hotsites white-label dinâmicos, prescrição de treinos assistida por IA (Copilot via Gemini), assinaturas gerenciadas pelo Stripe e gamificação (Web3 hybrid off-chain).
**Stack Principal:** Next.js 15, React 19, Tailwind v4, Bun, Hono (Edge), Drizzle ORM/PostgreSQL, Sanity CMS, Privy (Auth + Web3 Wallet), Hardhat.
**Objetivo do MVP / Próxima Release:** Estabilizar fluxos operacionais críticos (agenda e check-in), lançar o Agente IA (Copilot do Treinador com base no Sanity e sugestões dinâmicas) e consolidar o motor de gamificação de XP off-chain com endpoints de validação para terceiros.

---

## 🏗️ Épico 1: Infraestrutura & Core Engine
*Fluxos fundacionais de negócio e identidade já estabelecidos ou em estabilização.*

- [x] **UC01: Seleção de Perfil (Onboarding)**
  - *Técnico:* Redirecionamento dinâmico inteligente (Aluno vs Personal). Estado efêmero persistido via `sessionStorage` (`hasSeenUserTypeModal`).
- [x] **UC02: Autenticação Universal & Web3 (Privy)**
  - *Técnico:* Auth passwordless (OTP/Magic Link) provendo Embedded Wallet invisível (flag `createOnLogin`). Entidade primária mapeada via Privy DID em Postgres (`text`).
- [x] **UC03: Assinatura e Pagamentos (Stripe Checkout)**
  - *Técnico:* Fluxo de checkout integrado no hotsite do treinador.
- [x] **UC04: Gestão de Assinaturas (Billing Tracker)**
  - *Técnico:* Usage-based billing sincronizado em background via Stripe Webhooks. Status reflete nas tabelas `personals` e `athletes` (controle de acesso).

## 🖥️ Épico 2: Frontend, UX & Hotsite White-label
*Gestão e parametrização das áreas do Treinador (Dashboard) e do Aluno (Hotsite).*

- [x] **UC05: Hotsite White-label Dinâmico (Core Engine)**
  - *Técnico:* Roteamento dinâmico `/personal/[slug]` em Next.js (SSG via `generateStaticParams`). Mesclagem de configurações (Drizzle ORM + Sanity CMS).
- [ ] **UC06: Setup de Marca e Perfil (CMS/DB Integration)**
  - **Critério de Aceite:** Interface no Dashboard do Personal para atualizar cores, bio e pacotes. Os dados devem atualizar simultaneamente no Postgres e Sanity, com reflexo no Hotsite (revalidação de cache ou client-side fetching).
- [ ] **UC08: Motor de Agenda e Capacidade (Schedule Slots)**
  - **Critério de Aceite:** CRUD de `schedule_slots` para horários presenciais/online com vagas limitadas. *Gap Técnico:* Garantir bloqueios contra overbooking delegando para as constraints transacionais e isolation level `serializable` do Postgres, sem necessidade de filas.
- [ ] **UC09: CRM do Treinador (Gestão de Atletas)**
  - **Critério de Aceite:** Tabela analítica consolidando alunos ativos (`isActive = true`), status de pagamento Stripe e sumário de progresso (XP/Nível).
- [x] **UC11: Onboarding Clínico do Atleta (Anamnese)**
  - **Critério de Aceite:** Formulário pós-checkout. Os dados devem ser armazenados de forma estruturada (tabela `anamnesis` e `physical_stats`) e os identificadores de lesão/limitações precisam ser expostos como contexto base para o Agente de IA.
- [x] **UC12: Agendamento e Check-in de Treinos**
  - **Critério de Aceite:** Fluxo crítico. A API `/checkin` (Edge via Hono) deve aplicar validação rigorosa de UUIDs (Zod) e prevenir _data races_ na marcação concorrente de slots de horário.
- [ ] **UC13: Feedback Subjetivo Pós-Treino (Log RPE)**
  - **Critério de Aceite:** Input diário obrigatório de Percepção Subjetiva de Esforço no `workout_log`. Essa tabela será um vetor de retroalimentação para as futuras iterações da IA.

## 🤖 Épico 3: IA Copilot & Base de Conhecimento
*O núcleo inteligente: O treinador atua como piloto de alto nível, enquanto a IA faz o trabalho pesado de montagem tática baseada em parâmetros clínicos e acervo.*

- [ ] **UC15: Base de Conhecimento do Treinador (Sanity CMS)**
  - **Critério de Aceite:** Cadastros estruturados (schemas `exercise.ts`, etc.) de exercícios e heurísticas próprias do treinador no Sanity, servindo de biblioteca restrita.
- [ ] **UC07: Definição do Protocolo Base de IA**
  - **Critério de Aceite:** Interface onde o treinador define regras de ouro, métricas e limitações de maquinário. Esse payload (armazenado via Drizzle) constrói o *System Prompt* determinístico do LLM.
- [ ] **UC10: Geração de Treino Assistida (Copilot Human-in-the-Loop)**
  - **Critério de Aceite:** A partir de um pedido descritivo (prompt) do treinador sobre o treino desejado, o Agente de IA (Gemini) analisa a anamnese do atleta (UC11) + regras (UC07) + acervo (UC15).
  - *Regra de Negócio:* O Agente deve priorizar exercícios já cadastrados no Sanity do treinador, mas tem **autonomia para sugerir novos exercícios** para cumprir o objetivo do prompt.
  - *Fluxo:* O treino é gerado, o treinador revisa (treino a treino), faz correções e aprova, momento em que o treino é persistido definitivamente no banco e disponibilizado para o atleta.

## 🎮 Épico 4: Gamificação & Progressão (Web3-Hybrid)
*Engajamento via XP. A arquitetura foi simplificada para priorizar performance off-chain primeiro, sem dependência rígida de contratos na blockchain para toda transação.*

- [ ] **UC14: Motor de XP Off-Chain**
  - **Critério de Aceite:** Conclusões de treinos geram pontos de XP. Os saldos e eventos de gamificação (níveis) serão persistidos e gerenciados exclusivamente no banco de dados relacional (Drizzle/Postgres). A mecânica deve implementar *rate limits* rigorosos (cooldowns de checkin) para prevenir abusos (farming).
- [ ] **UC17: Endpoints de Verificação de Autenticidade (Third-Party Check)**
  - **Critério de Aceite:** Em vez de emitir prêmios on-chain nativamente para cada marca, implementaremos APIs de leitura (e geração de provas usando EIP-712) para que órgãos/sistemas/carteiras externas consigam validar e atestar a veracidade do XP e dos streaks de um atleta fora da plataforma.

*(Nota: UC18 - Wearables foi despriorizado e retirado do escopo desta release para garantir foco na estabilização do Copilot IA).*

## 📈 Épico 5: Monitoramento & Analytics Financeiro
*Tudo que for de billing pesado é terceirizado.*

- [ ] **UC16: Relatórios e Faturamento via Stripe Dashboard**
  - **Critério de Aceite:** Integração de sessão segura com o portal nativo da Stripe (`stripe.billingPortal.sessions.create`). O app atua apenas como pass-through, delegando a UI visual de faturamento, MRR e churn estritamente à Stripe.
=======
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
>>>>>>> fa3d97f (chore: save work before rebase)

---

## 🔒 Pontos Cegos & Edge Cases (Resiliência & Segurança)
*Tarefas contínuas de engenharia para mitigar riscos técnicos e fortalecer a arquitetura.*

<<<<<<< HEAD
- [ ] **Tratamento de Falhas e Degradação Graciosa da IA:** A API do Gemini pode sofrer timeout ou rate limits (API indisponível). *Ação:* Se o Agente falhar, a UI de aprovação de treinos não pode gerar erro fatal. É preciso garantir fallback visual, alertas descritivos ao treinador e validação estrita via esquema (Zod) das respostas (outputs em JSON) do LLM (Tool Calling).
- [ ] **Race Conditions (Overbooking) no Agendamento:** *Ação:* Impedir que concorrência (ex: double-clicks na UI, ou requests massivos) burlem o limite de vagas nos `schedule_slots`. Usar constraints robustas (ex: chaves compostas e `CHECK`), transações atômicas no Drizzle e nível de isolamento adequado.
- [ ] **Prevenção contra XP Farming e Abusos:** *Ação:* Isolar a lógica de gamificação em `lib/gamification.ts` e realizar validações extensivas através de testes unitários (`bun:test`). A regra de cooldown de prêmios/pontos deve rodar no backend com acesso ao banco e timestamp de servidor para impedir explorações via client-side scripts.
- [ ] **Segurança de Segredos e Bundle no Next.js (SSG):** *Ação:* Como a aplicação faz export estático (`output: 'export'`), as variáveis de ambiente sensíveis (ex: chaves do Stripe e chaves privadas do Hono) nunca devem começar com `NEXT_PUBLIC_` se não puderem ser publicamente expostas ao browser. Revisar os arquivos de Environment variables do GitHub Actions e o payload do Webpack.
- [ ] **Idempotência e Falhas Silenciosas no Webhook da Stripe:** *Ação:* As Edge Functions que escutam eventos do Stripe (`customer.subscription.updated`) devem tratar os payloads de maneira idempotente. Eventos duplicados não podem cobrar/bloquear em duplicidade e falhas precisam ser enviadas para ferramentas de log (Sentry/Vercel) para garantir que ninguém perca o acesso injustamente.
=======
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
>>>>>>> fa3d97f (chore: save work before rebase)
