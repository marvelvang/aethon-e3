import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import {
  GameRepository,
  GameNotFoundError,
  type Database,
} from '@aethon/persistence'
import {
  genesis,
  placeBuilding,
  simulateRound,
  project,
  BuildError,
} from '@aethon/engine'
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
      const state = await repo.create({
        round:         1,
        population:    100,
        consumerGoods: 0,
        industry:      200,
        energy:        200,
        buildings:     [{ x: 0, y: 0, type: 'Base', isNewlyBuilt: false }],
      })
      return c.json(withVersion(project(state)))
    })

    .get('/api/game/:id', async c => {
      const id = c.req.param('id')
      try {
        const state = await repo.load(id)
        return c.json(withVersion(project(state)))
      } catch (err) {
        if (err instanceof GameNotFoundError) return c.json({ error: err.message }, 400)
        throw err
      }
    })

    .post(
      '/api/game/:id/buildings',
      zValidator('json', PlaceBuildingRequestSchema),
      async c => {
        const id = c.req.param('id')
        const { x, y, type } = c.req.valid('json')
        try {
          const state = await repo.load(id)
          const next = placeBuilding(state, x, y, type)
          await repo.save(next)
          return c.json(withVersion(project(next)))
        } catch (err) {
          if (err instanceof BuildError || err instanceof GameNotFoundError) {
            return c.json({ error: err.message }, 400)
          }
          throw err
        }
      },
    )

    .post('/api/game/:id/round', async c => {
      const id = c.req.param('id')
      try {
        const state = await repo.load(id)
        const next = simulateRound(state)
        await repo.save(next)
        return c.json(withVersion(project(next)))
      } catch (err) {
        if (err instanceof GameNotFoundError) return c.json({ error: err.message }, 400)
        throw err
      }
    })

    .delete('/api/game/:id', async c => {
      const id = c.req.param('id')
      await repo.delete(id)
      return c.body(null, 204)
    })

  // Genesis helper – matches the engine's initial state. Kept inline above
  // because the repo expects an Omit<GameState,'id'> insert; using
  // `genesis()` would generate an extra UUID the DB then ignores.
  void genesis
  return app
}

export type AppType = ReturnType<typeof createApp>
