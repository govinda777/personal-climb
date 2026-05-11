# Plano de Implementação Técnica - Personal Climb

Este documento detalha a estratégia técnica para a implementação dos casos de uso definidos.

## 1. Fluxo de Direcionamento (UC01)

### Frontend (`client/`)
- **Página de Entrada (`/`):** Transformar a Home atual em uma Landing Page de conversão com dois CTAs claros.
- **Lógica de Redirecionamento:**
  - Botão "Sou Aluno": Redireciona para `/personal/default` (ou busca o slug do último personal visitado no `localStorage`).
  - Botão "Sou Personal": Redireciona para `/business`.
- **Nova Rota `/business`:** Landing page focada no Personal Trainer, explicando os benefícios da plataforma.

## 2. Gestão de Profissionais e Autenticação (UC02)

### Tecnologias
- **Privy.io:** Para autenticação Web3 e Social.
- **Hono API:** Para persistência de perfil.

### Tarefas
- Instalar `@privy-io/react-auth`.
- Configurar `PrivyProvider` no `layout.tsx`.
- Criar endpoint `POST /api/users/sync` no backend para salvar/atualizar dados do usuário após login.
- Implementar Hook `useUserSync` para gerenciar o estado de autenticação e sincronização com o banco.

## 3. Assinatura e Controle Financeiro (UC03 & UC04)

### Integração Stripe
- **Modelo de Cobrança:** Usage-based billing (Metereed billing).
- **Stripe Checkout:** Redirecionar o personal para o checkout ao escolher um plano.
- **Webhooks:** Escutar `checkout.session.completed` para ativar a conta e `subscription_schedule.updated` para métricas.

### Lógica de Comissões (Backend)
- Adicionar campo `stripe_customer_id` e `stripe_subscription_id` na tabela `personals`.
- Criar trigger ou service que, ao adicionar um `athlete`, chama a API do Stripe para registrar o incremento de uso (`stripe.subscriptionItems.createUsageRecord`).

## 4. Experiência White Label (UC05)

### Rotas Dinâmicas
- Mover a lógica atual da Home para `client/src/app/personal/[slug]/page.tsx`.
- Usar `generateStaticParams` para pré-renderizar os slugs conhecidos via Sanity/DB.
- **Middleware:** Implementar detecção de subdomínio (opcional futuramente) para mapear `nome.personalclimb.com` para o slug correspondente.

### Data Fetching
- Priorizar Sanity para dados de marca (Logo, Cores, Bio).
- Usar a API Hono para dados dinâmicos (Treinos, Agenda).

---

## Próximos Passos Imediatos

1. Estruturar rotas dinâmicas `/personal/[slug]`.
2. Configurar o Provider do Privy no Frontend.
3. Adicionar colunas de integração Stripe no Schema do Drizzle.
