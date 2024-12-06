import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/custom/button'
import { useQuery } from '@tanstack/react-query'
import { formatDateToYYYYMMDD } from './full-overview'

export async function getDateDiffResult({
  queryKey,
}: {
  queryKey: [string, Date | undefined, Date | undefined]
}) {
  const startDate = queryKey[queryKey.length - 2] as Date | undefined
  const endDate = queryKey[queryKey.length - 1] as Date | undefined
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  if (!startDate || !endDate) {
    throw Error('no startDate or endDate')
  }
  const res = await fetch(
    apiUrl +
      `/DHT/api/diff?from=${formatDateToYYYYMMDD(startDate)}&to=${formatDateToYYYYMMDD(endDate)}`
  )
  const data: {
    data: {
      from_date: string
      to_date: string
      temp_diff: number
      hum_diff: number
    } | null
    error: string | null
  } | null = await res.json()
  if (data?.error) {
    throw new Error(data.error)
  }
  return data
}

export default function DateComparisonCard() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['diffBetween2Dates', startDate, endDate],
    queryFn: getDateDiffResult,
    enabled: !!endDate && !!startDate && endDate > startDate,
    staleTime: 1000 * 60 * 60,
  })

  return (
    <Card className='col-span-1 mx-auto w-full max-w-md lg:col-span-3'>
      <CardHeader>
        <CardTitle>Date Comparison</CardTitle>
        <CardDescription>Select two dates to compare</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label
              htmlFor='start-date'
              className='text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='start-date'
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {startDate ? (
                    format(startDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='end-date'
              className='text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='end-date'
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className='mt-6'>
          <div
            className={cn(
              'rounded-lg p-4 transition-all duration-300 ease-in-out',
              data?.data
                ? 'bg-primary/10 dark:bg-primary/20'
                : 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <div className='mb-2 flex w-full items-center justify-start'>
              <h3 className='text-lg font-semibold '>Comparison Result</h3>
              {isLoading && (
                <Button variant={'ghost'} loading size={'lg'}></Button>
              )}
            </div>

            {data?.data ? (
              <p className='text-sm'>
                The temperature has increased by{' '}
                <span className='font-bold'>{data?.data?.temp_diff}</span>°C,
                making it {data?.data?.temp_diff > 0 ? 'warmer' : 'cooler'} than
                before. The humidity has{' '}
                {data?.data?.hum_diff > 0 ? 'increased' : 'decreased'} by{' '}
                <span className='font-bold'>{data?.data?.hum_diff}</span>%
                between the 1st and 2nd date.
              </p>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Please select both a start date and an end date to see how the
                temperature and humidity have changed.
              </p>
            )}
            {startDate && endDate && endDate <= startDate && (
              <p className='text-sm text-red-600'>
                Start date should be before end date
              </p>
            )}
            {error && <p className='text-sm text-red-600'>{error.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
