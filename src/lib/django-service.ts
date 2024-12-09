type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
import Cookies from 'js-cookie'
import { apiUrl } from './utils'

export async function djangoRequest<RES, REQ = undefined>({
  endpoint,
  method,
  searchParams,
  body,
  headers,
  signal,
}: {
  endpoint: string
  method: HttpMethod
  searchParams?: { [key: string]: string | number | null }
  body?: REQ extends undefined ? never : REQ // Make body required when B is declared
  headers?: { [key: string]: string }
  signal?: AbortSignal // Add signal parameter for AbortController
}): Promise<{
  data: RES | null
  error: string | null
  status: number
}> {
  try {
    const url = new URL(apiUrl + endpoint)
    const headersList = { ...headers }
    if (Cookies.get('auth')) {
      headersList['Authorization'] = 'Bearer ' + Cookies.get('auth')
    }
    Object.entries(searchParams ?? {}).forEach(([key, value]) => {
      value && url.searchParams.append(key, value.toString())
    })

    const controller = new AbortController()
    const options: RequestInit = {
      method: method,
      body: JSON.stringify(body),
      //add Json application type if the method is post
      headers:
        method === 'POST'
          ? {
              'Content-Type': 'application/json',
              ...headersList,
            }
          : headersList,
      signal: signal ?? controller.signal, // Use provided signal or create a new one
    }

    const res = await fetch(url.toString(), options)

    // Check if the request was aborted
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    if (!res.ok) {
      console.log('response is not ok')
      const {
        error,
        detail,
      }: { error?: string | null; detail?: string | null } = await res.json()
      console.log('error:', error)
      console.log('detail:', detail)

      if (detail) {
        throw new Error(detail)
      } else if (error) {
        throw new Error(error)
      } else {
        throw new Error('Request failed')
      }
    } else {
      console.log(`response of type ${method} is ok`)

      const { data }: { data: RES | null } = await res.json()
      return { data, error: null, status: res.status }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Request failed : ${error.message}`)
    } else {
      throw new Error(`Request failed `)
    }
  }
}
