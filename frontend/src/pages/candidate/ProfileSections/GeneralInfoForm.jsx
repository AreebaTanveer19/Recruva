import React from 'react';
import FormField from './FormField';

const GeneralInfoForm = ({ formData, onChange }) => {
  return (
    <section id="section-general" className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
        <p className="text-sm text-gray-500">Your personal details and contact information</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
        />
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={onChange}
        />
        <FormField
          label="Location"
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="City, Country or full address"
        />
      </div>
    </section>
  );
};

export default GeneralInfoForm;
