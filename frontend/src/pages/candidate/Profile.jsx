import React from 'react';
import Sidebar from '../../components/candidate/Sidebar';
import ProfileForm from './ProfileForm';

const Profile = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;