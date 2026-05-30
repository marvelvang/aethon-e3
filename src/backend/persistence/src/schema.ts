import { pgTable, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core'
import type { GameState } from '@aethon/models'

export const games = pgTable('games', {
  id:        uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  state:     jsonb('state').$type<GameState>().notNull(),
})
