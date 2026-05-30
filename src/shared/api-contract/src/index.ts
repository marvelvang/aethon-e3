import { z } from 'zod'
import { BUILDING_TYPES } from '@aethon/models'
import type { UiState } from '@aethon/models'

// Server-side request validation only. Response types live in @aethon/models
// (UiState) — there's no wire transformation, the server returns the model
// shape verbatim.

export const PlaceBuildingRequestSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  type: z.enum(BUILDING_TYPES),
})
export type PlaceBuildingRequest = z.infer<typeof PlaceBuildingRequestSchema>

export const GameIdParamSchema = z.object({
  id: z.string().min(1),
})

export type ApiErrorBody = { error: string }
export type ApiUiResponse = UiState
