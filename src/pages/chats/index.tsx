import { useEffect, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import dayjs from 'dayjs'
import {
  IconArrowLeft,
  IconMessages,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Layout } from '@/components/custom/layout'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/custom/button'
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Incident, IncidentNote } from '@/lib/types/incident'
import { djangoRequest } from '@/lib/django-service'
import { useAuth } from '@/hooks/use-auth'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useNavigate, useParams } from 'react-router-dom'

type CreateIncidentNoteRequest = {
  note: string
  incident: number
  user_id: string
}
async function getIncidentNotes(
  context: QueryFunctionContext<[string, number | null]>
) {
  if (context.queryKey[1]) {
    const { data } = await djangoRequest<IncidentNote[]>({
      endpoint: `/api/get-incidents-by-id?incident_id=${context.queryKey[1]}`,
      method: 'GET',
    })
    return data
  } else throw new Error("L'identifiant de l'incident est requis")
}
export default function Chats() {
  const params = useParams()
  const queryClient = useQueryClient()
  const data = queryClient.getQueryData(['get-incidents']) as Incident[] | null

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    data?.find((i) => String(i.id) == String(params.id)) ?? null
  )
  const [currentMessage, setCurrentMessage] = useState('')
  const navigate = useNavigate()

  const {
    data: notesData,
    isFetching: isNoteFetching,
    isLoading,
    refetch: noteRefetch,
  } = useQuery({
    queryKey: ['incident-note', selectedIncident?.id ?? null],
    queryFn: getIncidentNotes,
    staleTime: 1000 * 10,
  })
  const { user } = useAuth()

  const { mutate: sendMessage, isPending: isDataSending } = useMutation({
    mutationKey: ['send-message'],
    mutationFn: async ({
      data: params,
    }: {
      data: { message: string; user_id: string; incident: number }
    }) => {
      if (selectedIncident?.id && user?.id) {
        const data = await djangoRequest<
          IncidentNote,
          CreateIncidentNoteRequest
        >({
          method: 'POST',
          endpoint: '/auth/incident-notes/',
          isDataPure: true,
          body: {
            note: params.message,
            incident: params.incident,
            user_id: params.user_id,
          },
        })
        return data
      } else {
        throw new Error(
          "L'identifiant de l'incident et l'identifiant de l'utilisateur sont requis"
        )
      }
    },
    onMutate: async (newNote) => {
      if (user) {
        // Annuler toutes les requêtes sortantes
        // (pour qu'elles ne remplacent pas notre mise à jour optimiste)
        await queryClient.cancelQueries({
          queryKey: ['incident-note', newNote.data.incident],
        })

        // Prendre un instantané de la valeur précédente
        const previousNotes = queryClient.getQueryData([
          'incident-note',
          newNote.data.incident,
        ])
        const newNoteSrtructred: IncidentNote = {
          user_id: user,
          note: newNote.data.message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          incident: newNote.data.incident,
          id: Math.floor(Math.random() * 1000),
        }

        // Mettre à jour de manière optimiste avec la nouvelle valeur
        queryClient.setQueryData(
          ['incident-note', newNote.data.incident],
          (old: IncidentNote[]) => [newNoteSrtructred, ...old]
        )

        // Retourner un objet de contexte avec la valeur instantanée
        return { previousNotes }
      }
    },
    // Si la mutation échoue,
    // utiliser le contexte renvoyé par onMutate pour revenir en arrière
    onError: (_, newNote, context) => {
      queryClient.setQueryData(
        ['incident-note', newNote.data.incident],
        context?.previousNotes ?? []
      )
    },
    // Toujours recharger après une erreur ou un succès :
    onSettled: (newNote) => {
      queryClient.invalidateQueries({
        queryKey: ['incident-note', newNote?.data?.incident],
      })
    },
    onSuccess: () => {
      noteRefetch()
    },
  })
  useEffect(() => {
    if (data && data.length > 0 && !selectedIncident) {
      setSelectedIncident(data[0]) // Initialiser avec le premier élément s'il n'est pas déjà sélectionné
    }
  }, [data, selectedIncident])
  const [mobileSelectedUser, setMobileSelectedIncident] =
    useState<Incident | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [closeIncidenceModalOpen, setCloseIncidenceModalOpen] = useState(false)
  const { mutate: deleteIncident, isPending: isDeletingIncidentPending } =
    useMutation({
      mutationKey: ['delete-incident', selectedIncident?.id],
      mutationFn: async () => {
        await djangoRequest({
          endpoint: `/auth/incidents/${selectedIncident?.id}/`,
          method: 'DELETE',
        })
        return true
      },
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: ['get-incidents'] })
        goBackToIncidentsTablePage()
      },
      onSettled: () => {
        setDeleteModalOpen(false)
      },
    })
  const goBackToIncidentsTablePage = () => {
    navigate('/incidents')
  }
  const { mutate: closeIncident, isPending: isClosingIncidentPending } =
    useMutation({
      mutationKey: ['close-incident', selectedIncident?.id],
      mutationFn: async () => {
        await djangoRequest<undefined, { incident_id: number }>({
          endpoint: `/api/incident/close`,
          method: 'POST',
          body: { incident_id: selectedIncident?.id as number },
        })
        return true
      },
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: ['get-incidents'] })
      },
      onSettled: () => {
        setCloseIncidenceModalOpen(false)
      },
    })
  return (
    <Layout fixed>
      {/* ===== En-tête supérieur ===== */}
      <Layout.Header>
        <div className='ml-auto flex items-center space-x-4'>
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body className='sm:overflow-hidden'>
        <section className='flex h-full gap-6'>
          {/* Côté gauche */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Boîte de réception</h1>
                  <IconMessages size={20} />
                </div>
              </div>
            </div>

            <div className='-mx-3 h-full overflow-auto p-3'>
              {(data ?? []).map((incident) => {
                return (
                  <Fragment key={incident.id}>
                    <button
                      type='button'
                      className={cn(
                        `-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
                        (selectedIncident?.id ?? '') === incident.id &&
                          'sm:bg-muted'
                      )}
                      onClick={() => {
                        setSelectedIncident(incident)
                        setMobileSelectedIncident(incident)
                      }}
                    >
                      <div className='flex gap-2'>
                        <Avatar>
                          <AvatarFallback>{incident.id}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className='col-start-2 row-span-2 line-clamp-1 font-medium'>
                            {incident.title}
                          </span>
                          <span
                            className={cn(
                              'col-start-2 row-span-2 line-clamp-1 font-medium ',
                              incident.resolved
                                ? 'text-red-700'
                                : 'text-green-600'
                            )}
                          >
                            {incident.resolved ? 'fermé' : 'ouvert'}
                          </span>
                        </div>
                      </div>
                    </button>
                    <Separator className='my-1' />
                  </Fragment>
                )
              })}
            </div>
          </div>

          {/* Côté droit */}
          <div
            className={cn(
              'absolute inset-0 left-full z-50 flex w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex',
              mobileSelectedUser && 'left-0'
            )}
          >
            {/* Partie supérieure */}
            <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
              {/* Gauche */}
              <div className='flex gap-3'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='-ml-2 h-full sm:hidden'
                  onClick={() => setMobileSelectedIncident(null)}
                >
                  <IconArrowLeft />
                </Button>
                <div className='flex items-center gap-2 lg:gap-4'>
                  <Avatar className='size-9 lg:size-11'>
                    <AvatarFallback>{selectedIncident?.id}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className='col-start-2 row-span-2 line-clamp-1 text-sm font-medium lg:text-base'>
                      {selectedIncident?.title}
                    </span>
                    <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 block max-w-32 text-ellipsis text-nowrap text-xs text-muted-foreground lg:max-w-none lg:text-sm'>
                      {selectedIncident?.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Droite */}
              <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                <Button
                  size='icon'
                  variant='ghost'
                  className={cn(
                    'me-6 hidden size-8 rounded-full sm:inline-flex lg:size-10',
                    selectedIncident?.resolved
                      ? 'text-red-700'
                      : 'text-green-600'
                  )}
                >
                  {!selectedIncident?.resolved ? 'Ouvert' : 'Fermé'}
                </Button>
                <AlertDialog open={closeIncidenceModalOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Êtes-vous absolument sûr ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Voulez-vous fermer cet incident ? Cette action ne peut
                        pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setCloseIncidenceModalOpen(false)}
                      >
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={() => closeIncident()}
                          variant={'destructive'}
                          loading={isClosingIncidentPending}
                        >
                          Fermer
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={deleteModalOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Êtes-vous absolument sûr ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Voulez-vous supprimer cet incident ? Cette action ne
                        peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDeleteModalOpen(false)}
                      >
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={() => deleteIncident()}
                          variant={'destructive'}
                          loading={isDeletingIncidentPending}
                        >
                          Supprimer
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                    >
                      <DotsHorizontalIcon className='h-4 w-4' />
                      <span className='sr-only'>Ouvrir le menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-[160px]'>
                    <DropdownMenuItem onClick={() => setDeleteModalOpen(true)}>
                      Supprimer
                    </DropdownMenuItem>
                    {!selectedIncident?.resolved && (
                      <DropdownMenuItem
                        onClick={() => setCloseIncidenceModalOpen(true)}
                      >
                        Fermer l'incident
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  loading={isNoteFetching}
                  size='icon'
                  onClick={() => noteRefetch()}
                  variant='ghost'
                  className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
                >
                  {!isNoteFetching && (
                    <IconRefresh className='stroke-muted-foreground spin-in-180 sm:size-5' />
                  )}
                </Button>
              </div>
            </div>

            {/* Conversation */}
            <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0'>
              <div className='flex size-full flex-1'>
                <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                  <div className='chat-flex relative flex h-40 w-full flex-grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4 md:h-[70vh] '>
                    {isLoading && (
                      <Button
                        size={'icon'}
                        loading
                        variant={'ghost'}
                        className='absolute right-1/2 top-1/2'
                      ></Button>
                    )}
                    {!isLoading && notesData?.length == 0 && (
                      <Button
                        size={'icon'}
                        loading
                        variant={'ghost'}
                        className='absolute right-1/2 top-1/2'
                      >
                        Aucun message
                      </Button>
                    )}
                    {notesData &&
                      notesData.map((note) => (
                        <Fragment
                          key={`${note.id}-${note?.user_id?.username}-${note.incident}`}
                        >
                          <div
                            className={cn(
                              'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
                              user?.id === note?.user_id?.id
                                ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-white'
                                : 'self-start rounded-[16px_16px_16px_0] bg-secondary '
                            )}
                          >
                            {note.note}{' '}
                            <span
                              className={cn(
                                'mt-1 block text-xs font-light italic text-muted-foreground',
                                user?.id === note?.user_id?.id &&
                                  'text-right text-neutral-300'
                              )}
                            >
                              {!(user?.id === note?.user_id?.id) &&
                                note?.user_id?.username}{' '}
                              {dayjs(note.created_at).format('h:mm a')}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                  </div>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.currentTarget
                  setCurrentMessage('')
                  user?.id &&
                    selectedIncident?.id &&
                    sendMessage({
                      data: {
                        incident: selectedIncident.id,
                        message: currentMessage,
                        user_id: user.id,
                      },
                    })
                }}
                className='flex w-full flex-none gap-2'
              >
                <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                  <div className='space-x-1'></div>
                  <label className='flex-1'>
                    <span className='sr-only'>Zone de texte du chat</span>
                    <input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      type='text'
                      name='input-message'
                      placeholder='Tapez vos messages...'
                      className='h-8 w-full bg-inherit focus-visible:outline-none'
                    />
                  </label>
                  <Button
                    disabled={!currentMessage || isDataSending}
                    variant='ghost'
                    size='icon'
                    className='hidden sm:inline-flex'
                    type='submit'
                  >
                    <IconSend size={20} />
                  </Button>
                </div>
                <Button
                  disabled={!currentMessage || isDataSending}
                  className='h-full sm:hidden'
                  rightSection={<IconSend size={18} />}
                  type='submit'
                >
                  Envoyer
                </Button>
              </form>
            </div>
          </div>
        </section>
      </Layout.Body>
    </Layout>
  )
}
