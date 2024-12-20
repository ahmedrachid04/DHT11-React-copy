import { Code2Icon } from 'lucide-react'
import twilioPNG from '@/assets/logo/twilio.png'
import emailPNG from '@/assets/logo/email.png'
import telegramPNG from '@/assets/logo/telegram.png'
import whatsappPNG from '@/assets/logo/whatsapp.png'
import ManageDataDialog from '@/components/manage-data-dialog'

export const apps = [
  {
    name: 'Telegram',
    logo: <img src={telegramPNG} height={24} width={24} />,
    desc: 'Gérez les utilisateurs des notifications Telegram.',
    modal: (
      <ManageDataDialog
        text={{
          title: 'Telegram',
          desc: 'Gérez les utilisateurs recevant des notifications Telegram.',
        }}
        columnsName={{
          mainResource: 'Utilisateur',
          user: 'Nom',
        }}
        type='TELEGRAM'
      />
    ),
  },
  {
    name: 'Numéro de SMS',
    logo: <img src={twilioPNG} height={24} width={24} />,
    desc: 'Gérez les utilisateurs des notifications SMS.',
    modal: (
      <ManageDataDialog
        text={{
          title: 'Numéro de SMS',
          desc: 'Gérez les utilisateurs recevant des notifications SMS.',
        }}
        columnsName={{
          mainResource: 'Numéro',
          user: 'Nom',
        }}
        type='SMS'
      />
    ),
  },
  // {
  //   name: 'Utilisateurs',
  //   logo: <UserIcon />,
  //   desc: 'Gérez les utilisateurs pour toutes les notifications.',
  // },
  
  {
    name: 'Emails',
    logo: <img src={emailPNG} height={24} width={24} />,
    desc: 'Gérez les utilisateurs des notifications par email.',
    modal: (
      <ManageDataDialog
        text={{
          title: 'Emails',
          desc: 'Gérez les utilisateurs recevant des notifications par email.',
        }}
        columnsName={{
          mainResource: 'Email',
          user: 'Nom',
        }}
        type='EMAIL'
      />
    ),
  },
  {
    name: 'Numéro du WhatsApp',
    logo: <img src={whatsappPNG} height={24} width={24} />,
    desc: 'Gérez les utilisateurs des notifications WhatsApp.',
    modal: (
      <ManageDataDialog
        text={{
          title: 'Numéro du WhatsApp',
          desc: 'Gérez les utilisateurs recevant des notifications via WhatsApp.',
        }}
        columnsName={{
          mainResource: 'Numéro',
          user: 'Nom',
        }}
        type='WHATSAPP'
      />
    ),
  },
  {
    name: 'Paramètres du Backend',
    logo: <Code2Icon />,
    desc: 'Gérez les paramètres pour les notifications backend.',
  },
]
