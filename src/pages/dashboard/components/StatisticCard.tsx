import { Button } from '@/components/custom/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatisticCardProps {
  title: string
  icon: React.ReactNode
  value?: string | number
  trend?: string | number | null
  trendSuffix?: string
  isLoading?: boolean
  trendClass?: string
}

export default function StatisticCard({
  title,
  icon,
  value,
  trend,
  trendSuffix = '',
  isLoading = false,
  trendClass = '',
}: StatisticCardProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>
          {isLoading ? (
            <Button
              className='py-6'
              variant={'ghost'}
              loading
              size={'icon'}
            ></Button>
          ) : (
            value
          )}
        </div>
        {trend !== undefined && (
          <p className={`text-xs ${trendClass}`}>
            {parseFloat(String(trend)) > 0 ? '+' : ''}
            {trend}
            {trendSuffix}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
