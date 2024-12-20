import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'

import LongText from '@/components/long-text.tsx'
import { callTypes, userTypes } from '../data/data.ts'

import { DataTableColumnHeader } from './data-table-column-header.tsx'
import { DataTableRowActions } from './data-table-row-actions.tsx'
import { UserInfo } from '@/lib/types/login-response.ts'

export const columns: ColumnDef<UserInfo>[] = [  
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('username')}</LongText>
    ),
    
    enableHiding: false,
  },  
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className=''>
        <p>{row.getValue('email')}
        </p>
        </div>
    ),
  },  
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { is_active } = row.original
      const badgeColor = callTypes.get(is_active)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {row.getValue('is_active') ? "Active" : "Desactive"}
          </Badge>
        </div>
      )
    },
    filterFn: 'weakEquals',
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'is_staff',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const { is_staff } = row.original
      const userType = userTypes.find(({ value }) => value === is_staff)

      if (!userType) {
        return null
      }

      return (
        <div className='flex gap-x-2 items-center'>
          {userType.icon && (
            <userType.icon size={16} className='text-muted-foreground' />
          )}
          <span className='capitalize text-sm'>{userType.label}</span>
        </div>
      )
    },
    filterFn: 'weakEquals',
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
