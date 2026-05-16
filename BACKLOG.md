# Backlog - Personal Climb

Este documento centraliza o mapeamento dos Casos de Uso (UCs) da plataforma Personal Climb, divididos entre o que já está implementado ou em curso, e o que falta para completar a visão do produto.

---

## ✅ Casos de Uso Concluídos / Em Curso

Estes são os fluxos principais que já estão sendo atacados e formam a base da arquitetura do projeto.

*   **UC01: Seleção de Perfil (Onboarding)**
    *   Redirecionamento inteligente na landing page entre Aluno (Hotsite White-label) e Personal (Produto Business).
    *   *Técnico:* Modal exibido na página inicial e estado salvo em `sessionStorage` (`hasSeenUserTypeModal`).
*   **UC02: Autenticação Universal (Privy)**
    *   Login unificado via redes sociais, email ou carteiras Web3 (Social/Wallet).
    *   *Técnico:* Integração `@privy-io/react-auth` no front e `@privy-io/server-auth` no back. Identificador principal é o DID do Privy no banco (SQL/Postgres).
*   **UC03: Assinatura e Pagamentos (Stripe Checkout)**
    *   Contratação de pacotes de treinamento pelo atleta no Hotsite do treinador.
*   **UC04: Gestão de Assinaturas (Billing Tracker)**
    *   Cobrança baseada no uso para o Personal (usage-based billing). Controlado ativamente pela flag `athletes.isActive`.
    *   *Técnico:* Acompanhamento em background via Stripe Webhooks e sincronização com a tabela `personals` (`stripeSubscriptionId`, `subscriptionStatus`).
*   **UC05: Hotsite White-label Dinâmico**
    *   Carregamento customizado de cores, nome e treinos baseado na rota.
    *   *Técnico:* Roteamento dinâmico `/personal/[slug]` em Next.js com geração estática (`generateStaticParams`). Informações dinâmicas mescladas do banco de dados (SQL) e Sanity CMS.

---

## ✅ Casos de Uso Concluídos (Fase 2 - Atual)

Abaixo estão os casos de uso recentemente implementados e estruturados pelas principais jornadas.

### 🏋️ Jornada do Personal (Dashboard & Configurações)

*   **UC06: Configuração de Marca e Perfil (CMS/DB Integration)**
    *   **Descrição:** Interface no dashboard do treinador para definir/editar nome, cores primárias/secundárias, biografia e pacotes de treinamento.
    *   **Técnico:** Interação de escrita e sincronização entre os schemas do banco SQL e as configurações dinâmicas de interface geridas pelo Sanity CMS.
*   **UC07: Definição do Protocolo de Treino (Setup da IA)**
    *   **Descrição:** Tela para configuração do "prompt customizado" do treinador. Envolve definir as métricas preferidas para avaliação, regras de ouro do treinador e limitações padrões de equipamento (ex: MoonBoard, Hangboard, Muro Comercial). Estes dados alimentarão a IA prescritiva.
*   **UC08: Gestão de Agenda e Horários**
    *   **Descrição:** Criação e gerenciamento de `schedule_slots` de horário para treinos presenciais e online, incluindo a definição de capacidade máxima de vagas por horário.
*   **UC09: CRM e Dashboard de Atletas**
    *   **Descrição:** Painel analítico onde o treinador visualiza uma lista geral de seus alunos ativos (`athletes.isActive = true`), os respectivos níveis técnicos, status de pagamentos, taxas de adesão aos treinos e métricas de evolução.
*   **UC10: Revisão e Aprovação de Treinos (Human-in-the-loop IA)**
    *   **Descrição:** Interface para o treinador revisar o racional da IA. O treinador recebe sugestões estruturadas (análise de perfil, objetivo do mesociclo, sessões e intensidades) e pode aprovar (`training_plans.status = "approved"`) ou editar manualmente as indicações antes que o atleta as visualize.

### 🧗 Jornada do Atleta (App do Aluno)

*   **UC11: Onboarding Clínico (Anamnese e Avaliação Física)**
    *   **Descrição:** Primeiro passo pós-contratação. Fluxo para o atleta preencher o formulário de anamnese, detalhando histórico de lesões, características físicas (ex: envergadura, peso) e seu nível base atual na escalada (ex: V-Grade).
    *   **Técnico:** Populamento das tabelas `anamnesis` e atualização dos `physical_stats` do atleta no banco de dados, enviando alertas de segurança para a IA em caso de lesões prévias.
*   **UC12: Agendamento e Check-in de Treinos**
    *   **Descrição:** Visualização em calendário da disponibilidade do Personal (baseado no UC08) e marcação do check-in pelo aluno.
    *   **Técnico:** Validação rígida com UUID no backend para garantir que as vagas do `schedule_slots` não sejam excedidas. Estados possíveis: `scheduled | completed | missed`.
*   **UC13: Execução do Treino e Feedback Subjetivo (Log de RPE)**
    *   **Descrição:** Interface principal de uso diário. O atleta visualiza o plano da semana aprovado pelo treinador, marca as atividades e exercícios como concluídos (`workout_log`), e obrigatoriamente preenche a Percepção Subjetiva de Esforço (RPE) no fim da sessão. O histórico de RPE retroalimenta a IA.
*   **UC14: Gamificação e Progressão de Nível (Ecosistema Web3)**
    *   **Descrição:** Evolução contínua do perfil do atleta via gamificação. Concluir treinos e avaliações gera XP, permitindo subir de nível e ver melhorias visuais nas "skills" no melhor estilo RPG.
    *   **Técnico:** Lógica estrita de limites e cooldowns para evitar abusos (XP farming) gerenciada nos arquivos `lib/gamification.ts`. Verificação e resgate on-chain das recompensas via assinaturas `EIP-712`, com o backend provendo payloads assinados (`viem`) validados pelo contrato `XpAttestation`.
