import { IconChecklist, IconLayoutDashboard } from '@tabler/icons-react'
import { SettingsIcon, Users } from 'lucide-react'

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const sidelinks: SideLink[] = [
  {
    title: 'Dashboard',
    label: '',
    href: '/',
    icon: <IconLayoutDashboard size={18} />,
  },
  {
    title: 'Incidents',
    label: '',
    href: '/incidents',
    icon: <IconChecklist size={18} />,
  },
  
]

export const adminSideLinks: SideLink[] = [
  {
    title: 'Paramètres',
    label: '',
    href: '/settings',
    icon: <SettingsIcon size={18} />,
  },
  {
    title: 'users',
    label: '',
    href: '/users',
    icon: <Users size={18} />,
  },
]
