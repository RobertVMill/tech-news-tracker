'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navigation from '@/components/Navigation'

interface EarningsCall {
  company: string
  date: string
  time: string
  fiscalQuarter: string
  fiscalYear: string
  expectedRevenue?: string
  expectedEPS?: string
  callLink?: string
}

export default function EarningsCalendar() {
  const [upcoming, setUpcoming] = useState<EarningsCall[]>([])
  const [recent, setRecent] = useState<EarningsCall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/earnings-calendar')
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.error || 'Failed to fetch earnings data')
        
        setUpcoming(data.upcoming)
        setRecent(data.recent)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [])

  const EarningsCard = ({ call }: { call: EarningsCall }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{call.company}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {format(new Date(call.date), 'MMM d, yyyy')} • {call.time}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Fiscal Period</p>
            <p className="font-medium">{call.fiscalQuarter} {call.fiscalYear}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected Revenue</p>
            <p className="font-medium">{call.expectedRevenue || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected EPS</p>
            <p className="font-medium">{call.expectedEPS || 'N/A'}</p>
          </div>
          <div>
            {call.callLink && (
              <a
                href={call.callLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Details →
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const content = (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Earnings Calendar</h1>
      
      {loading ? (
        <p>Loading earnings data...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent ({recent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <p>No upcoming earnings calls scheduled.</p>
            ) : (
              upcoming.map((call, index) => (
                <EarningsCard key={`${call.company}-${index}`} call={call} />
              ))
            )}
          </TabsContent>

          <TabsContent value="recent">
            {recent.length === 0 ? (
              <p>No recent earnings calls.</p>
            ) : (
              recent.map((call, index) => (
                <EarningsCard key={`${call.company}-${index}`} call={call} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navigation />
      {content}
    </div>
  )
} 