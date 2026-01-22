// frontend/src/pages/candidate/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from "../../constants";
import api from '../../api';
import GeneralInfoForm from './ProfileSections/GeneralInfoForm';
import EducationForm from './ProfileSections/EducationForm';
import ExperienceForm from './ProfileSections/ExperienceForm';
import SkillsForm from './ProfileSections/SkillsForm';
import ProjectsForm from './ProfileSections/ProjectsForm';
import CertificationsForm from './ProfileSections/CertificationsForm';
import {
  UserCircleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  PuzzlePieceIcon,
  FolderIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const FORM_SECTIONS = [
  { 
    id: 'general', 
    label: 'General Info', 
    component: GeneralInfoForm,
    icon: <UserCircleIcon className="h-5 w-5" />
  },
  { 
    id: 'education', 
    label: 'Education', 
    component: EducationForm,
    icon: <AcademicCapIcon className="h-5 w-5" />
  },
  { 
    id: 'experience', 
    label: 'Experience', 
    component: ExperienceForm,
    icon: <BriefcaseIcon className="h-5 w-5" />
  },
  { 
    id: 'skills', 
    label: 'Skills', 
    component: SkillsForm,
    icon: <PuzzlePieceIcon className="h-5 w-5" />
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    component: ProjectsForm,
    icon: <FolderIcon className="h-5 w-5" />
  },
  { 
    id: 'certifications', 
    label: 'Certifications', 
    component: CertificationsForm,
    icon: <DocumentCheckIcon className="h-5 w-5" />
  },
];

const ProfileForm = ({ onSuccess = () => {}, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    education: [{ degree: '', institution: '', year: '' }],
    work_experience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
    skills: [],
    projects: [{ title: '', description: '', link: '' }],
    certifications: [{ name: '', authority: '', year: '', credentialId: '' }]
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          navigate('/candidate/auth');
          return;
        }

        const response = await api.get('/cv');
        const data = response.data.data;

        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data,
            education: data.education?.length ? data.education : prev.education,
            work_experience: data.work_experience?.length ? data.work_experience : prev.work_experience,
            projects: data.projects?.length ? data.projects : prev.projects,
            certifications: data.certifications?.length ? data.certifications : prev.certifications,
            skills: data.skills || []
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/candidate/auth');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('[')) {
      const [section, index, field] = name.replace(/\]/g, '').split(/[\[\].]/);
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === parseInt(index) ? { ...item, [field]: value } : item
        )
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addItemToSection = (section, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], { ...defaultItem }]
    }));
  };

  const removeItemFromSection = (section, index) => {
    if (formData[section].length > 1) {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/cv', formData);
      setSuccess('Profile updated successfully!');
      onSuccess(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSuccess('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center">
            {FORM_SECTIONS.map((step, index) => (
              <li
                key={step.id}
                className={`relative ${
                  index !== FORM_SECTIONS.length - 1 ? 'flex-1' : ''
                }`}
              >
                {index < currentStep ? (
                  <div className="group flex w-full items-center">
                    <span className="flex h-9 items-center">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-800">
                        <CheckIcon className="h-5 w-5 text-white" />
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">{step.label}</span>
                  </div>
                ) : index === currentStep ? (
                  <div className="flex items-center" aria-current="step">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-blue-600">{step.label}</span>
                  </div>
                ) : (
                  <div className="group flex items-center">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                      {step.label}
                    </span>
                  </div>
                )}
                
                {index !== FORM_SECTIONS.length - 1 && (
                  <div
                    className={`absolute top-4 right-0 left-0 -z-10 h-0.5 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Step Content */}
          <div className="bg-white shadow rounded-lg p-6">
            {React.createElement(FORM_SECTIONS[currentStep].component, {
              formData,
              onChange: handleChange,
              onAdd: addItemToSection,
              onRemove: removeItemFromSection,
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Previous
                </button>
              )}
            </div>
            
            <div>
              {currentStep < FORM_SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;