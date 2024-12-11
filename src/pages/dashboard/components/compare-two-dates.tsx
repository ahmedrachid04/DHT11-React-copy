import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn, getDateDiffResult } from '@/lib/utils'

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
        <CardTitle>Comparaison de dates</CardTitle>
        <CardDescription>Sélectionnez deux dates à comparer</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label
              htmlFor='start-date'
              className='text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Date de début
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
                    <span>Choisissez une date</span>
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
              Date de fin
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
                  {endDate ? (
                    format(endDate, 'PPP')
                  ) : (
                    <span>Choisissez une date</span>
                  )}
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
              data
                ? 'bg-primary/10 dark:bg-primary/20'
                : 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <div className='mb-2 flex w-full items-center justify-start'>
              <h3 className='text-lg font-semibold '>
                Résultat de la comparaison
              </h3>
              {isLoading && (
                <Button variant={'ghost'} loading size={'lg'}></Button>
              )}
            </div>

            {data ? (
              <p className='text-sm'>
                La température a augmenté de{' '}
                <span className='font-bold'>{data?.temp_diff}</span>°C, ce qui
                la rend
                {data?.temp_diff > 0 ? ' plus chaude' : ' plus froide'}{' '}
                qu'avant. L'humidité a
                {data?.hum_diff > 0 ? ' augmenté' : ' diminué'} de{' '}
                <span className='font-bold'>{data?.hum_diff}</span>% entre la
                1ère et la 2ème date.
              </p>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Veuillez sélectionner une date de début et une date de fin pour
                voir comment la température et l'humidité ont changé.
              </p>
            )}
            {startDate && endDate && endDate <= startDate && (
              <p className='text-sm text-red-600'>
                La date de début doit être antérieure à la date de fin
              </p>
            )}
            {error && <p className='text-sm text-red-600'>{error.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
