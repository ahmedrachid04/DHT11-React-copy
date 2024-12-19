export type RecordData = {
  temp?: number | null
  hum?: number | null
  dt: string | null
}

type ExtremesRecord = {
  highest: {
    temp: number | null
    hum: number | null
  }
  lowest: {
    temp: number | null
    hum: number | null
  }
}

type AvgRecord = {
  record: {
    temp: number
    hum: number
    dt: string
  }
  humGrow: number | null
  humTemp: number | null
}

type CurrRecord = {
  record: RecordData
}

export type SummaryStatistics = {
  curr: CurrRecord
  avg: {
    daily: AvgRecord
    weekly: AvgRecord
    monthly: AvgRecord
  }
  extremes: ExtremesRecord
}

// Response data type
export type StatisticsResponse = {
  data: SummaryStatistics
}
