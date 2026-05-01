import React from 'react';

const SectionHeader = ({ badge, title, subtitle, centered = true }) => {
  return (
    <div className={`${centered ? 'text-center max-w-3xl mx-auto' : ''} mb-16`}>
      {badge && (
        <span className="inline-block px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
