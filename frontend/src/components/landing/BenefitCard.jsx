import React from 'react';
import { motion } from 'framer-motion';

const BenefitCard = ({ icon, title, description, index = 0 }) => {
  // Color variants for different cards
  const colorVariants = [
    {
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      gradient: 'from-teal-500 to-teal-600',
      lightBg: 'from-teal-50 to-teal-100',
      borderColor: 'border-teal-200',
    },
    {
      gradient: 'from-purple-500 to-purple-600',
      lightBg: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
    },
  ];

  const colors = colorVariants[index % colorVariants.length];

  return (
    <motion.div
      whileHover={{ y: -12, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      transition={{ duration: 0.3 }}
      className={`relative group h-full bg-white rounded-2xl border-2 ${colors.borderColor} overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      {/* Card Background Gradient - subtle */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Icon Container with Gradient Background */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-6 shadow-lg flex-shrink-0 ring-4 ring-white`}
        >
          <div className="scale-110 text-white">{icon}</div>
        </motion.div>

        {/* Number Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className={`text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-2`}
        >
          {`0${index + 1}`}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 flex-grow text-sm leading-relaxed">{description}</p>

        {/* Bottom Accent Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
          className={`mt-6 h-1 bg-gradient-to-r ${colors.gradient} rounded-full origin-left`}
        ></motion.div>
      </div>

      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 rounded-full -mr-8 -mt-8 transition-opacity duration-300`}></div>
    </motion.div>
  );
};

export default BenefitCard;
