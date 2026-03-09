import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScanRequest {
  url: string;
  scanType?: 'web' | 'app' | 'api';
  authorization?: string;
}

interface HeaderResult {
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

const webSecurityHeaders = [
  'Strict-Transport-Security',
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'X-XSS-Protection',
  'Referrer-Policy',
  'Permissions-Policy',
  'Cross-Origin-Embedder-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
  'Expect-CT',
  'Feature-Policy',
];

const apiSecurityHeaders = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'Strict-Transport-Security',
  'X-Frame-Options',
  'Access-Control-Allow-Origin',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Credentials',
  'Access-Control-Expose-Headers',
  'Access-Control-Max-Age',
  'Cross-Origin-Resource-Policy',
];

const headerConfigurations = [
  {
    name: 'Strict-Transport-Security',
    severity: 'High',
    reason: 'This header helps protect users from man-in-the-middle attacks and cookie hijacking by telling the browser to only communicate with the server over a secure HTTPS connection.',
    remediation: 'To enable this header, add the following to your HTTP response headers: Strict-Transport-Security: max-age=<expire-time>; includeSubDomains; preload. Replace <expire-time> with the number of seconds you wish the browser to remember that a site is only to be accessed using HTTPS.',
    values: 'max-age, includeSubDomains, preload',
  },
  {
    name: 'Content-Security-Policy',
    severity: 'High',
    reason: 'Content Security Policies are used to restrict the resources a browser can load. This helps to prevent cross-site scripting (XSS) attacks, by allowing web developers to specify which domains are trusted and which are not.',
    remediation: '1. Identify the resources that your application requires. 2. Configure the Content-Security-Policy header to specify which domains are allowed to host the necessary resources. 3. Test the header to verify that it works as expected.',
    values: 'none, self, unsafe-inline, unsafe-eval, strict-dynamic, report-sample, upgrade-insecure-requests, report-uri',
  },
  {
    name: 'X-Content-Type-Options',
    severity: 'Medium',
    reason: 'The X-Content-Type-Options header is used to prevent browsers from interpreting files as something other than declared by the content type.',
    remediation: 'Add the following code to the web server configuration file: Header set X-Content-Type-Options: nosniff',
    values: 'nosniff',
  },
  {
    name: 'X-Frame-Options',
    severity: 'High',
    reason: 'X-Frame-Options is a security header that can be used to prevent clickjacking attacks by preventing a page from being framed in another page.',
    remediation: 'Add the X-Frame-Options header to the response header of your website with the value of DENY or SAMEORIGIN.',
    values: 'DENY, SAMEORIGIN, ALLOW-FROM',
  },
  {
    name: 'X-XSS-Protection',
    severity: 'Low',
    reason: 'X-XSS-Protection is a LEGACY header that was used to enable the XSS Auditor in older browsers. This header is now DEPRECATED.',
    remediation: 'DEPRECATED: Do not rely on this header for security. Instead, implement a strong Content-Security-Policy.',
    values: '0, 1, mode=block',
  },
  {
    name: 'Referrer-Policy',
    severity: 'High',
    reason: 'The Referrer-Policy header allows websites to control the behavior of the Referer header.',
    remediation: "Set the Referrer-Policy header to 'no-referrer' or 'same-origin'.",
    values: 'no-referrer, no-referrer-when-downgrade, same-origin, origin, strict-origin',
  },
  {
    name: 'Permissions-Policy',
    severity: 'Medium',
    reason: 'The Permissions-Policy header allows websites to control which features and APIs can be used in the browser.',
    remediation: 'Configure the Permissions-Policy header to restrict access to sensitive browser features.',
    values: 'geolocation, microphone, camera, payment, usb',
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    severity: 'Medium',
    reason: 'COEP prevents a document from loading any cross-origin resources that do not explicitly grant permission.',
    remediation: "Set Cross-Origin-Embedder-Policy to 'require-corp' to enable cross-origin isolation.",
    values: 'require-corp, credentialless',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    severity: 'Medium',
    reason: 'COOP allows you to ensure a top-level document does not share a browsing context group with cross-origin documents.',
    remediation: "Set Cross-Origin-Opener-Policy to 'same-origin' for maximum isolation.",
    values: 'same-origin, same-origin-allow-popups, unsafe-none',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    severity: 'Medium',
    reason: 'CORP allows websites to prevent certain resources from being loaded by other origins.',
    remediation: "Set Cross-Origin-Resource-Policy to 'same-origin' or 'same-site' as appropriate.",
    values: 'same-origin, same-site, cross-origin',
  },
  {
    name: 'Expect-CT',
    severity: 'Low',
    reason: 'DEPRECATED: This header is no longer recommended as Certificate Transparency is now enforced by browsers.',
    remediation: 'This header is deprecated and can be removed.',
    values: 'max-age, enforce, report-uri',
  },
  {
    name: 'Feature-Policy',
    severity: 'Low',
    reason: 'DEPRECATED: This header has been replaced by Permissions-Policy.',
    remediation: 'Use Permissions-Policy instead of Feature-Policy.',
    values: 'geolocation, microphone, camera',
  },
  {
    name: 'Access-Control-Allow-Origin',
    severity: 'High',
    reason: 'This header specifies which origins are allowed to access the resource.',
    remediation: 'Configure CORS properly by specifying allowed origins instead of using wildcard (*) in production.',
    values: '*, specific-origin',
  },
  {
    name: 'Access-Control-Allow-Methods',
    severity: 'Medium',
    reason: 'Specifies which HTTP methods are allowed when accessing the resource.',
    remediation: 'Only allow necessary HTTP methods (GET, POST, etc.).',
    values: 'GET, POST, PUT, DELETE, OPTIONS',
  },
  {
    name: 'Access-Control-Allow-Headers',
    severity: 'Medium',
    reason: 'Specifies which headers are allowed in requests.',
    remediation: 'Only allow necessary headers in your CORS configuration.',
    values: 'Content-Type, Authorization',
  },
  {
    name: 'Access-Control-Allow-Credentials',
    severity: 'High',
    reason: 'Indicates whether the response can be shared when credentials are included.',
    remediation: 'Only set to true if credentials are necessary, and never use with wildcard origins.',
    values: 'true, false',
  },
  {
    name: 'Access-Control-Expose-Headers',
    severity: 'Low',
    reason: 'Specifies which headers can be exposed to the browser.',
    remediation: 'Only expose headers that are necessary for the client.',
    values: 'Content-Length, X-Custom-Header',
  },
  {
    name: 'Access-Control-Max-Age',
    severity: 'Low',
    reason: 'Specifies how long preflight request results can be cached.',
    remediation: 'Set an appropriate cache duration for preflight requests.',
    values: 'seconds',
  },
];

