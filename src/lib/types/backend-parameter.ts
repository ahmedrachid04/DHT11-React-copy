export type BackendParameter = {
  value: number
  type: BackendParameterType
}

export type AddBackendParameterRequest = {
  value: number
}

export type BackendParameterType =
  | 'TEMP_MAX'
  | 'TEMP_MIN'
  | 'HUM_MAX'
  | 'HUM_MIN'
  | 'COUNTER_TRESHHOLD'
