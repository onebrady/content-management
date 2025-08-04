import { useState, useEffect } from 'react';

export function useCompanyLogo() {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          if (settings.companyLogo && settings.companyLogo.trim()) {
            setCompanyLogo(settings.companyLogo);
          }
        } else {
          setError('Failed to fetch company logo');
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
        setError('Error fetching company logo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyLogo();
  }, []);

  return {
    companyLogo,
    isLoading,
    error,
    hasLogo: !!companyLogo,
  };
}
