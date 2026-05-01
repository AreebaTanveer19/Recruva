import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../utils/animations';

const FeatureCard = ({ icon, title, description, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-blue-100 transition-all duration-300 h-full flex flex-col"
    >
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 flex-grow">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
