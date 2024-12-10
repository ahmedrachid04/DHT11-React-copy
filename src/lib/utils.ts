import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { djangoRequest } from './django-service'
import { RecordData } from '@/pages/dashboard/responses/statistics'
import { DateRange } from 'react-day-picker'
import { Incident } from './types/incident'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const apiUrl = import.meta.env.VITE_BACKEND_URL

export const ProjectName = 'Oujda Weather Station'

export function formatDateToYYYYMMDD(date: Date) {
  return date.toISOString().split('T')[0]
}

export async function getMonthsAverage() {
  const { data } = await djangoRequest<
    { dt: string; temp: number | null; hum: number | null }[]
  >({
    endpoint: `/api/dht/avg/months`,
    method: 'GET',
    searchParams: {
      n: 12,
    },
  })

  return data
}

export async function getDateDiffResult({
  queryKey,
}: {
  queryKey: [string, Date | undefined, Date | undefined]
}) {
  const startDate = queryKey[queryKey.length - 2] as Date | undefined
  const endDate = queryKey[queryKey.length - 1] as Date | undefined

  if (!startDate || !endDate) {
    throw Error('no startDate or endDate')
  }
  const { data } = await djangoRequest<{
    from_date: string
    to_date: string
    temp_diff: number
    hum_diff: number
  }>({
    endpoint: `/api/dht/diff`,
    method: 'GET',
    searchParams: {
      from: formatDateToYYYYMMDD(startDate),
      to: formatDateToYYYYMMDD(endDate),
    },
  })

  return data
}

export async function getRangeRecords({
  queryKey,
}: {
  queryKey: [string, DateRange | undefined]
}) {
  const timeRange = queryKey[queryKey.length - 1] as DateRange | undefined

  if (!timeRange?.from || !timeRange?.to) {
    throw Error('no timerange')
  }

  const { data } = await djangoRequest<RecordData[]>({
    endpoint: `/api/dht/avg/range`,
    method: 'GET',
    searchParams: {
      from: formatDateToYYYYMMDD(timeRange.from),
      to: formatDateToYYYYMMDD(timeRange.to),
    },
  })
  data && data.reverse()
  return data
}

export async function getIncident() {
  const { data } = await djangoRequest<Incident[]>({
    endpoint: '/auth/incidents',
    method: 'GET',
  })
  return data
}
