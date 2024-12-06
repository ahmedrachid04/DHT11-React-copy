import { Layout } from '@/components/custom/layout.tsx'
import { Button } from '@/components/custom/button.tsx'
import { useQuery } from '@tanstack/react-query'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useTranslations } from 'use-intl'
import { FullOverview } from './components/full-overview.tsx'
import { StatisticsResponse } from './responses/statistics.ts'
import ScatterPlot from './components/scatter-plot.tsx'
import DateComparisonCard from './components/compare-two-dates.tsx'
import StatisticCard from './components/StatisticCard.tsx'

const CurrentIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    className='h-4 w-4 text-muted-foreground'
  >
    <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
  </svg>
)

async function getStatistics() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  const res = await fetch(apiUrl + '/DHT/api/statistics?format=json')
  const data: StatisticsResponse | null = await res.json()
  return data
}

export default function Dashboard() {
  const { data, isFetching } = useQuery({
    queryKey: ['summaryStatistics'],
    queryFn: getStatistics,
    staleTime: 30 * 1000,
  })
  const t = useTranslations('dashboard')
  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header></Layout.Header>

      {/* ===== Main ===== */}
      <Layout.Body>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('dashboard')}
          </h1>
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
          defaultValue='overview'
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4'>
            <Tabs
              orientation='vertical'
              defaultValue='temp'
              className='space-y-2'
            >
              <div className='flex w-full items-center justify-center'>
                <TabsList className=''>
                  <TabsTrigger value='temp'>Temperature</TabsTrigger>
                  <TabsTrigger value='hum'>Humidity</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='temp' className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <StatisticCard
                    title='Maintenant'
                    icon={CurrentIcon}
                    value={data?.data?.curr?.record?.temp?.toFixed(2) + '°C'}
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Today Average temperature'
                    icon={CurrentIcon}
                    value={data?.data.avg.daily.record.temp.toFixed(2) + '°C'}
                    trend={data?.data?.avg?.daily?.humTemp}
                    trendSuffix="% d'hier"
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Weekly Average temperature'
                    icon={CurrentIcon}
                    value={data?.data.avg.weekly.record.temp.toFixed(2) + '°C'}
                    trend={data?.data.avg.weekly.humTemp}
                    trendSuffix='% de la semaine dernier'
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Max/Min temperature'
                    icon={CurrentIcon}
                    value={
                      data?.data?.extremes?.highest?.temp +
                      '°C/' +
                      data?.data?.extremes?.lowest?.temp +
                      '°C'
                    }
                    isLoading={isFetching}
                  />
                </div>
              </TabsContent>
              <TabsContent value='hum' className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <StatisticCard
                    title='Maintenant'
                    icon={CurrentIcon}
                    value={data?.data.curr.record.hum + '%'}
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Today Average Humidity'
                    icon={CurrentIcon}
                    value={data?.data.avg.daily.record.hum + '%'}
                    trend={data?.data.avg.daily.humGrow}
                    trendSuffix='% du jour dernier'
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Weekly Average Humidity'
                    icon={CurrentIcon}
                    value={data?.data.avg.weekly.record.hum + '%'}
                    trend={data?.data.avg.weekly.humGrow}
                    trendSuffix='% de la semaine dernier'
                    isLoading={isFetching}
                  />
                  <StatisticCard
                    title='Max/Min Humidity'
                    icon={CurrentIcon}
                    value={
                      data?.data?.extremes?.highest?.hum +
                      '%/' +
                      data?.data?.extremes?.lowest?.hum +
                      '%'
                    }
                    isLoading={isFetching}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className='grid grid-cols-1 '>
              <FullOverview />
            </div>
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
