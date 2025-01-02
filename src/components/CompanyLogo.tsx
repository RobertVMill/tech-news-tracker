'use client'

import { useState } from 'react'

interface CompanyLogoProps {
  company: string
  size?: number
  className?: string
}

const COMPANY_DOMAINS = {
  'Google': 'google',
  'Apple': 'apple',
  'Microsoft': 'microsoft',
  'Meta': 'meta',
  'Amazon': 'amazon',
  'OpenAI': 'openai',
  'NVIDIA': 'nvidia',
  'Tesla': 'tesla'
}

export default function CompanyLogo({ company, size = 32, className = '' }: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false)
  const domain = COMPANY_DOMAINS[company as keyof typeof COMPANY_DOMAINS]

  if (imageError || !domain) {
    // Fallback to company initial if image fails to load
    return (
      <div 
        className={`w-${size} h-${size} rounded-full bg-[color:var(--hover)] flex items-center justify-center text-sm ${className}`}
      >
        {company[0]}
      </div>
    )
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}.com`}
      alt={`${company} logo`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setImageError(true)}
    />
  )
} 