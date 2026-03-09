import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ScanForm } from './components/ScanForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ScanHistory } from './components/ScanHistory';
import type { HeaderResult, Scan } from './types';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [scanHistory, setScanHistory] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScanHistory(data || []);
    } catch (err) {
      console.error('Error loading scan history:', err);
    }
  };

  const handleScan = async (url: string, scanType: 'web' | 'app' | 'api') => {
    setIsScanning(true);
    setError(null);
    setCurrentScan(null);

    try {
      const { data: scan, error: insertError } = await supabase
        .from('scans')
        .insert({
          url,
          scan_type: scanType,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/security-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          url,
          scanType,
          scanId: scan.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const { data: updatedScan, error: fetchError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scan.id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentScan(updatedScan);
      loadScanHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during scanning');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectScan = (scan: Scan) => {
    setCurrentScan(scan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Security Headers Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze and troubleshoot security headers in your web applications, mobile apps, and APIs
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <ScanForm onScan={handleScan} isScanning={isScanning} />

          {error && (
            <div className="w-full max-w-3xl bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <ScanHistory scans={scanHistory} onSelectScan={handleSelectScan} />

          {currentScan?.results && (
            <ResultsDisplay
              results={currentScan.results as HeaderResult[]}
              metadata={currentScan.metadata}
              url={currentScan.url}
            />
          )}
        </div>

        <footer className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Powered by{' '}
            <a href="https://securily.com" className="text-blue-600 hover:text-blue-800 font-medium">
              Securily
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
