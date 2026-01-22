// frontend/src/pages/candidate/ProfileSections/CertificationsForm.jsx
import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FormField from './FormField';

const CertificationsForm = ({ formData, onChange, onAdd, onRemove }) => {
  const certifications = formData.certifications || [];

  return (
    <section id="section-certifications" className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Certifications</h2>
          <p className="text-sm text-gray-500">Add your professional certifications</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd('certifications', { name: '', authority: '', year: '' })}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Certification
        </button>
      </div>

      <div className="space-y-6">
        {certifications.map((cert, index) => (
          <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemove('certifications', index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Certification Name"
                name={`certifications[${index}].name`}
                value={cert.name}
                onChange={onChange}
                required
              />
              <FormField
                label="Issuing Organization"
                name={`certifications[${index}].authority`}
                value={cert.authority}
                onChange={onChange}
                required
              />
              <FormField
                label="Year Obtained"
                name={`certifications[${index}].year`}
                type="number"
                value={cert.year}
                onChange={onChange}
                placeholder="e.g., 2023"
                required
              />
              <FormField
                label="Credential ID (Optional)"
                name={`certifications[${index}].credentialId`}
                value={cert.credentialId || ''}
                onChange={onChange}
                placeholder="Enter your credential ID"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificationsForm;