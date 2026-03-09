import type { Scan } from '../types';

interface ScanHistoryProps {
  scans: Scan[];
  onSelectScan: (scan: Scan) => void;
}

export function ScanHistory({ scans, onSelectScan }: ScanHistoryProps) {
  if (scans.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Scans</h3>
        <div className="space-y-2">
          {scans.slice(0, 5).map((scan) => (
            <button
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {scan.url}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      scan.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : scan.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scan.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(scan.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {scan.metadata && (
                  <div className="ml-4 text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {scan.metadata.headersPassed}/{scan.metadata.headersScanned}
                    </div>
                    <div className="text-xs text-gray-500">passed</div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
