import { CheckCircledIcon, StopwatchIcon } from '@radix-ui/react-icons'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: false,
    label: 'Fermé',
    icon: StopwatchIcon,
  },
  {
    value: true,
    label: 'Ouvert',
    icon: CheckCircledIcon,
  },
]
