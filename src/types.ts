export interface HeaderResult {
  url: string;
  name: string;
  value: string;
  severity: string;
  reason: string;
  remediation: string;
  values: string;
  status: 'PASS' | 'FAIL';
  statusCode: number;
}

export interface ScanMetadata {
  timestamp: string;
  headersScanned: number;
  headersPassed: number;
  headersFailed: number;
}

export interface Scan {
  id: string;
  url: string;
  scan_type: 'web' | 'app' | 'api';
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: HeaderResult[];
  ai_insights?: any;
  metadata?: ScanMetadata;
  created_at: string;
  updated_at: string;
}
