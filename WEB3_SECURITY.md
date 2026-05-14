# Diretrizes de Segurança Web3 e Integração (Proof of Score)

Este documento detalha o padrão de integração para plataformas terceiras verificarem o progresso on-chain e off-chain dos usuários da plataforma **Personal Climb**. O objetivo é garantir que o sistema de gamificação (XP) e outras métricas valiosas não possam ser manipuladas por atores maliciosos.

## 1. Arquitetura "Proof of Score"

Nossa abordagem utiliza um modelo de segurança híbrido:
- **Off-chain (Backend/Database):** O XP é gerado em nosso banco de dados PostgreSQL e as validações anti-bot (Rate Limiting, Cooldown) ocorrem via API (Hono).
- **On-chain (Smart Wallets/Privy):** Utilizamos os métodos criptográficos (EIP-712) para que qualquer plataforma possa verificar matematicamente a veracidade da pontuação (XP) sem depender da confiança cega na nossa API REST.

### 1.1 Assinatura EIP-712 (Payload)
A API do backend provê um endpoint seguro que retorna a pontuação do usuário atrelada à sua Wallet ou DID, além de assinar este *payload* utilizando uma chave ECDSA autoritativa do nosso servidor.

- **Endpoint:** `GET /api/verify-xp/:address`
- **Autenticação:** Token JWT provido pelo Privy na requisição (`Bearer`).
- **Exemplo de Retorno:**
  ```json
  {
    "payload": {
      "user": "0x1234...abcd",
      "totalXp": 100,
      "nonce": "0x44a3b2..."
    },
    "signature": "0xabc123...",
    "signerAuthority": "0xServerAuthorityAddress"
  }
  ```

### 1.2 Verificação via EAS (Ethereum Attestation Service)
Em um futuro próximo, os payloads assinados poderão ser emitidos diretamente no portal do EAS, tornando as missões completadas legíveis na blockchain por contratos inteligentes de terceiros, de modo 100% descentralizado. O contrato `XpAttestation.sol` criado no diretório `contracts/` já demonstra a lógica principal para aceitar as assinaturas criadas pelo servidor, consumindo o `nonce` (prevenção de Replay-Attack).

---

## 2. Checklist de Auditoria e Boas Práticas

| Ponto de Auditoria | Implementação e Status |
| :--- | :--- |
| **Sync de Estado (Reorgs)** | Implementado. Transações críticas e assinaturas on-chain devem processar os status de falha com verificação no servidor. O XP não é emitido até a finalidade da transação. |
| **Identidade Privy** | Validado através do DID. Nossos tokens JWT emitidos no `PrivyProvider` contêm o UUID de conta validado em tempo real (`privy.verifySession`). |
| **Rate Limiting (Anti-farm)** | Implementado. O `GamificationService` avalia `cooldownHours` (e.g. recompensa de login limitada a 24h) garantindo que automações ou scripts não explorem abusos de missões. |
| **Verificabilidade** | Implementado. O endpoint `/verify-xp` retorna o payload devidamente assinado. |

---

## 3. Próximos Passos de Interoperabilidade

1. **Implementar The Graph (SubGraph):** Após o deploy dos contratos `XpAttestation` em mainnet/L2 (Base/Optimism), plataformas parceiras não precisarão sequer consultar nossa API. Elas farão uma query em um SubGraph que indexa os eventos `XpAttested`.
2. **SDK TypeScript:** Para facilitar a integração, um pacote (ex: `@personal-climb/sdk`) será distribuído contendo as funções wrapper para invocar o `verify-xp` e as tipagens EIP-712 necessárias.
