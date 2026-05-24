import type { components } from '../api/generated'

type UiState = components['schemas']['UiState']

export type ResourceKey = 'population' | 'consumerGoods' | 'industry' | 'energy' | 'housing'
export type ResourceGainKey = 'populationGain' | 'consumerGoodsGain' | 'industryGain' | 'energyGain' | 'housingGain'

export interface ResourceDef {
  key: ResourceKey
  gainKey: ResourceGainKey
  label: string
  color: string
}

export const RESOURCES: ResourceDef[] = [
  { key: 'population',    gainKey: 'populationGain',    label: 'Population', color: 'var(--color-population)' },
  { key: 'consumerGoods', gainKey: 'consumerGoodsGain', label: 'Güter',      color: 'var(--color-consumer)' },
  { key: 'industry',      gainKey: 'industryGain',      label: 'Industrie',  color: 'var(--color-industry)' },
  { key: 'energy',        gainKey: 'energyGain',        label: 'Energie',    color: 'var(--color-energy)' },
  { key: 'housing',       gainKey: 'housingGain',       label: 'Wohnraum',   color: 'var(--color-housing)' },
]

export type ResourceValue = UiState[ResourceKey]
export type ResourceGain = UiState[ResourceGainKey]
