'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'

import { UserInfo } from '@/lib/types/login-response'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { djangoRequest } from '@/lib/django-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UserInfo
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const { mutate: DeleteUser, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      await djangoRequest({
        method: 'DELETE',
        endpoint: '/auth/users/' + userId + '/',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-users'],
      })
      onOpenChange(false)
    },
  })
  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return
    currentRow?.id && DeleteUser(currentRow.id)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='mr-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Supprimer l'utilisateur
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            Cette action supprimera définitivement l'utilisateur avec le rôle de{' '}
            <span className='font-bold'>
              {currentRow.is_staff ? 'Admin' : 'Opérateur'}
            </span>{' '}
            du système. Cela ne peut pas être annulé.
          </p>

          <Label className='my-2'>
            Username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez le nom d'utilisateur pour confirmer la suppression."
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Attention!</AlertTitle>
            <AlertDescription>
              Veuillez faire attention, cette opération ne peut pas être
              annulée.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
