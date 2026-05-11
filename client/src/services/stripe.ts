/**
 * Serviço para gerenciar faturamento e assinaturas via Stripe
 */
export const stripeService = {
  async createCheckoutSession(personalId: string, planId: string) {
    // TODO: Implementar chamada para o backend que cria a sessão do Stripe
    console.log(`Criando checkout para ${personalId} no plano ${planId}`);
  },

  async reportUsage(subscriptionItemId: string, quantity: number) {
    // TODO: Implementar registro de uso para metered billing
    console.log(`Reportando uso: ${quantity} atletas no item ${subscriptionItemId}`);
  }
};
