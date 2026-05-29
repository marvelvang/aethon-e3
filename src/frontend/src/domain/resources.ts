import type { components } from '../api/generated'

type UiState = components['schemas']['UiState']

export type ResourceKey     = 'consumerGoods' | 'industry' | 'energy'
export type ResourceGainKey = 'consumerGoodsGain' | 'industryGain' | 'energyGain'

export interface ResourceDef {
  key:        ResourceKey
  gainKey:    ResourceGainKey
  label:      string
  shortLabel: string
  color:      string
}

export const RESOURCES: ResourceDef[] = [
  { key: 'consumerGoods', gainKey: 'consumerGoodsGain', label: 'Konsumgüter', shortLabel: 'KGüt', color: 'var(--color-consumer)' },
  { key: 'industry',      gainKey: 'industryGain',      label: 'Industrie', shortLabel: 'Ind',   color: 'var(--color-industry)' },
  { key: 'energy',        gainKey: 'energyGain',        label: 'Energie',   shortLabel: 'Ene',   color: 'var(--color-energy)'   },
]

export const RESOURCES_BY_KEY: Record<ResourceKey, ResourceDef> = Object.fromEntries(
  RESOURCES.map(r => [r.key, r])
) as Record<ResourceKey, ResourceDef>

export const POPULATION_DEF = {
  label:      'Population',
  shortLabel: 'Pop',
  color:      'var(--color-population)',
} as const

export const HOUSING_DEF = {
  label: 'Wohnraum',
  color: 'var(--color-housing)',
} as const

export type ResourceValue = UiState[ResourceKey]
export type ResourceGain  = UiState[ResourceGainKey]
