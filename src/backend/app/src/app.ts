import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { GameRepository, GameNotFoundError, type Database } from '@aethon/persistence'
import { BuildError, genesis, placeBuilding, project, simulateRound } from '@aethon/engine'
import type { UiState } from '@aethon/models'
import { PlaceBuildingRequestSchema } from '@aethon/api-contract'
import { APP_VERSION } from './version.ts'

export interface AppDeps {
  db: Database
}

export function createApp(deps: AppDeps) {
  const repo = new GameRepository(deps.db)

  const withVersion = (ui: UiState): UiState => ({ ...ui, backendVersion: APP_VERSION })

  const app = new Hono()
    .use('*', cors())
    .get('/health', c => c.json({ ok: true, version: APP_VERSION }))

    .post('/api/game', async c => {
      const state = await repo.create(genesis())
      return c.json(withVersion(project(state)))
    })

    .get('/api/game/:id', async c => {
      const state = await repo.load(c.req.param('id'))
      return c.json(withVersion(project(state)))
    })

    .post(
      '/api/game/:id/buildings',
      zValidator('json', PlaceBuildingRequestSchema),
      async c => {
        const { x, y, type } = c.req.valid('json')
        const state = await repo.load(c.req.param('id'))
        const next  = placeBuilding(state, x, y, type)
        await repo.save(next)
        return c.json(withVersion(project(next)))
      },
    )

    .post('/api/game/:id/round', async c => {
      const state = await repo.load(c.req.param('id'))
      const next  = simulateRound(state)
      await repo.save(next)
      return c.json(withVersion(project(next)))
    })

    .delete('/api/game/:id', async c => {
      await repo.delete(c.req.param('id'))
      return c.body(null, 204)
    })

    .onError((err, c) => {
      if (err instanceof BuildError || err instanceof GameNotFoundError) {
        return c.json({ error: err.message }, 400)
      }
      throw err
    })

  return app
}

export type AppType = ReturnType<typeof createApp>
