import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/custom/button.tsx'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../components/data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  isFetching: boolean
}

export function DataTableToolbar<TData>({
  table,
  isFetching,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filtrer les tâches...'
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'></div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Réinitialiser
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
        {isFetching && (
          <Button variant={'ghost'} loading size={'icon'}></Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
