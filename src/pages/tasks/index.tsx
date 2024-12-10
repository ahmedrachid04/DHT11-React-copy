import { Layout } from '@/components/custom/layout.tsx'

import { DataTable } from './components/data-table'
import { columns } from './components/columns.tsx'
import { UserNav } from '@/components/user-nav.tsx'
import { useQuery } from '@tanstack/react-query'
import { getIncident } from '@/lib/utils.ts'

export default function Tasks() {
  const { data, isFetching } = useQuery({
    queryKey: ['get-incidents'],
    queryFn: getIncident,
    staleTime: 1000 * 30,
  })
  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header sticky>
        <div className='flex w-full items-center justify-end'>
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Welcome back!</h2>
            <p className='text-muted-foreground'>
              Here&apos;s the incident list
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable
            isFetching={isFetching}
            data={(data ?? []).map((i) => {
              return { ...i, closed_by: i.closed_by?.username ?? null }
            })}
            //@ts-ignore
            columns={columns}
          />
        </div>
      </Layout.Body>
    </Layout>
  )
}
