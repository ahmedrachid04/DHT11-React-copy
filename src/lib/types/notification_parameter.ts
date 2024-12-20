export type NotificationParameter = {
  id: number
  mainResource: string
  type: NotificationParameterType
  created_at: string
}

export type AddNotificationParameterRequest = {
  mainResource: string
  type: NotificationParameterType
}

export type NotificationParameterType =
  | 'EMAIL'
  | 'WHATSAPP'
  | 'SMS'
  | 'TELEGRAM'
