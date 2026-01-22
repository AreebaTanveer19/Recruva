import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FormField from './FormField';

const EducationForm = ({ formData, onChange, onAdd, onRemove }) => {
  const education = formData.education || [];

  return (
    <section id="section-education" className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Education</h2>
          <p className="text-sm text-gray-500">Your educational background</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd('education', { degree: '', institution: '', year: '' })}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Education
        </button>
      </div>

      <div className="space-y-6">
        {education.map((edu, index) => (
          <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemove('education', index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Degree"
                name={`education[${index}].degree`}
                value={edu.degree}
                onChange={onChange}
                required
              />
              <FormField
                label="Institution"
                name={`education[${index}].institution`}
                value={edu.institution}
                onChange={onChange}
                required
              />
              <FormField
                label="Year"
                name={`education[${index}].year`}
                type="number"
                value={edu.year}
                onChange={onChange}
                placeholder="e.g., 2020"
                required
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationForm;
