import {
  IconCash,

  IconUserShield,
} from '@tabler/icons-react'

export const callTypes = new Map<boolean, string>([
  [true, 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [false, 'bg-neutral-300/40 border-neutral-300'],
  
  
])

export const userTypes = [
  
  {
    label: 'Admin',
    value: true,
    icon: IconUserShield,
  },
  
  {
    label: 'Operateur',
    value: false,
    icon: IconCash,
  },
] as const
