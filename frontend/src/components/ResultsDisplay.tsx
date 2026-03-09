import type { HeaderResult, ScanMetadata } from '../types';

interface ResultsDisplayProps {
  results: HeaderResult[];
  metadata?: ScanMetadata;
  url: string;
}

export function ResultsDisplay({ results, url }: ResultsDisplayProps) {
  const passedCount = results.filter(r => r.status === 'PASS').length;
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  const scorePercentage = Math.round((passedCount / results.length) * 100);

  const getGrade = (percentage: number): { grade: string; color: string } => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const { grade, color } = getGrade(scorePercentage);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const highPriorityIssues = results.filter(r => r.status === 'FAIL' && r.severity === 'High');

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Results</h2>
            <p className="text-gray-600 break-all">{url}</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${color}`}>{grade}</div>
            <div className="text-sm text-gray-500 mt-1">{scorePercentage}% Secure</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{results.length}</div>
            <div className="text-sm text-gray-600">Headers Checked</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{passedCount}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>

      {highPriorityIssues.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            High Priority Issues ({highPriorityIssues.length})
          </h3>
          <p className="text-sm text-red-700 mb-4">
            These security headers are critical and should be implemented immediately.
          </p>
          <div className="space-y-2">
            {highPriorityIssues.map((result, idx) => (
              <div key={idx} className="text-sm font-medium text-red-800">
                {result.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Detailed Results</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {results.map((result, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{result.name}</h4>
                    {result.severity && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(result.severity)}`}>
                        {result.severity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === 'PASS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status === 'PASS' ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                </div>
              </div>

              {result.value && result.value !== 'Not Found' && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Current Value:</div>
                  <code className="block bg-gray-100 px-3 py-2 rounded text-sm text-gray-800 break-all">
                    {result.value}
                  </code>
                </div>
              )}

              {result.reason && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Why This Matters:</div>
                  <p className="text-sm text-gray-600">{result.reason}</p>
                </div>
              )}

              {result.status === 'FAIL' && result.remediation && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">How to Fix:</div>
                  <p className="text-sm text-gray-600">{result.remediation}</p>
                </div>
              )}

              {result.values && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Valid Values:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.values.split(', ').map((val, i) => (
                      <code key={i} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                        {val}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
