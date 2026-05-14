# Estratégia de Testes E2E (Web3 & Gamificação)

Este documento descreve os padrões, mocks e cenários de testes automatizados E2E utilizando **Playwright** para garantir a qualidade, resiliência e segurança do fluxo de Gamificação e Smart Wallets da plataforma.

## 1. Abordagem de Teste (Mocks de Autenticação)

Testar fluxos Web3 em pipelines de CI/CD apresenta o desafio de interagir com carteiras externas (como Metamask ou Privy) sem intervenção humana. A nossa abordagem resolve isso através de **Bypass de Sessão e Interceptação de API**.

### 1.1 Mocking do Privy no Frontend (Playwright `page.route`)
Em vez de automatizar cliques na interface do Privy, nós injetamos um Token JWT simulado (`mock-token`) e interceptamos as chamadas de rede no Playwright.
- **Configuração:** `await page.route('**/api/*', ...)` é utilizado para simular a resposta do backend (Hono).
- **Vantagem:** Evitamos dependência de serviços externos, melhoramos a velocidade do teste e garantimos total estabilidade (flakiness reduction).

### 1.2 Testando a API Real em CI
Para os testes de backend (onde não mockamos), utilizamos testes de unidade via `bun test` no diretório `server/src/services/` (ex: `gamification.test.ts`). O Playwright é mantido exclusivamente para as asserções de frontend (UI/Rede).

---

## 2. Casos de Uso (Test Cases) Implementados

A suíte principal encontra-se em `client/tests/e2e/gamification.spec.ts`.

### Caso 1: Sucesso no Gatilho de Gamificação (Missão Completada)
- **Objetivo:** Validar que uma ação "in-game" (ex: preencher a anamnese/onboarding) concede XP.
- **Fluxo:** O mock dispara a chamada para `/actions/onboarding` e o teste verifica se o sistema retorna o `HTTP 200` e a quantidade correta de XP esperada (`100 XP`).
- **Validação de Atomicidade:** Apenas se o payload de sucesso for recebido, a "interface" ou "carteira" atualiza o XP.

### Caso 2: Resiliência e Proteção Anti-Farm (Rate Limiting)
- **Objetivo:** Garantir que um usuário/bot não consiga chamar repetidamente o mesmo endpoint de recompensa.
- **Fluxo:** O teste realiza uma **segunda chamada consecutiva** para o mesmo endpoint (`/actions/onboarding`), simulando a mesma ação sendo feita antes do tempo de *cooldown* de 8760 horas (1 ano) para onboarding.
- **Validação:** A API retorna `HTTP 429 Too Many Requests` com a mensagem correta ("Rate limit exceeded"), impedindo o farm de pontos.

### Caso 3: Verificação Criptográfica (EIP-712 Proof of Score)
- **Objetivo:** Validar o endpoint seguro que será usado por plataformas parceiras e smart contracts (EAS).
- **Fluxo:** O teste chama `/verify-xp/:address`.
- **Validação:** O teste checa se a estrutura retornada possui os requisitos obrigatórios para processamento on-chain:
  - `payload.user`: O endereço da carteira alvo.
  - `payload.totalXp`: A quantidade correta do XP.
  - `payload.nonce`: Valor pseudo-aleatório para evitar ataques de repetição (Replay Attacks).
  - `signature`: Assinatura hexadecimal ECDSA.
  - `signerAuthority`: A conta servidora oficial que originou a prova.

---

## 3. Próximos Casos (Roadmap de Qualidade)
Para expandir nossa cobertura futura, os seguintes casos devem ser implementados:

1. **Testes Visuais (Componentes Web3):**
   - Validar que o saldo de XP e o ícone de Level mudam em tempo real na interface após a requisição do ganho de XP (utilizando React/Framer Motion).
2. **Mocking de Reorg On-chain:**
   - Simular um cenário onde o webhook do The Graph ou a transação de Smart Wallet falhe, disparando uma rota de rollback de XP (ainda a ser desenvolvida no backend).
3. **E2E da API em Ambiente de Staging:**
   - Habilitar requisições para a API hospedada em Staging usando um JWT de teste Privy (mintado via API admin do Privy).
