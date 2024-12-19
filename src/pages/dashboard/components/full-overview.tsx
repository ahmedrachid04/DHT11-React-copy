import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Button } from '@/components/custom/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { useFormatter } from 'use-intl'
import { cn, getRangeRecords } from '@/lib/utils'
import { getLatestNRecords } from './getLatestNRecords'
import CSVButton from './csv-button'

export type ChartItem = { dt?: string; temp?: number; hum: number }

const chartConfig = {
  visitors: {
    label: 'Hum et temp',
  },
  temp: {
    label: 'Temperature',
    color: 'hsl(var(--chart-1))',
  },
  hum: {
    label: 'humidité',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface Props {
  type: 'hum' | 'temp'
}

export function FullOverview(props: Props) {
  const [timeRange, setTimeRange] = React.useState(90)
  const [date, setDate] = React.useState<DateRange | undefined>(undefined)
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['latestNRecords', timeRange],
    queryFn: getLatestNRecords,
    enabled: !(date?.from && date?.to),
    staleTime: 1000 * 60 * 60,
  })
  const { data: chartRangeData, isLoading: isRangeLoading } = useQuery({
    queryKey: ['rangeRecords', date],
    queryFn: getRangeRecords,
    enabled: !!(date?.from && date?.to),
    staleTime: 1000 * 60 * 60,
  })

  const formatter = useFormatter()
  return (
    <Card className='col-span-1'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1 text-center sm:text-left'>
          <CardTitle>Graphique de zone - Interactif</CardTitle>
          <CardDescription>
            Affichage de la température et de l'humidité
          </CardDescription>
        </div>
        <CSVButton
          disabled={isLoading || isRangeLoading}
          data={chartData ? chartData : chartRangeData}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={isRangeLoading || isLoading}
              variant='outline'
              className='flex items-center gap-x-2'
            >
              <CalendarIcon
                size={16}
                className={!date?.from && !date?.to ? 'text-gray-500' : ''}
              />
              {date?.from && date.to && (
                <p>
                  {formatter.dateTimeRange(date.from, date.to, {
                    day: 'numeric',
                    month: '2-digit',
                  })}
                </p>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode='range'
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date > new Date() ||
                date < new Date('1900-01-01') ||
                isRangeLoading ||
                isLoading
              }
            />
          </PopoverContent>
        </Popover>

        <Select
          disabled={isRangeLoading || isLoading}
          value={`${timeRange}`}
          onValueChange={(v) => {
            setDate(undefined)
            setTimeRange(parseInt(v))
          }}
        >
          <SelectTrigger
            className={cn(
              'w-[160px] rounded-lg  sm:ml-auto',
              date?.from && date.to && 'text-gray-500'
            )}
            aria-label='Sélectionnez une valeur'
          >
            <SelectValue placeholder='Derniers 3 mois' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value={'90'} className='rounded-lg'>
              Derniers 3 mois
            </SelectItem>
            <SelectItem value={'365'} className='rounded-lg'>
              Derniers 12 mois
            </SelectItem>
            <SelectItem value={'30'} className='rounded-lg'>
              Derniers 30 jours
            </SelectItem>
            <SelectItem value={'7'} className='rounded-lg'>
              Derniers 7 jours
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='relative px-2 pt-4 sm:px-6 sm:pt-6'>
        {(date ? isRangeLoading : isLoading) && (
          <Button
            className='absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2'
            variant={'ghost'}
            loading
            size={'lg'}
          ></Button>
        )}
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={
              (date
                ? chartRangeData?.map((c) => {
                    const temporary = { ...c }
                    if (props.type === 'hum' && temporary?.hum) {
                      delete temporary.temp
                    } else if (props.type === 'temp' && temporary?.temp) {
                      delete temporary.hum
                    }
                    return temporary
                  })
                : chartData?.map((c) => {
                    const temporary = { ...c }
                    if (props.type === 'hum' && temporary?.hum) {
                      delete temporary.temp
                    } else if (props.type === 'temp' && temporary?.temp) {
                      delete temporary.hum
                    }
                    return temporary
                  })) ?? []
            }
          >
            <defs>
              <linearGradient id='fillTemp' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-temp)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-temp)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillHum' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-hum)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-hum)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='dt'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={15}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  indicator='dot'
                />
              }
            />
            <Area
              dataKey='hum'
              type='natural'
              fill='url(#fillHum)'
              stroke='var(--color-hum)'
              stackId='a'
              unit='%'
            />
            <Area
              dataKey='temp'
              type='natural'
              fill='url(#fillTemp)'
              stroke='var(--color-temp)'
              stackId='a'
              unit={'°C'}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
