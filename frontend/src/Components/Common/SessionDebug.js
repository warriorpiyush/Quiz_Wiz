import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useAppContext } from '../../LocalStorage';
import axios from 'axios';
import './ScrollableContainer.css';

const SessionDebug = () => {
  const { user: googleUser, isAuthenticated, loading, checkAuthStatus, forceLogout } = useAuth();
  const { user: localUser, setUser } = useAppContext();
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    fetchSessionInfo();
  }, []);

  const fetchSessionInfo = async () => {
    try {
      const [authStatus, debugInfo] = await Promise.all([
        axios.get('http://localhost:8000/auth/status', { withCredentials: true }),
        axios.get('http://localhost:8000/auth/debug', { withCredentials: true })
      ]);
      
      setSessionInfo({
        authStatus: authStatus.data,
        debugInfo: debugInfo.data
      });
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  };

  const clearLocalUser = () => {
    setUser(undefined);
    console.log('🧹 Local user cleared');
  };

  const clearSessions = async () => {
    try {
      await axios.post('http://localhost:8000/auth/clear-sessions', {}, {
        withCredentials: true
      });
      console.log('🧹 Sessions cleared');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  };

  const testGoogleAuth = () => {
    window.open('http://localhost:8000/auth/google', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Session Debug Panel</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current State</h3>
          
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium">Frontend Auth Context</h4>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Google User:</strong> {googleUser ? googleUser.email : 'None'}</p>
            <p><strong>Local User:</strong> {localUser ? localUser.email : 'None'}</p>
          </div>

          {sessionInfo && (
            <div className="p-4 bg-blue-100 rounded">
              <h4 className="font-medium">Backend Session</h4>
              <p><strong>Backend Auth:</strong> {sessionInfo.authStatus.isAuthenticated ? 'Yes' : 'No'}</p>
              {sessionInfo.authStatus.user && (
                <div className="mt-2">
                  <p><strong>Backend User:</strong> {sessionInfo.authStatus.user.email}</p>
                  <p><strong>User Type:</strong> {sessionInfo.authStatus.user.userType}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actions</h3>

          <div className="space-y-2 max-h-80 overflow-y-auto scrollable-container button-container">
            <button
              onClick={checkAuthStatus}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Refresh Auth Status
            </button>
            
            <button
              onClick={fetchSessionInfo}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Refresh Session Info
            </button>
            
            <button
              onClick={testGoogleAuth}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Test Google Auth (New Tab)
            </button>
            
            <button
              onClick={clearLocalUser}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
            >
              Clear Local User
            </button>
            
            <button
              onClick={forceLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Force Logout (Google)
            </button>
            
            <button
              onClick={clearSessions}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Clear All Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Debug Data */}
      {sessionInfo && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Raw Debug Data</h3>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            <pre className="text-sm">{JSON.stringify(sessionInfo, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>If users are seeing the same account, click "Clear All Sessions"</li>
          <li>If Google auth isn't working, try "Test Google Auth" in a new tab</li>
          <li>If local users are stuck, click "Clear Local User"</li>
          <li>Use "Force Logout" to completely clear Google sessions</li>
          <li>Always refresh after clearing sessions</li>
        </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDebug;
