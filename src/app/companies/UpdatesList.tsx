'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CompanyLogo from '@/components/CompanyLogo';

interface CompanyUpdate {
  title: string;
  description: string;
  url: string;
  published_at: string;
  author: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    // Format the date in a consistent way that works on both server and client
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  } catch {
    return 'Unknown date';
  }
}

export default function UpdatesList() {
  const searchParams = useSearchParams();
  const selectedCompany = searchParams.get('company');
  const [updates, setUpdates] = useState<CompanyUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        setIsLoading(true);
        setError(null);

        if (selectedCompany) {
          const response = await fetch(`/api/company-updates/${selectedCompany}`);
          const data = await response.json();

          if (response.ok) {
            setUpdates(data.updates);
          } else {
            setError(data.error || 'Failed to fetch updates');
            setUpdates([]);
          }
        } else {
          setUpdates([]);
        }
      } catch (err) {
        setError(`Failed to fetch updates: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUpdates();
  }, [selectedCompany]);

  if (isLoading) {
    return <div className="text-center py-8">Loading updates...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Error: {error}
      </div>
    );
  }

  if (!selectedCompany || updates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No updates available.</p>
        <p className="text-sm text-gray-500 mt-2">
          Select a company to see their latest updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <div
          key={index}
          className="p-4 bg-gray-700 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-2">
            <CompanyLogo company={selectedCompany} size={32} />
            <div>
              <h3 className="font-medium">{update.title}</h3>
              <p className="text-sm text-gray-400">
                {selectedCompany} • {formatDate(update.published_at)} • {update.author}
              </p>
            </div>
          </div>
          <p className="text-sm ml-11 mb-3">{update.description}</p>
          {update.url && (
            <div className="ml-11">
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                Read more →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 