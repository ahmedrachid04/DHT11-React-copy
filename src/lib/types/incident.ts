import { UserInfo } from './login-response'

export type Incident = {
  id: number
  closed_by: UserInfo | null
  title: string
  description: string | null
  temperature: number
  humidity: number
  reported_at: string
  resolved: boolean
  updated_at: string
}
