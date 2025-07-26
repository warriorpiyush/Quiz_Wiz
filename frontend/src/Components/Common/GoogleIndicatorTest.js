import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useAppContext } from '../../LocalStorage';

const GoogleIndicatorTest = () => {
  const { user: googleUser, isAuthenticated } = useAuth();
  const { user: localUser } = useAppContext();
  
  const user = googleUser || localUser;

  const isGoogleUser = googleUser || user?.googleId;
  const college = user?.college || (user?.googleId ? 'Google Sign-up' : 'Not specified');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Google Indicator Test</h1>

        <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
        
        {user ? (
          <div className="space-y-4">
            {/* User Profile Display */}
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <img
                alt="User avatar"
                src={
                  user?.profilePicture || 
                  (user?.photo === "default" ? "https://avatar.iran.liara.run/public" : user?.photo) ||
                  "https://avatar.iran.liara.run/public"
                }
                className="rounded-full border-2 border-purple-400 w-16 h-16 object-cover"
                onError={(e) => {
                  e.target.src = "https://avatar.iran.liara.run/public";
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-sm font-medium text-purple-600">{college}</p>
                {isGoogleUser && (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    🔗 Google Account
                  </span>
                )}
              </div>
            </div>

            {/* Debug Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Detection Logic</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>googleUser exists:</strong> {googleUser ? '✅ Yes' : '❌ No'}</li>
                  <li><strong>user.googleId exists:</strong> {user?.googleId ? '✅ Yes' : '❌ No'}</li>
                  <li><strong>isGoogleUser result:</strong> {isGoogleUser ? '✅ Yes' : '❌ No'}</li>
                  <li><strong>College display:</strong> {college}</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">User Data Fields</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>googleId:</strong> {user?.googleId || 'Not set'}</li>
                  <li><strong>profilePicture:</strong> {user?.profilePicture ? '✅ Set' : '❌ Not set'}</li>
                  <li><strong>college:</strong> {user?.college || 'Not set'}</li>
                  <li><strong>userType:</strong> {user?.userType || user?.type || 'Not set'}</li>
                </ul>
              </div>
            </div>

            {/* Raw Data */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Raw User Object</h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No user data available</p>
            <p className="text-sm">Please sign in to test Google indicators</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Expected Behavior:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Google users should show "🔗 Google Account" badge</li>
          <li>• College should show "Google Sign-up" for Google users</li>
          <li>• Profile picture should be from Google if available</li>
          <li>• googleId field should be populated for Google users</li>
        </ul>
      </div>

      {/* Test Actions */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Test Actions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin'}}>
          <button
            onClick={() => window.location.href = 'http://localhost:8000/auth/google-student'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Test Google Student Signup
          </button>
          <button
            onClick={() => window.location.href = 'http://localhost:8000/auth/google-examiner'}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Test Google Examiner Signup
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleIndicatorTest;
