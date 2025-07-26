import React, { useState } from 'react';
import GoogleSignIn from './GoogleSignIn';

const UserTypeSelector = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState('student');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Role</h2>
        
        <p className="text-gray-600 text-center mb-6">
          Please select how you want to sign up with Google:
        </p>

        <div className="space-y-4 mb-6">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="userType"
              value="student"
              checked={selectedType === 'student'}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-semibold">Student / Candidate</div>
              <div className="text-sm text-gray-600">Take quizzes and view results</div>
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="userType"
              value="examiner"
              checked={selectedType === 'examiner'}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mr-3"
            />
            <div>
              <div className="font-semibold">Examiner / Teacher</div>
              <div className="text-sm text-gray-600">Create and manage quizzes</div>
            </div>
          </label>
        </div>

        <div className="space-y-3">
          <GoogleSignIn 
            text={`Continue as ${selectedType === 'student' ? 'Student' : 'Examiner'}`}
            userType={selectedType}
          />
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          You can change your role later through the admin panel if needed.
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
