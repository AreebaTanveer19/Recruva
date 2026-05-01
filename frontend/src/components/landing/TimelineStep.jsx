import React from 'react';
import { motion } from 'framer-motion';

const TimelineStep = ({ number, icon, title, description, color, index, total }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
      className="relative group flex flex-col md:flex-row items-center transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Timeline Dot */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 md:left-1/2 md:translate-x-0 w-6 h-6 rounded-full bg-gradient-to-r ${color} border-4 border-white shadow-lg z-10`}
      ></div>

      {/* Content */}
      <motion.div
        whileHover={{ y: -8 }}
        className={`w-full md:w-5/12 p-6 md:p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${
          index % 2 === 0 ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'
        }`}
      >
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${color} shadow-lg mb-6`}>
          {icon}
        </div>
        <div className="flex items-center mb-2">
          <span className="text-2xl font-bold text-gray-900 mr-2">{number}.</span>
          <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 pl-8">{description}</p>

        {/* Mobile Arrow */}
        {index < total - 1 && (
          <div className="md:hidden flex justify-center mt-6">
            <motion.svg
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </motion.svg>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TimelineStep;
