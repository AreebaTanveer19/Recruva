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
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="ml-64 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isEditing || !hasProfileData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="relative flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <main className="w-full flex-1 overflow-x-hidden lg:pl-64">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              <ProfileForm
                onSuccess={() => {
                  setIsEditing(false);
                  setHasProfileData(true);
                  checkProfileData();
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return <ProfileDisplay onEdit={() => setIsEditing(true)} />;
}
;

export default Profile;