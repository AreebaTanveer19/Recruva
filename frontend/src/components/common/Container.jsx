import React from 'react';

/**
 * Container component for consistent spacing and layout
 */
const Container = ({
  children,
  className = '',
  section = false,
  id = '',
  bg = 'white',
}) => {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900',
    'gradient-light': 'bg-gradient-to-br from-blue-50 to-teal-50',
  };

  return (
    <section
      id={id}
      className={`${section ? 'py-20' : ''} ${bgClasses[bg]} ${className}`}
    >
      <div className="container mx-auto px-6">
        {children}
      </div>
    </section>
  );
};

export default Container;
