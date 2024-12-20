'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'

import { SelectDropdown } from '@/components/select-dropdown.tsx'
import { userTypes } from '../data/data'
import {
  AddUserInfo,
  UpdateUserInfo,
  UserInfo,
} from '@/lib/types/login-response'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { djangoRequest } from '@/lib/django-service'
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Le nom d'utilisateur est requis." }),

    email: z
      .string()
      .min(1, { message: "L'email est requis." })
      .email({ message: "L'email est invalide." }),
    password: z.string().transform((pwd) => pwd.trim()),

    confirmPassword: z.string().transform((pwd) => pwd.trim()),

    role: z.string(),
    isEdit: z.boolean(),
  })
  .superRefine(({ isEdit, password, confirmPassword }, ctx) => {
    if (!isEdit || (isEdit && password !== '')) {
      if (password === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe est requis.',
          path: ['password'],
        })
      }

      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins 8 caractères.',
          path: ['password'],
        })
      }

      if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Le mot de passe doit contenir au moins une lettre minuscule.',
          path: ['password'],
        })
      }

      if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le mot de passe doit contenir au moins un chiffre.',
          path: ['password'],
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Les mots de passe ne correspondent pas.',
          path: ['confirmPassword'],
        })
      }
    }
  })

type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: UserInfo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          email: currentRow.email,
          password: '',
          confirmPassword: '',
          isEdit,
          role: currentRow.is_staff ? 'true' : 'false',
          username: currentRow.username,
        }
      : {
          username: '',
          email: '',
          role: '',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })
  const { mutate: UpdateUser, isPending } = useMutation({
    mutationFn: async (user: UserForm) => {
      if (currentRow?.id && user.isEdit) {
        const data = await djangoRequest<UserInfo, UpdateUserInfo>({
          method: 'PATCH',
          endpoint: '/auth/users/' + currentRow.id + '/',
          body: {
            email: user.email,
            username: user.username,
            is_staff: user.role === 'true' ? true : false,
          },
        })
        return data
      } else {
        const data = await djangoRequest<UserInfo, AddUserInfo>({
          method: 'POST',
          endpoint: '/auth/register/',
          body: {
            email: user.email,
            username: user.username,
            password: user.password,
            is_staff: user.role === 'true' ? true : false,
          },
        })
        return data
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-users'],
      })
      onOpenChange(false)
    },
    onError: (error) => {
      form.setError('root', {
        message: error.message,
      })
    },
  })
  const onSubmit = (values: UserForm) => {
    form.reset()
    UpdateUser(values)
  }
  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>
            {isEdit
              ? "Modifier l'utilisateur"
              : 'Ajouter un nouvel utilisateur'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour l'utilisateur ici. "
              : 'Créez un nouvel utilisateur ici. '}
            Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='user-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 p-0.5'
          >
            <FormField
              disabled={isPending}
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-right'>
                    Nom d'utilisateur
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='John Doe'
                      className='col-span-4'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              disabled={isPending}
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-right'>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='john.doe@gmail.com'
                      className='col-span-4'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              disabled={isPending}
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-right'>Rôle</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Sélectionnez un rôle'
                    className='col-span-4'
                    items={userTypes.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            {!isEdit && (
              <FormField
                disabled={isPending}
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      Mot de passe
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='ex., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            )}
            {!isEdit && (
              <FormField
                disabled={isPending}
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      Confirmer le mot de passe
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='ex., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>

        <DialogFooter className='flex w-full items-center justify-between'>
          {form.formState.errors.root && (
            <p className='text-start text-xs text-red-600'>
              {form.formState.errors.root.message}
            </p>
          )}
          <Button loading={isPending} type='submit' form='user-form'>
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
