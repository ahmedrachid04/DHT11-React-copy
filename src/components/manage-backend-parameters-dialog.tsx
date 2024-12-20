import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { djangoRequest } from '@/lib/django-service'
import {
  AddBackendParameterRequest,
  BackendParameter,
  BackendParameterType,
} from '@/lib/types/backend-parameter'

import { Check, Minus } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { TempIcon } from './tempIcon'

const translation: {
  [key in BackendParameterType]: { text: string; icon: ReactNode }
} = {
  COUNTER_TRESHHOLD: {
    text: 'Spécifiez le nombre maximal de tentatives autorisées avant de déclencher un incident.',
    icon: TempIcon,
  },
  HUM_MAX: {
    text: 'Définissez la limite supérieure d’humidité acceptable en pourcentage.',
    icon: TempIcon,
  },

  HUM_MIN: {
    text: 'Définissez la limite inférieure d’humidité acceptable en pourcentage.',
    icon: TempIcon,
  },

  TEMP_MAX: {
    text: 'Définissez la température maximale autorisée en pourcentage.',
    icon: TempIcon,
  },
  TEMP_MIN: {
    text: 'Définissez la température minimale autorisée en pourcentage.',
    icon: TempIcon,
  },
}

async function getBackendParameters() {
  const { data } = await djangoRequest<BackendParameter[]>({
    endpoint: `/parameters`,
    method: 'GET',
  })
  return data
}

export default function ManageBackendParametersDialog() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['backend-parameters'],
    queryFn: getBackendParameters,
    staleTime: 1000 * 60 * 30,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Manage</Button>
      </DialogTrigger>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Gestion de vos dépendances backend</DialogTitle>
          <DialogDescription>
            Organisez et configurez vos dépendances pour le bon fonctionnement
            du backend
          </DialogDescription>
        </DialogHeader>
        {isLoading && <Button loading variant={'ghost'} size={'icon'}></Button>}
        {/* Add new notification parameter form */}
        <div className=' grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2'>
          {data
            ?.sort((a, b) => {
              if (a.type < b.type) {
                return -1
              }
              if (a.type > b.type) {
                return 1
              }
              return 0
            })
            .map((backendParameter) => (
              <BackendParameterTypeForm
                refetch={refetch}
                key={backendParameter.type}
                type={backendParameter.type}
                label={backendParameter.type}
                value={backendParameter.value}
              />
            ))}
        </div>
        {/* Subscribers table */}
        <div className='rounded-md border'></div>
      </DialogContent>
    </Dialog>
  )
}

interface Props {
  type: BackendParameterType
  label: string
  value: number
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<BackendParameter[] | null, Error>>
}

const BackendParameterTypeForm = (props: Props) => {
  const [isInputChanged, setIsInputChanged] = useState(false)
  const { mutate: updateBackendParameter, isPending } = useMutation({
    mutationFn: async (params: {
      type: BackendParameterType
      value: number
    }) => {
      const data = await djangoRequest<
        BackendParameter,
        AddBackendParameterRequest
      >({
        method: 'PUT',
        endpoint: '/parameters/' + params.type + '/',
        body: {
          value: params.value,
        },
      })
      return data
    },

    onSuccess: () => {
      props.refetch()
      setIsInputChanged(false)
    },
  })
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget) // Collect form data
    const value = parseInt(formData.get('value') as string, 10) // Extract and parse the 'value' field
    updateBackendParameter({
      type: props.type,
      value,
    })
  }
  return (
    <form onSubmit={handleAdd} className=''>
      <Label htmlFor='number' className='flex items-start text-sm'>
        {translation[props.type].text}
      </Label>
      <div className='mt-4 grid grid-cols-6 gap-x-2'>
        <Input
          onChange={() => !isInputChanged && setIsInputChanged(true)}
          type='number'
          defaultValue={props.value}
          name='value'
          className='col-span-5'
          required
        />
        <Button
          disabled={!isInputChanged}
          loading={isPending}
          type='submit'
          variant={isInputChanged ? 'default' : 'outline'}
          className='col-span-1 text-xs'
          size={'icon'}
        >
          {isInputChanged ? <Check /> : <Minus />}
        </Button>
      </div>
    </form>
  )
}
