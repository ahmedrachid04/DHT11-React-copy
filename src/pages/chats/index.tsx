import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import {
  IconArrowLeft,
  IconDotsVertical,
  IconMessages,
  IconPhone,
  IconSend,
  IconVideo,
} from '@tabler/icons-react'
import { cn, getIncident } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Layout } from '@/components/custom/layout'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/custom/button'

// Fake Data
import { useQuery } from '@tanstack/react-query'
import { Incident } from '@/lib/types/incident'
import { djangoRequest } from '@/lib/django-service'

async function getIncidentNotes(params: type) {
  const { data } = await djangoRequest<Incident[]>({
    endpoint: '/auth/incidents',
    method: 'GET',
  })
  return data
}

export default function Chats() {
  const { data, isFetching } = useQuery({
    queryKey: ['get-incidents'],
    queryFn: getIncident,
    staleTime: 1000 * 30,
  })

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    data?.[0] ?? null
  )
  const [mobileSelectedUser, setMobileSelectedIncident] =
    useState<Incident | null>(null)

  // const currentMessage = selectedIncident.messages.reduce(
  //   (acc: Record<string, Convo[]>, obj) => {
  //     const key = dayjs(obj.timestamp).format('D MMM, YYYY')

  //     // Create an array for the category if it doesn't exist
  //     if (!acc[key]) {
  //       acc[key] = []
  //     }

  //     // Push the current object to the array
  //     acc[key].push(obj)

  //     return acc
  //   },
  //   {}
  // )

  return (
    <Layout fixed>
      {/* ===== Top Heading ===== */}
      <Layout.Header>
        <div className='ml-auto flex items-center space-x-4'>
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body className='sm:overflow-hidden'>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
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
                        </div>
                      </div>
                    </button>
                    <Separator className='my-1' />
                  </Fragment>
                )
              })}
            </div>
          </div>

          {/* Right Side */}
          <div
            className={cn(
              'absolute inset-0 left-full z-50 flex w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex',
              mobileSelectedUser && 'left-0'
            )}
          >
            {/* Top Part */}
            <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
              {/* Left */}
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

              {/* Right */}
              <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                >
                  <IconVideo size={22} className='stroke-muted-foreground' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                >
                  <IconPhone size={22} className='stroke-muted-foreground' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
                >
                  <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
                </Button>
              </div>
            </div>

            {/* Conversation */}
            <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0'>
              <div className='flex size-full flex-1'>
                <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                  <div className='chat-flex flex h-[70vh] w-full flex-grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4'>
                    {/* {currentMessage &&
                      Object.keys(currentMessage).map((key) => (
                        <Fragment key={key}>
                          {currentMessage[key].map((msg, index) => (
                            <div
                              key={`${msg.sender}-${msg.timestamp}-${index}`}
                              className={cn(
                                'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
                                msg.sender === 'You'
                                  ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground/75'
                                  : 'self-start rounded-[16px_16px_16px_0] bg-secondary'
                              )}
                            >
                              {msg.message}{' '}
                              <span
                                className={cn(
                                  'mt-1 block text-xs font-light italic text-muted-foreground',
                                  msg.sender === 'You' && 'text-right'
                                )}
                              >
                                {dayjs(msg.timestamp).format('h:mm a')}
                              </span>
                            </div>
                          ))}
                          <div className='text-xs text-center'>{key}</div>
                        </Fragment>
                      ))} */}
                  </div>
                </div>
              </div>
              <form className='flex w-full flex-none gap-2'>
                <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                  <div className='space-x-1'></div>
                  <label className='flex-1'>
                    <span className='sr-only'>Chat Text Box</span>
                    <input
                      type='text'
                      placeholder='Type your messages...'
                      className='h-8 w-full bg-inherit focus-visible:outline-none'
                    />
                  </label>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hidden sm:inline-flex'
                  >
                    <IconSend size={20} />
                  </Button>
                </div>
                <Button
                  className='h-full sm:hidden'
                  rightSection={<IconSend size={18} />}
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </section>
      </Layout.Body>
    </Layout>
  )
}
