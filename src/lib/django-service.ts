type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
import Cookies from 'js-cookie'
import { apiUrl } from './utils'

export async function djangoRequest<RES, REQ = undefined>({
  endpoint,
  method,
  searchParams,
  body,
  headers,
  signal,
  isDataPure,
}: {
  endpoint: string
  method: HttpMethod
  searchParams?: { [key: string]: string | number | null }
  body?: REQ extends undefined ? never : REQ // Make body required when B is declared
  headers?: { [key: string]: string }
  signal?: AbortSignal // Add signal parameter for AbortController
  isDataPure?: boolean
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
        method === 'POST' || method === 'PATCH' || method === 'PUT'
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

    if (res.status < 200 || res.status >= 400) {
      const {
        error,
        detail,
      }: { error?: string | null; detail?: string | null } = await res.json()

      if (detail) {
        throw new Error(detail)
      } else if (error) {
        throw new Error(error)
      } else {
        throw new Error('Request failed')
      }
    } else {
      if (method == 'DELETE') {
        return { data: null, error: null, status: res.status }
      }
      let data: RES | null = null
      if (isDataPure) {
        data = await res.json()
      } else {
        const result: { data: RES | null } = await res.json()
        data = result.data
      }
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
