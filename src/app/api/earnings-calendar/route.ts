import { NextResponse } from 'next/server'

// Interface for earnings call data
interface EarningsCall {
  company: string
  date: string
  time: string // 'Pre-market' | 'After-hours'
  fiscalQuarter: string
  fiscalYear: string
  expectedRevenue?: string
  expectedEPS?: string
  callLink?: string
}

// Mock data - In a real app, this would come from a financial data API
const mockEarningsCalls: EarningsCall[] = [
  {
    company: 'Apple Inc.',
    date: '2024-05-02',
    time: 'After-hours',
    fiscalQuarter: 'Q2',
    fiscalYear: '2024',
    expectedRevenue: '$96.5B',
    expectedEPS: '$1.51',
    callLink: 'https://investor.apple.com'
  },
  {
    company: 'Microsoft',
    date: '2024-04-25',
    time: 'After-hours',
    fiscalQuarter: 'Q3',
    fiscalYear: '2024',
    expectedRevenue: '$60.8B',
    expectedEPS: '$2.23',
    callLink: 'https://microsoft.com/investors'
  },
  {
    company: 'Meta',
    date: '2024-04-24',
    time: 'After-hours',
    fiscalQuarter: 'Q1',
    fiscalYear: '2024',
    expectedRevenue: '$36.2B',
    expectedEPS: '$4.32',
    callLink: 'https://investor.fb.com'
  },
  {
    company: 'Alphabet',
    date: '2024-04-30',
    time: 'After-hours',
    fiscalQuarter: 'Q1',
    fiscalYear: '2024',
    expectedRevenue: '$78.1B',
    expectedEPS: '$1.51',
    callLink: 'https://abc.xyz/investor'
  },
  {
    company: 'Amazon',
    date: '2024-04-30',
    time: 'After-hours',
    fiscalQuarter: 'Q1',
    fiscalYear: '2024',
    expectedRevenue: '$142.5B',
    expectedEPS: '$0.83',
    callLink: 'https://ir.aboutamazon.com'
  }
]

export async function GET() {
  try {
    // Sort earnings calls by date
    const sortedCalls = [...mockEarningsCalls].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    // Split into upcoming and recent calls
    const now = new Date()
    const upcoming = sortedCalls.filter(call => new Date(call.date) >= now)
    const recent = sortedCalls.filter(call => new Date(call.date) < now)

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