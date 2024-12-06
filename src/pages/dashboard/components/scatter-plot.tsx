import { useQuery } from '@tanstack/react-query'

import { TrendingUp } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Button } from '@/components/custom/button'

const chartConfig = {
  temp: {
    label: 'Temperature',
    color: 'hsl(var(--chart-1))',
  },
  hum: {
    label: 'Humidiy',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export async function getMonthsAverage() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  const res = await fetch(apiUrl + '/DHT/api/avg/months?format=json&n=12')
  const data: {
    data: { dt: string; temp: number | null; hum: number | null }[] | null
  } | null = await res.json()
  console.log('data:', data)
  return data
}

const monthNamesInFrench = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export function ScatterPlot() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['monthAverages'],
    queryFn: getMonthsAverage,
    staleTime: 1000 * 60 * 60,
  })

  const Date = data?.data?.map((i) => {
    return {
      temp: i.temp ?? 0,
      hum: i.hum ?? 0,
      month: monthNamesInFrench[parseInt(i.dt.split('-')[1]) - 1],
    }
  })

  if (isError) return <p>Failed to load data</p>

  // Calculate the trend (difference between the last and first month)
  const tempChange = data?.data?.length
    ? (data?.data?.[data?.data.length - 1]?.temp ?? 0) -
      (data?.data?.[0]?.temp ?? 0)
    : 0
  const humChange = data?.data?.length
    ? (data?.data?.[data?.data.length - 1]?.hum ?? 0) -
      (data?.data?.[0]?.hum ?? 0)
    : 0

  // Create a dynamic period for the card footer
  const startMonth =
    monthNamesInFrench[parseInt(data?.data?.[0]?.dt.split('-')[1] ?? '0') || 0]
  const endMonth =
    monthNamesInFrench[
      parseInt(data?.data?.[data?.data.length - 1]?.dt.split('-')[1] ?? '0') ||
        0
    ]
  const period = `${startMonth} - ${endMonth} 2024`

  return (
    <Card className='col-span-1 lg:col-span-4'>
      <CardHeader className='items-center pb-4'>
        <CardTitle>Radar Chart - Multiple</CardTitle>
        <CardDescription>
          Affichage de la température et de l'humidité pour les derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent className='relative min-h-[250px] w-full pb-0'>
        {isLoading ? (
          <Button
            className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            variant={'ghost'}
            loading
            size={'lg'}
          ></Button>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[250px]'
          >
            <RadarChart data={Date}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='line' />}
              />
              <PolarAngleAxis dataKey='month' />
              <PolarGrid />
              <Radar
                dataKey='temp'
                fill='var(--color-temp)'
                fillOpacity={0.5}
              />
              <Radar dataKey='hum' fill='var(--color-hum)' fillOpacity={0.4} />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        {!isLoading && (
          <>
            <div className='flex items-center gap-2 font-medium leading-none'>
              {tempChange > 0
                ? `Température en hausse de ${tempChange.toFixed(2)} °C`
                : tempChange < 0
                  ? `Température en baisse de ${Math.abs(tempChange).toFixed(2)} °C`
                  : 'Température stable'}
              <TrendingUp className='h-4 w-4' />
            </div>
            <div className='flex items-center gap-2 leading-none text-muted-foreground'>
              {humChange > 0
                ? `Humidité en hausse de ${humChange.toFixed(2)} %`
                : humChange < 0
                  ? `Humidité en baisse de ${Math.abs(humChange).toFixed(2)} %`
                  : 'Humidité stable'}
            </div>
            <div className='flex items-center gap-2 leading-none text-muted-foreground'>
              {period}
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export default ScatterPlot
