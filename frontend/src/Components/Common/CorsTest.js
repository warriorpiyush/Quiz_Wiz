import React, { useState } from 'react';
import apiClient from '../../config/axios';

const CorsTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCors = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await apiClient.get('/test-cors');
      setTestResult({
        success: true,
        data: response.data,
        message: 'CORS is working correctly!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error.response?.data || 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuthStatus = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await apiClient.get('/auth/status');
      setTestResult({
        success: true,
        data: response.data,
        message: 'Auth endpoint is working correctly!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        details: error.response?.data || 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CORS Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testCors}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test CORS Connection'}
        </button>
        
        <button
          onClick={testAuthStatus}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Auth Status Endpoint'}
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.success ? '✅ Success' : '❌ Error'}
          </h3>
          <p className={`mt-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message || testResult.error}
          </p>
          
          {testResult.data && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-800">Response Data:</h4>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
          
          {testResult.details && (
            <div className="mt-4">
              <h4 className="font-medium text-red-800">Error Details:</h4>
              <pre className="mt-2 p-3 bg-red-100 rounded text-sm overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li><strong>Frontend URL:</strong> {window.location.origin}</li>
          <li><strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://quiz-wiz-t06d.onrender.com'}</li>
          <li><strong>Environment:</strong> {process.env.NODE_ENV}</li>
        </ul>
      </div>
    </div>
  );
};

export default CorsTest;
