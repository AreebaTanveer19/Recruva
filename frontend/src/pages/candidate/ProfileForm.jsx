import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const API_URL = 'http://localhost:3000/api/candidate/profile';

// Predefined options for form fields
const DEGREE_TYPES = [
  'High School',
  'Associate',
  'Bachelor',
  'Master',
  'PhD',
  'Other'
];

const SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
  'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js', 'Docker', 'AWS', 'Azure',
  'Git', 'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'UI/UX Design'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    education: [{ degree: '', institution: '', year: '' }],
    work_experience: [{ company: '', role: '', duration: '', description: '' }],
    skills: [],
    projects: [{ title: '', description: '', link: '' }],
    certifications: [{ name: '', authority: '', year: '' }]
  });
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Create axios instance with default config
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/candidate/profile');
          return;
        }

        const response = await api.get('/');
        const data = response.data;
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data,
            education: data.education?.length ? data.education : [{ degree: '', institution: '', year: '' }],
            work_experience: data.work_experience?.length ? data.work_experience : [{ company: '', role: '', duration: '', description: '' }],
            projects: data.projects?.length ? data.projects : [{ title: '', description: '', link: '' }],
            certifications: data.certifications?.length ? data.certifications : [{ name: '', authority: '', year: '' }],
            skills: data.skills || []
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/candidate/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e, section, index) => {
    const { name, value } = e.target;
    
    if (section) {
      const updatedSection = [...formData[section]];
      updatedSection[index] = {
        ...updatedSection[index],
        [name]: value
      };
      setFormData({
        ...formData,
        [section]: updatedSection
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const addSection = (section) => {
    let newItem;
    switch (section) {
      case 'education':
        newItem = { degree: '', institution: '', year: '' };
        break;
      case 'work_experience':
        newItem = { company: '', role: '', duration: '', description: '' };
        break;
      case 'projects':
        newItem = { title: '', description: '', link: '' };
        break;
      case 'certifications':
        newItem = { name: '', authority: '', year: '' };
        break;
      default:
        return;
    }
    
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeSection = (section, index) => {
    if (formData[section].length > 1) {
      const updatedSection = formData[section].filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        [section]: updatedSection
      }));
    }
  };

  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,/g, '');
      if (!formData.skills.includes(newSkill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');

    try {
      // Format the data for the CV data update
      const cvData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        education: formData.education,
        work_experience: formData.work_experience,
        skills: formData.skills,
        projects: formData.projects,
        certifications: formData.certifications
      };

      const response = await axios.post('http://localhost:3000/api/cv', cvData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 200) {
        setSuccess('CV data saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error saving CV data:', error);
      if (error.response?.status === 401) {
        // Redirect to login if unauthorized
        navigate('/candidate/auth');
      } else {
        // Show error message to user
        alert(error.response?.data?.message || 'Error saving CV data. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = (section, fields, index) => {
    return (
      <div key={index} className="bg-white p-6 rounded-lg shadow-md mb-6 relative">
        {index > 0 && (
          <button
            type="button"
            onClick={() => removeSection(section, index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
        {Object.entries(fields).map(([field, value]) => (
          <div key={field} className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 capitalize">
              {field.replace('_', ' ')}
            </label>
            {field === 'description' ? (
              <textarea
                name={field}
                value={value}
                onChange={(e) => handleChange(e, section, index)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              />
            ) : (
              <input
                type={field === 'year' || field === 'duration' ? 'text' : 'text'}
                name={field}
                value={value}
                onChange={(e) => handleChange(e, section, index)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={`Enter ${field.replace('_', ' ')}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Custom select component
  const CustomSelect = ({ value, onChange, options, placeholder, className = '' }) => (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className={`relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm ${className}`}>
          <span className="block truncate">{value || placeholder || 'Select an option'}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {options.map((option, idx) => (
              <Listbox.Option
                key={idx}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );

  // Date range component for work experience
  const DateRangeInput = ({ start, end, onChange, index }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <div className="grid grid-cols-2 gap-2">
          <CustomSelect
            value={start?.month || ''}
            onChange={(month) => {
              const newExp = [...formData.work_experience];
              newExp[index].start = { ...newExp[index].start, month };
              setFormData({ ...formData, work_experience: newExp });
            }}
            options={MONTHS}
            placeholder="Month"
          />
          <CustomSelect
            value={start?.year || ''}
            onChange={(year) => {
              const newExp = [...formData.work_experience];
              newExp[index].start = { ...newExp[index].start, year };
              setFormData({ ...formData, work_experience: newExp });
            }}
            options={YEARS}
            placeholder="Year"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <div className="grid grid-cols-2 gap-2">
          <CustomSelect
            value={end?.month || ''}
            onChange={(month) => {
              const newExp = [...formData.work_experience];
              newExp[index].end = { ...newExp[index].end, month };
              setFormData({ ...formData, work_experience: newExp });
            }}
            options={MONTHS}
            placeholder="Month"
          />
          <CustomSelect
            value={end?.year || ''}
            onChange={(year) => {
              const newExp = [...formData.work_experience];
              newExp[index].end = { ...newExp[index].end, year };
              setFormData({ ...formData, work_experience: newExp });
            }}
            options={YEARS}
            placeholder="Year"
          />
        </div>
        <div className="mt-2 flex items-center">
          <input
            type="checkbox"
            id={`current-${index}`}
            checked={!end}
            onChange={(e) => {
              const newExp = [...formData.work_experience];
              newExp[index].end = e.target.checked ? null : { month: '', year: '' };
              setFormData({ ...formData, work_experience: newExp });
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`current-${index}`} className="ml-2 block text-sm text-gray-700">
            I currently work here
          </label>
        </div>
      </div>
    </div>
  );

  // Skill chip component
  const SkillChip = ({ skill, onRemove }) => (
    <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">
      {skill}
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        &times;
      </button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Candidate Profile</h1>
        <p className="text-gray-600 mb-6">Update your profile information</p>
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Basic Information</h2>
            <p className="text-sm text-gray-500">Your personal details and contact information</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange(e)}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange(e)}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleChange(e)}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={(e) => handleChange(e)}
                rows={2}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                placeholder="Enter your full address"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Education</h2>
              <p className="text-sm text-gray-500">Your educational background</p>
            </div>
            <button
              type="button"
              onClick={() => addSection('education')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Add Education
            </button>
          </div>
          {formData.education.map((edu, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection('education', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <CustomSelect
                    value={edu.degree}
                    onChange={(value) => {
                      const newEdu = [...formData.education];
                      newEdu[index].degree = value;
                      setFormData({ ...formData, education: newEdu });
                    }}
                    options={DEGREE_TYPES}
                    placeholder="Select degree"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleChange(e, 'education', index)}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="University/School name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    name="field"
                    value={edu.field || ''}
                    onChange={(e) => handleChange(e, 'education', index)}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <CustomSelect
                    value={edu.year}
                    onChange={(value) => {
                      const newEdu = [...formData.education];
                      newEdu[index].year = value;
                      setFormData({ ...formData, education: newEdu });
                    }}
                    options={YEARS}
                    placeholder="Select year"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Work Experience */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Work Experience</h2>
              <p className="text-sm text-gray-500">Your professional work history</p>
            </div>
            <button
              type="button"
              onClick={() => addSection('work_experience')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Add Experience
            </button>
          </div>
          {formData.work_experience.map((exp, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection('work_experience', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={exp.company}
                      onChange={(e) => handleChange(e, 'work_experience', index)}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="role"
                      value={exp.role}
                      onChange={(e) => handleChange(e, 'work_experience', index)}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                      placeholder="Your job title"
                    />
                  </div>
                </div>
                
                <DateRangeInput 
                  start={exp.start} 
                  end={exp.end} 
                  onChange={(field, value) => {
                    const newExp = [...formData.work_experience];
                    newExp[index][field] = value;
                    setFormData({ ...formData, work_experience: newExp });
                  }} 
                  index={index} 
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={exp.description}
                    onChange={(e) => handleChange(e, 'work_experience', index)}
                    rows={3}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="Describe your responsibilities and achievements"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
            <p className="text-sm text-gray-500">Add your professional skills and competencies</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Skills</label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type to search or add a new skill"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              
              {/* Skills Suggestions Dropdown */}
              {skillInput && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {SKILLS.filter(skill => 
                    !formData.skills.includes(skill) && 
                    skill.toLowerCase().includes(skillInput.toLowerCase())
                  ).slice(0, 5).map((skill, idx) => (
                    <div
                      key={idx}
                      className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, skill]
                        }));
                        setSkillInput('');
                      }}
                    >
                      <div className="flex items-center
                      ">
                        <span className="font-normal ml-3 block truncate">
                          {skill}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Option to add custom skill */}
                  {!SKILLS.some(skill => 
                    skill.toLowerCase() === skillInput.toLowerCase()
                  ) && skillInput && (
                    <div
                      className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-blue-600"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, skillInput]
                        }));
                        setSkillInput('');
                      }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium ml-3 block truncate">
                          Add "{skillInput}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Start typing to see suggestions or add a custom skill
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.skills.length > 0 ? (
              formData.skills.map((skill, index) => (
                <SkillChip key={index} skill={skill} onRemove={removeSkill} />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No skills added yet. Start typing to add skills.</p>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
              <p className="text-sm text-gray-500">Showcase your work and side projects</p>
            </div>
            <button
              type="button"
              onClick={() => addSection('projects')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Add Project
            </button>
          </div>
          {formData.projects.map((project, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection('projects', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                    <input
                      type="text"
                      name="title"
                      value={project.title}
                      onChange={(e) => handleChange(e, 'projects', index)}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                      placeholder="Project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        https://
                      </span>
                      <input
                        type="text"
                        name="link"
                        value={project.link?.replace('https://', '') || ''}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].link = e.target.value ? `https://${e.target.value}` : '';
                          setFormData({ ...formData, projects: newProjects });
                        }}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="example.com"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={project.description}
                    onChange={(e) => handleChange(e, 'projects', index)}
                    rows={3}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="Describe the project, your role, technologies used, and key achievements"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id={`project-current-${index}`}
                    name="isCurrent"
                    type="checkbox"
                    checked={project.isCurrent || false}
                    onChange={(e) => {
                      const newProjects = [...formData.projects];
                      newProjects[index].isCurrent = e.target.checked;
                      setFormData({ ...formData, projects: newProjects });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`project-current-${index}`} className="ml-2 block text-sm text-gray-700">
                    I'm currently working on this project
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Certifications</h2>
              <p className="text-sm text-gray-500">Add your professional certifications</p>
            </div>
            <button
              type="button"
              onClick={() => addSection('certifications')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Add Certification
            </button>
          </div>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection('certifications', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                  <input
                    type="text"
                    name="name"
                    value={cert.name}
                    onChange={(e) => handleChange(e, 'certifications', index)}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                  <input
                    type="text"
                    name="authority"
                    value={cert.authority}
                    onChange={(e) => handleChange(e, 'certifications', index)}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <div className="grid grid-cols-2 gap-2">
                    <CustomSelect
                      value={cert.issueMonth || ''}
                      onChange={(month) => {
                        const newCerts = [...formData.certifications];
                        newCerts[index].issueMonth = month;
                        setFormData({ ...formData, certifications: newCerts });
                      }}
                      options={MONTHS}
                      placeholder="Month"
                    />
                    <CustomSelect
                      value={cert.issueYear || ''}
                      onChange={(year) => {
                        const newCerts = [...formData.certifications];
                        newCerts[index].issueYear = year;
                        setFormData({ ...formData, certifications: newCerts });
                      }}
                      options={YEARS}
                      placeholder="Year"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (if any)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <CustomSelect
                      value={cert.expiryMonth || ''}
                      onChange={(month) => {
                        const newCerts = [...formData.certifications];
                        newCerts[index].expiryMonth = month;
                        setFormData({ ...formData, certifications: newCerts });
                      }}
                      options={MONTHS}
                      placeholder="Month"
                    />
                    <CustomSelect
                      value={cert.expiryYear || ''}
                      onChange={(year) => {
                        const newCerts = [...formData.certifications];
                        newCerts[index].expiryYear = year;
                        setFormData({ ...formData, certifications: newCerts });
                      }}
                      options={YEARS}
                      placeholder="Year"
                    />
                  </div>
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`no-expiry-${index}`}
                      checked={!cert.expiryMonth && !cert.expiryYear}
                      onChange={(e) => {
                        const newCerts = [...formData.certifications];
                        if (e.target.checked) {
                          newCerts[index].expiryMonth = '';
                          newCerts[index].expiryYear = '';
                        } else {
                          newCerts[index].expiryMonth = MONTHS[new Date().getMonth()];
                          newCerts[index].expiryYear = new Date().getFullYear().toString();
                        }
                        setFormData({ ...formData, certifications: newCerts });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`no-expiry-${index}`} className="ml-2 block text-sm text-gray-700">
                      No expiration
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID (Optional)</label>
                  <input
                    type="text"
                    name="credentialId"
                    value={cert.credentialId || ''}
                    onChange={(e) => handleChange(e, 'certifications', index)}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    placeholder="Enter your credential ID or license number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL (Optional)</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      name="credentialUrl"
                      value={cert.credentialUrl?.replace('https://', '') || ''}
                      onChange={(e) => {
                        const newCerts = [...formData.certifications];
                        newCerts[index].credentialUrl = e.target.value ? `https://${e.target.value}` : '';
                        setFormData({ ...formData, certifications: newCerts });
                      }}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="www.certification-site.com/your-credential"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Back to Top
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
