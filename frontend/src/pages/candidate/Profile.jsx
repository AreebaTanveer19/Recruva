import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/candidate/Sidebar';
import ProfileForm from './ProfileForm';
import ProfileDisplay from './ProfileDisplay';
import api from '../../api';

const Profile = () => {
  const [hasProfileData, setHasProfileData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const checkProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
      if (!token) return;

      const response = await api.get('/cv');
      const data = response.data.data;
      setHasProfileData(Boolean(data));
    } catch (error) {
      setHasProfileData(false);
      console.error('Error checking CV data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkProfileData();
  }, [checkProfileData]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-64">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full overflow-x-hidden">
        <div className="w-full px-4 py-6 sm:px-6 md:px-8">
          {isEditing || !hasProfileData ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ProfileForm
                onSuccess={() => {
                  setIsEditing(false);
                  setHasProfileData(true);
                  checkProfileData();
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <ProfileDisplay onEdit={() => setIsEditing(true)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;