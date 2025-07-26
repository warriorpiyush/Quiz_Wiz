import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState({ students: [], examiners: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users');
      setLoading(false);
    }
  };

  const promoteToExaminer = async (email) => {
    try {
      setMessage('Promoting user...');
      const response = await axios.post('http://localhost:8000/admin/promote-to-examiner', {
        email: email
      });
      
      setMessage(`✅ ${response.data.message}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Error promoting user'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - User Management</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 
          message.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Students ({users.students.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.students.map((student) => (
              <div key={student._id} className="border p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {student.name || `${student.firstName} ${student.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-xs text-gray-500">{student.college}</p>
                    {student.googleId && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Google Account
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => promoteToExaminer(student.email)}
                    className="ml-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Promote to Examiner
                  </button>
                </div>
              </div>
            ))}
            {users.students.length === 0 && (
              <p className="text-gray-500 text-center py-4">No students found</p>
            )}
          </div>
        </div>

        {/* Examiners */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Examiners ({users.examiners.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.examiners.map((examiner) => (
              <div key={examiner._id} className="border p-3 rounded-lg bg-purple-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {examiner.name || `${examiner.firstName} ${examiner.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-600">{examiner.email}</p>
                    <p className="text-xs text-gray-500">{examiner.college}</p>
                    {examiner.googleId && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Google Account
                      </span>
                    )}
                  </div>
                  <span className="ml-3 bg-purple-600 text-white px-3 py-1 rounded text-sm">
                    Examiner
                  </span>
                </div>
              </div>
            ))}
            {users.examiners.length === 0 && (
              <p className="text-gray-500 text-center py-4">No examiners found</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">How to make someone an Examiner:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Automatic:</strong> Users with educational email domains (@university.edu, @school.edu, etc.) are automatically created as Examiners</li>
          <li>• <strong>Manual:</strong> Use the "Promote to Examiner" button above to convert any Student to an Examiner</li>
          <li>• <strong>Email keywords:</strong> Emails containing "teacher", "professor", or "instructor" are automatically made Examiners</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchUsers}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Refresh Users
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
