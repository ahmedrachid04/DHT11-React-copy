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

export type IncidentNote = {
  id: number
  note: string
  created_at: string
  updated_at: string
  user_id: UserInfo | null
  incident: number
}
