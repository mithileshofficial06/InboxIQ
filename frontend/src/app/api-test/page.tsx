'use client';

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnections() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const tests: any = {
        envVar: apiUrl,
        timestamp: new Date().toISOString(),
      };

      // Test 1: Health check
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        tests.health = {
          status: healthResponse.status,
          ok: healthResponse.ok,
          data: await healthResponse.json(),
        };
      } catch (error: any) {
        tests.health = {
          error: error.message,
          type: error.constructor.name,
        };
      }

      // Test 2: Auth endpoint (should return 401)
      try {
        const authResponse = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include',
        });
        tests.auth = {
          status: authResponse.status,
          ok: authResponse.ok,
        };
      } catch (error: any) {
        tests.auth = {
          error: error.message,
          type: error.constructor.name,
        };
      }

      // Test 3: Direct localhost test
      try {
        const directResponse = await fetch('http://localhost:3001/health');
        tests.directLocalhost = {
          status: directResponse.status,
          ok: directResponse.ok,
        };
      } catch (error: any) {
        tests.directLocalhost = {
          error: error.message,
          type: error.constructor.name,
        };
      }

      setResults(tests);
      setLoading(false);
    }

    testConnections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
        
        {loading ? (
          <div className="text-lg">Testing connections...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Debugging Tips:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>If you see CORS errors, check backend is running on port 3001</li>
            <li>If you see "Failed to fetch", try hard refresh (Ctrl+Shift+R)</li>
            <li>Check browser console for detailed error messages</li>
            <li>Verify .env.local file exists in frontend directory</li>
          </ul>
        </div>

        <div className="mt-4">
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
