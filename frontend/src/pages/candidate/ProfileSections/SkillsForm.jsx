import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
  'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js', 'Docker', 'AWS', 'Azure',
  'Git', 'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'UI/UX Design'
];

const SkillsForm = ({ formData, onChange }) => {
  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  
  const skills = formData.skills || [];

  const handleAddSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      const newSkills = [...skills, skill];
      onChange({ target: { name: 'skills', value: newSkills } });
    }
    setSkillInput('');
    setFilteredSkills([]);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    onChange({ target: { name: 'skills', value: newSkills } });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value) {
      setFilteredSkills(
        SKILLS.filter(skill => 
          skill.toLowerCase().includes(value.toLowerCase()) && 
          !skills.includes(skill)
        ).slice(0, 5)
      );
    } else {
      setFilteredSkills([]);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      handleAddSkill(skillInput.trim().replace(/,$/, ''));
    }
  };

  return (
    <section id="section-skills" className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
        <p className="text-sm text-gray-500">Add your professional skills and competencies</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center">
            <input
              type="text"
              value={skillInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type to search or add a skill"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => skillInput && handleAddSkill(skillInput.trim())}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add
            </button>
          </div>

          {filteredSkills.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                  onClick={() => handleAddSkill(skill)}
                >
                  <div className="flex items-center">
                    <span className="font-normal ml-3 block truncate">
                      {skill}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                >
                  <span className="sr-only">Remove skill</span>
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-500">No skills added yet. Start typing to add skills.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillsForm;
