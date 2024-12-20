import { useState } from 'react'
import { IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/custom/layout.tsx'

import { UsersActionDialog } from './components/users-action-dialog'
import { columns } from './components/users-columns'
import { UsersDeleteDialog } from './components/users-delete-dialog'
import { UsersTable } from './components/users-table'
import UsersContextProvider, {
  type UsersDialogType,
} from './context/users-context'

import useDialogState from '@/hooks/use-dialog-state'
import { UserNav } from '@/components/user-nav'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/lib/utils'
import { UserInfo } from '@/lib/types/login-response'
import { useAuth } from '@/hooks/use-auth'

export default function Users() {
  // Dialog states
  const { user } = useAuth()
  const [currentRow, setCurrentRow] = useState<UserInfo | null>(null)
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const { data, isFetching } = useQuery({
    queryKey: ['get-users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 30,
  })
  return (
    <UsersContextProvider value={{ open, setOpen, currentRow, setCurrentRow }}>
      <Layout>
        {/* ===== Top Heading ===== */}
        <Layout.Header sticky>
          <div className='ml-auto flex items-center space-x-4'>
            <UserNav />
          </div>
        </Layout.Header>

        {/* <Main> */}

        <Layout.Body>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Liste des utilisateurs
              </h2>
              <p className='text-muted-foreground'>
                Gérez vos utilisateurs et leurs rôles ici.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button className='space-x-1' onClick={() => setOpen('add')}>
                <span>Ajouter un utilisateur</span> <IconUserPlus size={18} />
              </Button>
            </div>
          </div>

          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <UsersTable isLoading={isFetching} data={data} columns={columns} />
          </div>
        </Layout.Body>
        <UsersActionDialog
          key='user-add'
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
        />

        {currentRow && (
          <>
            <UsersActionDialog
              key={`user-edit-${currentRow.id}`}
              open={open === 'edit'}
              onOpenChange={() => {
                setOpen('edit')
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }}
              currentRow={currentRow}
            />
            {String(currentRow.id) !== String(user?.id) && (
              <UsersDeleteDialog
                key={`user-delete-${currentRow.id}`}
                open={open === 'delete'}
                onOpenChange={() => {
                  setOpen('delete')
                  setTimeout(() => {
                    setCurrentRow(null)
                  }, 500)
                }}
                currentRow={currentRow}
              />
            )}
          </>
        )}
      </Layout>
    </UsersContextProvider>
  )
}
