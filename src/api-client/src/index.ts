import { hc } from 'hono/client'
import type { AppType } from '@aethon/backend/app'

export type ApiClient = ReturnType<typeof hc<AppType>>

export function createClient(baseUrl: string): ApiClient {
  return hc<AppType>(baseUrl)
}
