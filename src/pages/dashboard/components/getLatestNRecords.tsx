import { RecordData } from '../responses/statistics'
import { djangoRequest } from '@/lib/django-service'

export async function getLatestNRecords({
  queryKey,
}: {
  queryKey: [string, number]
}) {
  const timeRange = queryKey[queryKey.length - 1]

  const { data } = await djangoRequest<RecordData[]>({
    endpoint: `/api/dht/avg/days`,
    method: 'GET',
    searchParams: {
      n: timeRange,
    },
  })

  data && data.reverse()

  return data
}
