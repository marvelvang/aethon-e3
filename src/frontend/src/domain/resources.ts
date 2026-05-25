import type { components } from '../api/generated'

type UiState = components['schemas']['UiState']

export type ResourceKey     = 'consumerGoods' | 'industry' | 'energy'
export type ResourceGainKey = 'consumerGoodsGain' | 'industryGain' | 'energyGain'

export interface ResourceDef {
  key:     ResourceKey
  gainKey: ResourceGainKey
  label:   string
  color:   string
}

export const RESOURCES: ResourceDef[] = [
  { key: 'consumerGoods', gainKey: 'consumerGoodsGain', label: 'Güter',     color: 'var(--color-consumer)' },
  { key: 'industry',      gainKey: 'industryGain',      label: 'Industrie', color: 'var(--color-industry)' },
  { key: 'energy',        gainKey: 'energyGain',        label: 'Energie',   color: 'var(--color-energy)'   },
]

export type ResourceValue = UiState[ResourceKey]
export type ResourceGain  = UiState[ResourceGainKey]
