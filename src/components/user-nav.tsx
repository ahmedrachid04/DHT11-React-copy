import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/custom/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { useTranslations } from 'use-intl'
import { useAuth } from '@/hooks/use-auth'

export function UserNav() {
  const t = useTranslations('userNav')
  const { user, logout } = useAuth()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{user?.username.slice(0, 3)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='min-w-50' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user?.username}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={logout}>{t('log_out')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
