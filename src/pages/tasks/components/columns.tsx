import { ColumnDef } from '@tanstack/react-table'

import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

import { statuses } from '../data/data'

import { Incident } from '@/lib/types/incident'

export const columns: ColumnDef<Incident & { closed_by: string | null }>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Tout sélectionner'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Sélectionner la ligne'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID de l'incident" />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Titre' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'reported_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Créé le' />
    ),
    cell: ({ row }) => {
      return (
        <div className=''>
          <span className='max-w-32 truncate text-start font-medium sm:max-w-72 md:max-w-[31rem]'>
            {new Date(row.getValue('reported_at')).toLocaleDateString('fr-FR', {
              month: '2-digit',
              year: '2-digit',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'resolved',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('resolved')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'temperature',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Température actuelle' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span className=''>{row.getValue('temperature')}C°</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'humidity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Humidité actuelle' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{row.getValue('humidity')}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'closed_by',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fermé par' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{row.getValue('closed_by')}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
