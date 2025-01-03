import { NextResponse } from 'next/server'

interface AlphaVantageEarningsCall {
  symbol: string
  name: string
  reportDate: string
  fiscalDateEnding: string
  estimate: string
  currency: string
}

interface FormattedEarningsCall {
  company: string
  date: string
  time: string
  fiscalQuarter: string
  fiscalYear: string
  expectedEPS?: string
  callLink?: string
}

// Interface for CSV parsing
interface EarningsRecord {
  symbol: string
  name: string
  reportDate: string
  fiscalDateEnding: string
  estimate: string
  currency: string
  [key: string]: string // For any additional fields in the CSV
}

function getFiscalQuarter(date: string): { quarter: string; year: string } {
  const earningsDate = new Date(date)
  const month = earningsDate.getMonth()
  const year = earningsDate.getFullYear()
  
  // Determine fiscal quarter based on month
  let quarter
  if (month <= 2) quarter = 'Q1'
  else if (month <= 5) quarter = 'Q2'
  else if (month <= 8) quarter = 'Q3'
  else quarter = 'Q4'
  
  return { quarter, year: year.toString() }
}

async function fetchEarningsData(horizon: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('Alpha Vantage API key is not configured')
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=${horizon}&apikey=${apiKey}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch data from Alpha Vantage')
  }

  // The response is CSV, so we need to parse it
  const text = await response.text()
  const lines = text.split('\n')
  const headers = lines[0].split(',')
  
  const data: AlphaVantageEarningsCall[] = lines.slice(1)
    .filter(line => line.trim()) // Remove empty lines
    .map(line => {
      const values = line.split(',')
      return headers.reduce<EarningsRecord>((obj, header, index) => {
        obj[header] = values[index] || ''
        return obj
      }, {} as EarningsRecord)
    })

  return data
}

export async function GET() {
  try {
    // Get upcoming earnings (next 3 months)
    const upcomingData = await fetchEarningsData('3month')
    
    // Format the earnings calls
    const formatEarningsCall = (call: AlphaVantageEarningsCall): FormattedEarningsCall => {
      const { quarter, year } = getFiscalQuarter(call.fiscalDateEnding)
      return {
        company: `${call.name} (${call.symbol})`,
        date: call.reportDate,
        time: 'TBA', // Alpha Vantage doesn't provide the exact time
        fiscalQuarter: quarter,
        fiscalYear: year,
        expectedEPS: call.estimate ? `$${Number(call.estimate).toFixed(2)}` : undefined,
        callLink: `https://www.marketwatch.com/investing/stock/${call.symbol}`
      }
    }

    const now = new Date()
    const upcoming = upcomingData
      .filter(call => new Date(call.reportDate) >= now)
      .map(formatEarningsCall)
    
    const recent = upcomingData
      .filter(call => {
        const reportDate = new Date(call.reportDate)
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)
        return reportDate < now && reportDate >= sevenDaysAgo
      })
      .map(formatEarningsCall)

    return NextResponse.json({
      upcoming,
      recent
    })
  } catch (error) {
    console.error('Error fetching earnings calendar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings calendar' },
      { status: 500 }
    )
  }
} 