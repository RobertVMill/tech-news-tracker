'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import CompanyLogo from '@/components/CompanyLogo';

const TECH_COMPANIES = [
  { name: 'Google', logo: 'G' },
  { name: 'Apple', logo: 'A' },
  { name: 'Microsoft', logo: 'M' },
  { name: 'Meta', logo: 'M' },
  { name: 'Amazon', logo: 'A' },
  { name: 'OpenAI', logo: 'O' },
  { name: 'NVIDIA', logo: 'N' },
  { name: 'Tesla', logo: 'T' },
];

export default function CompanyList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCompany = searchParams.get('company');

  const handleCompanySelect = (company: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (company) {
      params.set('company', company.toLowerCase());
    } else {
      params.delete('company');
    }
    router.push(`/companies?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="font-semibold mb-4">Companies</h2>
      <div className="space-y-2">
        <button
          onClick={() => handleCompanySelect(null)}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            !selectedCompany ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          All Companies
        </button>
        {TECH_COMPANIES.map((company) => (
          <button
            key={company.name}
            onClick={() => handleCompanySelect(company.name)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedCompany === company.name.toLowerCase() ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CompanyLogo company={company.name} size={24} />
              <span>{company.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 