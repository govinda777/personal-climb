import { Hono } from 'hono'
import { logger } from 'hono/logger'
import crypto from 'node:crypto'
import { privyAuth } from './middleware/auth'
import { GamificationService } from './services/gamification'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './db/schema'
import { GAMIFICATION_CONFIG } from './lib/gamification'
import { createWalletClient, http, hashTypedData } from 'viem'
import { privateKeyToAddress, privateKeyToAccount } from 'viem/accounts'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
const db = drizzle(pool, { schema })
const gamificationService = new GamificationService(db)

type Variables = {
  user: { id: string }
}

const app = new Hono<{ Variables: Variables }>()

app.use('*', logger())

app.get('/', (c) => {
  return c.json({
    message: 'Climbing Evolution API',
    status: 'online'
  })
})

// Protected routes
app.use('/me/*', privyAuth())
app.use('/actions/*', privyAuth())

app.get('/me', async (c) => {
  const user = c.get('user')
  const profile = await gamificationService.handleDailyLogin(user.id)
  return c.json(profile)
})

app.post('/actions/onboarding', async (c) => {
  const user = c.get('user')
  const reward = GAMIFICATION_CONFIG.REWARDS.ONBOARDING
  try {
    const profile = await gamificationService.addXP(user.id, reward.XP, reward.REASON, reward.COOLDOWN_HOURS)
    return c.json(profile)
  } catch (error: any) {
    return c.json({ error: error.message }, 429)
  }
})

app.post('/actions/workout-complete', async (c) => {
  const user = c.get('user')
  const reward = GAMIFICATION_CONFIG.REWARDS.WORKOUT_COMPLETE
  try {
    const profile = await gamificationService.addXP(user.id, reward.XP, reward.REASON, reward.COOLDOWN_HOURS)
    return c.json(profile)
  } catch (error: any) {
    return c.json({ error: error.message }, 429)
  }
})

// EIP-712 XP Verification Endpoint
app.get('/verify-xp/:address', async (c) => {
  const user = c.get('user')
  const targetAddress = c.req.param('address') // Endereço da Smart Wallet

  // Para garantir segurança, targetAddress idealmente estaria associado ao Privy DID no banco
  // Como simplificação da POC, vamos gerar o payload atrelado ao targetAddress passado

  const profile = await gamificationService.getOrCreateProfile(user.id)

  // Utiliza a chave privada de teste (Hardhat account 1) se não estiver em produção
  const privateKeyRaw = process.env.SIGNER_PRIVATE_KEY || '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

  if (process.env.NODE_ENV === 'production' && !process.env.SIGNER_PRIVATE_KEY) {
    return c.json({ error: 'Server misconfiguration: Missing SIGNER_PRIVATE_KEY in production' }, 500)
  }

  if (!privateKeyRaw.startsWith('0x')) {
     return c.json({ error: 'Server misconfiguration: Invalid private key format' }, 500)
  }

  const privateKey = privateKeyRaw as `0x${string}`
  const account = privateKeyToAccount(privateKey)

  // Gerar um nonce único para evitar replay attacks
  const nonce = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const formattedNonce = `0x${nonce.substring(0, 64)}` as `0x${string}`

  try {
    const signature = await account.signTypedData({
      domain: GAMIFICATION_CONFIG.EIP712_DOMAIN,
      types: GAMIFICATION_CONFIG.EIP712_TYPES,
      primaryType: 'AttestPayload',
      message: {
        user: targetAddress as `0x${string}`,
        totalXp: BigInt(profile.xp),
        nonce: formattedNonce,
      },
    })

    return c.json({
      payload: {
        user: targetAddress,
        totalXp: profile.xp,
        nonce: formattedNonce,
      },
      signature,
      signerAuthority: account.address
    })
  } catch (error: any) {
    console.error("Sign error:", error)
    return c.json({ error: 'Failed to generate signature' }, 500)
  }
})

import { serve } from '@hono/node-server'

export default app

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