function normalizeUrl(url: string): string {
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }
  return url;
}

async function scanUrl(url: string, scanType: string, authorization?: string): Promise<HeaderResult[]> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const headers: Record<string, string> = {};

    if (scanType === 'api' && authorization) {
      headers['Authorization'] = `Bearer ${authorization}`;
    }

    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers,
      redirect: 'follow',
    });

    const headersToCheck = scanType === 'api' ? apiSecurityHeaders : webSecurityHeaders;
    const results: HeaderResult[] = [];

    for (const headerName of headersToCheck) {
      const headerValue = response.headers.get(headerName);
      const config = headerConfigurations.find(c => c.name === headerName);

      if (!config) {
        results.push({
          url: normalizedUrl,
          name: headerName,
          value: headerValue || 'Not Found',
          severity: '',
          reason: '',
          remediation: '',
          values: '',
          status: 'FAIL',
          statusCode: response.status,
        });
        continue;
      }

      if (headerValue) {
        const validValues = config.values.split(', ').map(v => v.toLowerCase());
        const hasValidValue = validValues.some(val => headerValue.toLowerCase().includes(val));

        results.push({
          url: normalizedUrl,
          name: headerName,
          value: headerValue,
          severity: config.severity,
          reason: config.reason,
          remediation: config.remediation,
          values: config.values,
          status: hasValidValue ? 'PASS' : 'PASS',
          statusCode: response.status,
        });
      } else {
        results.push({
          url: normalizedUrl,
          name: headerName,
          value: 'Not Found',
          severity: config.severity,
          reason: config.reason,
          remediation: config.remediation,
          values: config.values,
          status: 'FAIL',
          statusCode: response.status,
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to scan URL: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { url, scanType = 'web', authorization, scanId } = await req.json() as ScanRequest & { scanId?: string };

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (scanId) {
      await supabase
        .from('scans')
        .update({ status: 'running' })
        .eq('id', scanId);
    }

    const results = await scanUrl(url, scanType, authorization);

    const metadata = {
      timestamp: new Date().toISOString(),
      headersScanned: results.length,
      headersPassed: results.filter(r => r.status === 'PASS').length,
      headersFailed: results.filter(r => r.status === 'FAIL').length,
    };

    if (scanId) {
      await supabase
        .from('scans')
        .update({
          status: 'completed',
          results: results,
          metadata: metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scanId);
    }

    return new Response(
      JSON.stringify({ results, metadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
