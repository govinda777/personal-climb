import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import professorApp from '../src/api/professor'
import athleteApp from '../src/api/athlete'

export const config = {
  runtime: 'nodejs'
}

const app = new Hono().basePath('/api')

app.route('/professor', professorApp)
app.route('/athlete', athleteApp)

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Personal Climb API on Vercel!',
  })
})

export default handle(app)
