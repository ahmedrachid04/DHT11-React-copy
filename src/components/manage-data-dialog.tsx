import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import {
  AddNotificationParameterRequest,
  NotificationParameter,
  NotificationParameterType,
} from '@/lib/types/notification_parameter'
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { djangoRequest } from '@/lib/django-service'

interface Props {
  columnsName: {
    mainResource: string
    user: string
  }
  text: {
    title: string
    desc: string
  }
  type: NotificationParameterType
}

async function getNotificationsParameterOfType(
  context: QueryFunctionContext<[string, NotificationParameterType | null]>
) {
  if (context.queryKey[1]) {
    const { data } = await djangoRequest<NotificationParameter[]>({
      endpoint: `/notifications/?type=${context.queryKey[1]}`,
      method: 'GET',
    })
    return data
  } else throw new Error('le type de notification parametre est requis')
}

export default function ManageDataDialog(props: Props) {
  const [mainSourceInputText, setMainSourceInputText] = useState('')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications-parameters', props.type],
    queryFn: getNotificationsParameterOfType,
    staleTime: 1000 * 60 * 30,
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { mutate: addNotificationParameter, isPending } = useMutation({
    mutationFn: async (mainSourceInputText: string) => {
      const data = await djangoRequest<
        NotificationParameter,
        AddNotificationParameterRequest
      >({
        method: 'POST',
        endpoint: '/notifications/add/',
        body: {
          mainResource: mainSourceInputText,
          type: props.type,
        },
      })
      return data
    },

    onSuccess: () => {
      refetch()
    },
  })
  const { mutate: deleteNotificationParameter, isPending: isDeletionPending } =
    useMutation({
      mutationFn: async (parameterId: number) => {
        const data = await djangoRequest<NotificationParameter>({
          method: 'DELETE',
          endpoint: `/notifications/delete/${parameterId}/`,
        })
        return data
      },
      onSettled: () => {
        setIsDeleteModalOpen(false)
      },
      onSuccess: () => {
        refetch()
      },
    })
  const handleDelete = (id: number) => {
    deleteNotificationParameter(id)
  }
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setMainSourceInputText('')
    addNotificationParameter(mainSourceInputText)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Gérer</Button>
      </DialogTrigger>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{props.text.title}</DialogTitle>
          <DialogDescription>{props.text.desc}</DialogDescription>
        </DialogHeader>

        {/* Add new notification parameter form */}
        <form
          onSubmit={handleAdd}
          className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'
        >
          <div className='space-y-2'>
            <Label htmlFor='number'>{props.columnsName.mainResource}</Label>
            <Input
              value={mainSourceInputText}
              onChange={(e) => setMainSourceInputText(e.target.value)}
              required
            />
          </div>
          <Button loading={isPending} type='submit' className='md:col-span-2'>
            Ajouter
          </Button>
        </form>

        {/* Subscribers table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>
                  {props.columnsName.mainResource}
                </TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-12'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data &&
                data.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className='text-center'>
                      {subscriber.mainResource}
                    </TableCell>
                    <TableCell>
                      {format(subscriber.created_at, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <AlertDialog open={isDeleteModalOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            onClick={() => setIsDeleteModalOpen(true)}
                            variant='ghost'
                            size='icon'
                            className='text-destructive hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                            <span className='sr-only'>Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous absolument sûr ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Voulez-vous supprimer cette
                              {props.columnsName.mainResource} ? Cette action ne
                              peut pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setIsDeleteModalOpen(false)}
                              disabled={isDeletionPending}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                loading={isDeletionPending}
                                onClick={() => handleDelete(subscriber.id)}
                                variant={'destructive'}
                              >
                                Supprimer
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className='flex w-full items-center justify-center text-center text-muted-foreground'
                  >
                    {isLoading ? (
                      <Button variant={'ghost'} size={'icon'} loading></Button>
                    ) : (
                      <p>No data found</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
