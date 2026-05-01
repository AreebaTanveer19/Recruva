import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import SectionHeader from './SectionHeader';
import { BENEFITS } from '../../pages/landing/landingData';

const BenefitsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <Container section id="why-us" bg="white">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <SectionHeader
          title="Why Choose Recruva"
          subtitle="Trusted by leading companies worldwide for smarter hiring decisions"
        />

        {/* Benefits List Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-12 mt-12"
        >
          {BENEFITS.map((benefit, index) => {
            const colorVariants = [
              { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
              { gradient: 'from-teal-500 to-teal-600', text: 'text-teal-600' },
              { gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
            ];

            const colors = colorVariants[index % colorVariants.length];

            return (
              <motion.div
                key={benefit.id}
                variants={itemVariants}
                className="flex items-start gap-8 group"
              >
                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ring-4 ring-white group-hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="text-white scale-125">{benefit.icon}</div>
                </motion.div>

                {/* Content */}
                <div className="flex-grow pt-2">
                  {/* Number Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`text-sm font-bold ${colors.text} mb-2`}
                  >
                    {`STEP ${index + 1}`}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors duration-300">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-base">
                    {benefit.description}
                  </p>

                  {/* Accent Line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
                    className={`mt-4 h-1 w-12 bg-gradient-to-r ${colors.gradient} rounded-full origin-left`}
                  ></motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Container>
  );
};

export default BenefitsSection;
