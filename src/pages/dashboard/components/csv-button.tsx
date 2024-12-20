import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'
import { RecordData } from '../responses/statistics'
import { useState } from 'react'
import { ButtonProps } from '@/lib/types/button-props'

const generateCSV = (data: RecordData[]) => {
  // Sample data to be converted into CSV

  // Generate CSV content
  const headers = Object.keys(data[0]).join(';') + '\n'
  const rows = data
    .map((row) =>
      Object.values({
        dt: row?.dt ?? 'no data',
        temp: row?.temp ?? 'no data',
        hum: row?.hum ?? 'no data',
      }).join(';')
    )
    .join('\n')
  const csvContent = headers + rows

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'data.csv'
  link.click()

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

function CSVButton(props: ButtonProps & { data?: RecordData[] | null }) {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <Button
      onClick={() => {
        setIsLoading(true)
        props?.data && generateCSV(props.data)
        setIsLoading(false)
      }}
      loading={isLoading}
      {...props}
      size={'icon'}
      variant={'outline'}
    >
      <DownloadIcon size={16} />
    </Button>
  )
}

export default CSVButton
