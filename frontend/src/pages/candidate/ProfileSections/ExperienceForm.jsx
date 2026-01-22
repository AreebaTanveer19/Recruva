import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FormField from './FormField';

const ExperienceForm = ({ formData, onChange, onAdd, onRemove }) => {
  const experiences = formData.work_experience || [];

  return (
    <section id="section-experience" className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Work Experience</h2>
          <p className="text-sm text-gray-500">Your professional work history</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd('work_experience', { company: '', role: '', startDate: '', endDate: '', description: '' })}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Experience
        </button>
      </div>

      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemove('work_experience', index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Company"
                name={`work_experience[${index}].company`}
                value={exp.company}
                onChange={onChange}
                required
              />
              <FormField
                label="Job Title"
                name={`work_experience[${index}].role`}
                value={exp.role}
                onChange={onChange}
                required
              />
              <FormField
                label="Start Date"
                name={`work_experience[${index}].startDate`}
                type="date"
                value={exp.startDate}
                onChange={onChange}
                required
              />
              <FormField
                label="End Date"
                name={`work_experience[${index}].endDate`}
                type="date"
                value={exp.endDate}
                onChange={onChange}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Description"
                  name={`work_experience[${index}].description`}
                  value={exp.description}
                  onChange={onChange}
                  as="textarea"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceForm;
