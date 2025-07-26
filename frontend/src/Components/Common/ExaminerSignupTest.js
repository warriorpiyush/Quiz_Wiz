import React, { useState } from 'react';
import axios from 'axios';

const ExaminerSignupTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testSessionHandling = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Set session for examiner
      addResult('Setting session for examiner', '⏳ Testing...');
      const sessionTest = await axios.get('http://localhost:8000/auth/test-session/examiner', {
        withCredentials: true
      });
      addResult('Setting session for examiner', '✅ Success', JSON.stringify(sessionTest.data, null, 2));

      // Test 2: Check if session persists
      addResult('Checking session persistence', '⏳ Testing...');
      const statusCheck = await axios.get('http://localhost:8000/auth/status', {
        withCredentials: true
      });
      addResult('Checking session persistence', '✅ Success', JSON.stringify(statusCheck.data, null, 2));

      // Test 3: Check debug info
      addResult('Checking debug info', '⏳ Testing...');
      const debugInfo = await axios.get('http://localhost:8000/auth/debug', {
        withCredentials: true
      });
      addResult('Checking debug info', '✅ Success', `Found ${debugInfo.data.students?.length || 0} students, ${debugInfo.data.examiners?.length || 0} examiners`);

    } catch (error) {
      addResult('Session test', '❌ Failed', error.message);
    }
    
    setLoading(false);
  };

  const testExaminerGoogleAuth = () => {
    addResult('Starting Examiner Google Auth', '⏳ Redirecting...', 'Opening Google OAuth for examiner type');
    window.open('http://localhost:8000/auth/google?type=examiner', '_blank');
  };

  const testStudentGoogleAuth = () => {
    addResult('Starting Student Google Auth', '⏳ Redirecting...', 'Opening Google OAuth for student type');
    window.open('http://localhost:8000/auth/google?type=student', '_blank');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Examiner Signup Debug Tool</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin'}}>
            <button
              onClick={testSessionHandling}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Session Handling'}
            </button>
            
            <button
              onClick={testExaminerGoogleAuth}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Test Examiner Google Auth
            </button>
            
            <button
              onClick={testStudentGoogleAuth}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Test Student Google Auth
            </button>
            
            <button
              onClick={clearResults}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Test Session Handling:</strong> Verifies that sessions are working correctly</li>
            <li><strong>Test Examiner Google Auth:</strong> Opens Google OAuth with examiner type</li>
            <li><strong>Test Student Google Auth:</strong> Opens Google OAuth with student type</li>
            <li><strong>Check Backend Console:</strong> Look for detailed logs during OAuth flow</li>
            <li><strong>Check Database:</strong> Verify users are created in correct collections</li>
          </ol>
          
          <div className="mt-4 p-3 bg-red-100 rounded">
            <p className="text-sm text-red-800">
              <strong>Expected:</strong> Examiner auth should create user in Examiners collection, 
              Student auth should create user in Students collection.
            </p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.test}</span>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                <div className="text-sm mt-1">{result.result}</div>
                {result.details && (
                  <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-x-auto">
                    {result.details}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug URLs */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug URLs:</h3>
        <ul className="text-sm space-y-1">
          <li>• Session Test (Examiner): <code>http://localhost:8000/auth/test-session/examiner</code></li>
          <li>• Session Test (Student): <code>http://localhost:8000/auth/test-session/student</code></li>
          <li>• Auth Status: <code>http://localhost:8000/auth/status</code></li>
          <li>• Debug Info: <code>http://localhost:8000/auth/debug</code></li>
          <li>• Admin Panel: <code>http://localhost:3000/admin</code></li>
        </ul>
        </div>
      </div>
    </div>
  );
};

export default ExaminerSignupTest;
