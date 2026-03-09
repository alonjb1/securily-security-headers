import { useState } from 'react';

interface ScanFormProps {
  onScan: (url: string, scanType: 'web' | 'app' | 'api') => void;
  isScanning: boolean;
}

export function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [url, setUrl] = useState('');
  const [scanType, setScanType] = useState<'web' | 'app' | 'api'>('web');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScan(url, scanType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Enter URL to Scan
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={isScanning}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scan Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="web"
                checked={scanType === 'web'}
                onChange={(e) => setScanType(e.target.value as 'web')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                disabled={isScanning}
              />
              <span className="ml-2 text-sm text-gray-700">Web Application</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="app"
                checked={scanType === 'app'}
                onChange={(e) => setScanType(e.target.value as 'app')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                disabled={isScanning}
              />
              <span className="ml-2 text-sm text-gray-700">Mobile/Desktop App</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="api"
                checked={scanType === 'api'}
                onChange={(e) => setScanType(e.target.value as 'api')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                disabled={isScanning}
              />
              <span className="ml-2 text-sm text-gray-700">API Endpoint</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isScanning || !url.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isScanning ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning...
            </span>
          ) : (
            'Scan Security Headers'
          )}
        </button>
      </div>
    </form>
  );
}
