import { createDatabase } from '@aethon/persistence'
import { createApp, type AppType } from './app.ts'

export { createApp }
export type { AppType }

if (import.meta.main) {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }
  const db = createDatabase(url)
  const app = createApp({ db })
  const port = Number(process.env.PORT ?? 3000)
  Bun.serve({ port, fetch: app.fetch })
  console.log(`aethon-e3 backend listening on :${port}`)
}
