# Estratégia de Armazenamento Híbrida

Este documento detalha a arquitetura de dados do **Personal Climb**, utilizando uma abordagem híbrida entre um banco de dados SQL (PostgreSQL) e o Sanity CMS.

## 1. Visão Geral

A estratégia separa responsabilidades para garantir escalabilidade, segurança de dados sensíveis e flexibilidade de interface (White Label).

| Tipo de Dado | Armazenamento | Motivo |
| --- | --- | --- |
| **Identidade do Aluno** | SQL (PostgreSQL) | Segurança, LGPD e integridade referencial. |
| **Dados de Saúde/Anamnese** | SQL (PostgreSQL) | Sigilo profissional e confidencialidade. |
| **Vídeos e Exercícios** | Sanity CMS | Facilidade de upload, CDN global e organização por tags. |
| **Configuração de Layout** | Sanity CMS | Flexibilidade para o Personal mudar cores/textos sem código. |
| **Histórico de Pagamentos** | SQL (PostgreSQL) | Gestão financeira e auditoria. |

---

## 2. SQL: O Cofre de Segurança (Dados Sensíveis)

O banco de dados SQL é utilizado para dados que exigem alta integridade, relacionamentos complexos e conformidade com a LGPD.

- **Tabela `athletes`**: Armazena o perfil básico e o nível técnico.
- **Tabela `anamnesis`**: Armazena restrições médicas, metas e dados antropométricos. Apenas o Personal vinculado tem acesso a estes dados.
- **Lógica de Negócio**: Assinaturas (Stripe), logs de treino e agendamentos.

## 3. Sanity: O Cérebro Criativo (Conteúdo e UI)

O Sanity funciona como um Headless CMS para gerenciar tudo o que é visual e dinâmico.

- **Documento `personalConfig`**: Define a identidade visual (logo, cores) e os textos do Hotsite.
- **Documento `exercise`**: Biblioteca global de exercícios com vídeos demonstrativos e dicas técnicas.
- **White Label**: O frontend consome estes dados via `slug` para renderizar a interface personalizada de cada treinador.

---

## 4. Fluxo de Interação e Relacionamento

A associação entre os mundos SQL e Sanity ocorre principalmente na montagem do treino:

1. **Onboarding**: O atleta acessa o Hotsite (Sanity), faz login (Privy) e preenche a anamnese (SQL).
2. **Prescrição**: O Personal escolhe exercícios da biblioteca (Sanity). O sistema salva a referência (ID do Sanity) na tabela `workout_exercises` do SQL, junto com as métricas de execução (séries, repetições, carga).
3. **Evolução**: O atleta registra o treino (SQL), e a IA analisa os logs para sugerir ajustes no próximo ciclo.
