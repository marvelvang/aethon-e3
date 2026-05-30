import { eq } from 'drizzle-orm'
import type { GameState } from '@aethon/models'
import type { Database } from './db.ts'
import { games } from './schema.ts'

export class GameNotFoundError extends Error {
  constructor(id: string) { super(`Game ${id} not found.`) }
}

export class GameRepository {
  constructor(private db: Database) {}

  async create(state: Omit<GameState, 'id'>): Promise<GameState> {
    const [row] = await this.db
      .insert(games)
      .values({ state: state as GameState })
      .returning({ id: games.id, state: games.state })
    return { ...row.state, id: row.id }
  }

  async load(id: string): Promise<GameState> {
    const rows = await this.db.select().from(games).where(eq(games.id, id)).limit(1)
    if (rows.length === 0) throw new GameNotFoundError(id)
    return { ...rows[0].state, id: rows[0].id }
  }

  async save(state: GameState): Promise<void> {
    const { id, ...rest } = state
    const result = await this.db
      .update(games)
      .set({ state: { ...rest, id } as GameState, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning({ id: games.id })
    if (result.length === 0) throw new GameNotFoundError(id)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(games).where(eq(games.id, id))
  }
}
