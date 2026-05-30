import { z } from 'zod'
import { BUILDING_TYPES } from '@aethon/models'

/**
 * Wire-schemas for HTTP request validation. The response wire-format is
 * `UiState` from @aethon/models verbatim — there's no separate response
 * schema because the server returns the model shape without transformation.
 */

export const PlaceBuildingRequestSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  type: z.enum(BUILDING_TYPES),
})
export type PlaceBuildingRequest = z.infer<typeof PlaceBuildingRequestSchema>
