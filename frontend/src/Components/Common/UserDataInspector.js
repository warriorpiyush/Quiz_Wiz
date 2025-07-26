import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useAppContext } from '../../LocalStorage';

const UserDataInspector = () => {
  const { user: googleUser, isAuthenticated } = useAuth();
  const { user: localUser } = useAppContext();
  
  const user = googleUser || localUser;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Data Inspector</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current User Display */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current User Display</h2>
          
          {user ? (
            <div className="space-y-4">
              {/* Profile Picture Test */}
              <div className="text-center">
                <img
                  alt="User avatar"
                  src={
                    user?.profilePicture ||
                    (user?.photo === "default" ? "https://avatar.iran.liara.run/public" : user?.photo) ||
                    "https://avatar.iran.liara.run/public"
                  }
                  className="rounded-full border-4 p-2 border-purple-400 w-32 h-32 mx-auto object-cover"
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    e.target.src = "https://avatar.iran.liara.run/public";
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', user?.profilePicture);
                  }}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Source: {user?.profilePicture || user?.photo || 'Default'}
                </p>
              </div>
              
              {/* User Info */}
              <div className="space-y-2">
                <p><strong>Name:</strong> {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>User Type:</strong> {user?.userType || user?.type || 'N/A'}</p>
                <p><strong>College:</strong> {user?.college || 'N/A'}</p>
                <p><strong>Google ID:</strong> {user?.googleId || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No user data available</p>
          )}
        </div>

        {/* Raw Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw User Data</h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin'}}>
            <div>
              <h3 className="font-semibold text-green-600">Google User:</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                {googleUser ? JSON.stringify(googleUser, null, 2) : 'null'}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Local User:</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                {localUser ? JSON.stringify(localUser, null, 2) : 'null'}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-600">Auth Status:</h3>
              <p className="text-sm">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture URLs Test */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Profile Picture URL Analysis</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Available URLs:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>profilePicture:</strong> {user?.profilePicture || 'Not set'}</li>
              <li><strong>photo:</strong> {user?.photo || 'Not set'}</li>
              <li><strong>Default fallback:</strong> https://avatar.iran.liara.run/public</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">URL Test:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {user?.profilePicture && (
                <div className="text-center">
                  <img
                    src={user.profilePicture}
                    alt="Profile Picture"
                    className="w-16 h-16 rounded-full mx-auto object-cover"
                    onError={(e) => console.error('profilePicture failed:', e.target.src)}
                  />
                  <p className="text-xs mt-1">profilePicture</p>
                </div>
              )}
              
              {user?.photo && user.photo !== 'default' && (
                <div className="text-center">
                  <img
                    src={user.photo}
                    alt="Photo"
                    className="w-16 h-16 rounded-full mx-auto object-cover"
                    onError={(e) => console.error('photo failed:', e.target.src)}
                  />
                  <p className="text-xs mt-1">photo</p>
                </div>
              )}
              
              <div className="text-center">
                <img
                  src="https://avatar.iran.liara.run/public"
                  alt="Default"
                  className="w-16 h-16 rounded-full mx-auto object-cover"
                />
                <p className="text-xs mt-1">default</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Debugging Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>Check if profilePicture field is populated in the raw data</li>
          <li>Look at browser console for image load errors</li>
          <li>Verify Google profile has a public photo</li>
          <li>Check if CORS is blocking the Google image URL</li>
          <li>Test with different Google accounts</li>
        </ol>
        </div>
      </div>
    </div>
  );
};

export default UserDataInspector;
