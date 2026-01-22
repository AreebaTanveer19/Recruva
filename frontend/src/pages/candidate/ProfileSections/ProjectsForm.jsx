import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FormField from './FormField';

const ProjectsForm = ({ formData, onChange, onAdd, onRemove }) => {
  const projects = formData.projects || [];

  return (
    <section id="section-projects" className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-500">Showcase your work and side projects</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd('projects', { title: '', description: '', link: '' })}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemove('projects', index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Project Title"
                name={`projects[${index}].title`}
                value={project.title}
                onChange={onChange}
                required
              />
              <FormField
                label="Project URL"
                name={`projects[${index}].link`}
                type="url"
                value={project.link}
                onChange={onChange}
                placeholder="https://example.com"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name={`projects[${index}].description`}
                  value={project.description}
                  onChange={onChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the project, your role, technologies used, and key achievements"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsForm;
