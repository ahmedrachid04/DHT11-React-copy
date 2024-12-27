import { Layout } from '@/components/custom/layout.tsx'
import { Button } from '@/components/custom/button.tsx'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FullOverview } from './components/full-overview.tsx'
import { SummaryStatistics } from './responses/statistics.ts'
import ScatterPlot from './components/scatter-plot.tsx'
import DateComparisonCard from './components/compare-two-dates.tsx'
import StatisticCard from './components/StatisticCard.tsx'

import { UserNav } from '@/components/user-nav.tsx'
import { djangoRequest } from '@/lib/django-service.ts'
import { TempIcon } from '@/components/tempIcon.tsx'
import { HumidityIcon } from '@/components/humidityIcon.tsx'

async function getStatistics() {
  const { data } = await djangoRequest<SummaryStatistics>({
    endpoint: '/api/dht/statistics',
    method: 'GET',
  })
  return data
}

export default function Dashboard() {
  const { data, isFetching } = useQuery({
    queryKey: ['summaryStatistics'],
    queryFn: getStatistics,
    staleTime: 30 * 1000,
  })
  const currentTime = new Date()
  const currentRecordTime = data?.curr?.record?.dt
    ? new Date(data.curr.record.dt)
    : currentTime
  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header>
        <div className='flex w-full items-center justify-end'>
          <UserNav />
        </div>
      </Layout.Header>

      {/* ===== Main ===== */}
      <Layout.Body>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Tableau de bord</h1>
          <div className='flex items-center space-x-2'>
            <Button
              variant={'ghost'}
              className='flex items-center gap-x-2 font-semibold'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
                className='lucide lucide-map-pin-house'
              >
                <path d='M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z' />
                <path d='M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2' />
                <path d='M18 22v-3' />
                <circle cx='10' cy='10' r='3' />
              </svg>
              Oujda
            </Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='vue d’ensemble'
          className='space-y-4'
        >
          <TabsContent value='vue d’ensemble' className='space-y-4'>
            <Tabs
              orientation='vertical'
              defaultValue='température'
              className='space-y-2'
            >
              <div className='flex w-full items-center justify-center'>
                <TabsList className=''>
                  <TabsTrigger value='température'>Température</TabsTrigger>
                  <TabsTrigger value='humidité'>Humidité</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='température' className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <StatisticCard
                    title='Maintenant'
                    icon={TempIcon}
                    value={data?.curr?.record?.temp + '°C'}
                    isLoading={isFetching}
                    trend={''}
                    trendSuffix={timeDifference(currentTime, currentRecordTime)}
                  />
                  <StatisticCard
                    title='Température moyenne aujourd’hui'
                    icon={TempIcon}
                    value={data?.avg?.daily.record.temp + '°C'}
                    trend={data?.avg?.daily?.humTemp}
                    trendSuffix="% d'hier"
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Température moyenne hebdomadaire'
                    icon={TempIcon}
                    value={data?.avg.weekly.record.temp + '°C'}
                    trend={data?.avg.weekly.humTemp}
                    trendSuffix='% de la semaine dernière'
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Température Max/Min'
                    icon={TempIcon}
                    value={
                      data?.extremes?.highest?.temp +
                      '°C/' +
                      data?.extremes?.lowest?.temp +
                      '°C'
                    }
                    isLoading={isFetching}
                  />
                </div>
                <div className='grid grid-cols-1 '>
                  <FullOverview type='temp' />
                </div>
              </TabsContent>
              <TabsContent value='humidité' className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <StatisticCard
                    title='Maintenant'
                    icon={HumidityIcon}
                    value={data?.curr.record.hum + '%'}
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Humidité moyenne aujourd’hui'
                    icon={HumidityIcon}
                    value={data?.avg.daily.record.hum + '%'}
                    trend={data?.avg.daily.humGrow}
                    trendSuffix='% d’hier'
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Humidité moyenne hebdomadaire'
                    icon={HumidityIcon}
                    value={data?.avg.weekly.record.hum + '%'}
                    trend={data?.avg.weekly.humGrow}
                    trendSuffix='% de la semaine dernière'
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Humidité Max/Min'
                    icon={HumidityIcon}
                    value={
                      data?.extremes?.highest?.hum +
                      '%/' +
                      data?.extremes?.lowest?.hum +
                      '%'
                    }
                    isLoading={isFetching}
                  />
                </div>
                <div className='grid grid-cols-1 '>
                  <FullOverview type='hum' />
                </div>
              </TabsContent>
            </Tabs>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <ScatterPlot />

              <DateComparisonCard />
            </div>
          </TabsContent>
        </Tabs>
      </Layout.Body>
    </Layout>
  )
}

function timeDifference(current: Date, previous: Date) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = current.getTime() - previous.getTime()

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' secondes ago'
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' heures ago'
  } else if (elapsed < msPerMonth) {
    return 'environ ' + Math.round(elapsed / msPerDay) + ' jours ago'
  } else if (elapsed < msPerYear) {
    return 'environ ' + Math.round(elapsed / msPerMonth) + ' mois ago'
  } else {
    return 'environ ' + Math.round(elapsed / msPerYear) + ' ans ago'
  }
}
