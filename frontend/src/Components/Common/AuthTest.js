import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import './ScrollableContainer.css';

const AuthTest = () => {
  const { user, isAuthenticated, loading, checkAuthStatus } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/auth/debug', {
        withCredentials: true
      });
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
    }
  };

  const testGoogleAuthStudent = () => {
    window.location.href = 'http://localhost:8000/auth/google?type=student';
  };

  const testGoogleAuthExaminer = () => {
    window.location.href = 'http://localhost:8000/auth/google?type=examiner';
  };

  const testLogout = () => {
    window.location.href = 'http://localhost:8000/auth/logout';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Google Authentication Test</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Auth Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
            {user && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">User Details:</h3>
                <pre className="text-sm mt-2">{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3 max-h-screen overflow-y-auto scrollable-container button-container" style={{maxHeight: '400px'}}>
            <button
              onClick={testGoogleAuthStudent}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Test Google Sign-In (Student)
            </button>

            <button
              onClick={testGoogleAuthExaminer}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Test Google Sign-In (Examiner)
            </button>
            
            <button
              onClick={checkAuthStatus}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Refresh Auth Status
            </button>
            
            <button
              onClick={testLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Test Logout
            </button>
            
            <button
              onClick={fetchDebugInfo}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Refresh Debug Info
            </button>

            <a
              href="/admin"
              className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 text-center block"
            >
              Admin Panel
            </a>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Backend Auth Status:</h3>
                <p>Authenticated: {debugInfo.isAuthenticated ? 'Yes' : 'No'}</p>
                {debugInfo.currentUser && (
                  <div className="mt-2 p-3 bg-gray-100 rounded">
                    <pre className="text-sm">{JSON.stringify(debugInfo.currentUser, null, 2)}</pre>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold">Students in Database:</h3>
                <div className="mt-2 p-3 bg-gray-100 rounded max-h-40 overflow-y-auto">
                  <pre className="text-sm">{JSON.stringify(debugInfo.students, null, 2)}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">Examiners in Database:</h3>
                <div className="mt-2 p-3 bg-gray-100 rounded max-h-40 overflow-y-auto">
                  <pre className="text-sm">{JSON.stringify(debugInfo.examiners, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
