import { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { djangoRequest } from '@/lib/django-service'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { LoginRequest, LoginResponse } from '@/lib/types/login-response'
import Cookies from 'js-cookie'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { setUser, setIsAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { mutate, isPending: isLoading } = useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ email, password }: LoginRequest) => {
      const { data } = await djangoRequest<LoginResponse, LoginRequest>({
        endpoint: '/auth/login/',
        method: 'POST',
        body: { email, password },
      })
      return data
    },
    onSuccess: (data: LoginResponse | null) => {
      if (data?.user && setUser && setIsAuthenticated) {
        Cookies.set('auth', data.access, {
          expires: 3,
        })
        Cookies.set('refresh', data.refresh)

        setUser(data.user)
        setIsAuthenticated(true)
        navigate('/')
      }
    },
    onError: (error) => {
      console.log('error in the form', error.message)
      form.setError('password', { message: error.message })
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate({
      email: data.email,
      password: data.password,
    })
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='adresse@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-4'>
                  <FormControl>
                    <PasswordInput
                      className='my-3'
                      placeholder='********'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' loading={isLoading}>
              Connexion
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
