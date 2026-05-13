#!/bin/bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/personalclimb"
export PRIVY_APP_ID="your_privy_app_id"
export PRIVY_APP_SECRET="your_privy_app_secret"
export STRIPE_SECRET_KEY="sk_test_mock"
export STRIPE_WEBHOOK_SECRET="whsec_mock"
export FRONTEND_URL="http://localhost:3000"

bun run src/index.ts
