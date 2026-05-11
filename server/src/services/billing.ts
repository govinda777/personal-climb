import { personals, athletes } from "../db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Lógica de negócio para controle financeiro
 */
export class BillingService {
  /**
   * Incrementa o contador de atletas no Stripe e valida limites
   */
  async addAthleteToPersonal(personalId: string, athleteData: any) {
    // 1. Verificar se o personal tem assinatura ativa
    // 2. Reportar uso ao Stripe (Usage-based billing)
    // 3. Inserir atleta no banco
    console.log(`Adicionando atleta ao personal ${personalId}`);
  }
}
