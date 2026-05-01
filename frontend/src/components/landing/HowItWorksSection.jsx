import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Container from '../common/Container';
import SectionHeader from './SectionHeader';
import Button from '../common/Button';
import { TIMELINE_STEPS } from '../../pages/landing/landingData';

const HowItWorksSection = () => {
  const navigate = useNavigate();

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <Container section id="how-it-works" bg="gradient-light">
      <SectionHeader
        badge="Our Process"
        title="How It Works"
        subtitle="A simple 4-step process to transform your recruitment"
      />

      {/* Card Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12 relative"
      >
        {/* Connector Lines - Desktop Only */}
        <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-teal-200 to-transparent pointer-events-none" style={{ top: '60px' }}></div>

        {TIMELINE_STEPS.map((step, index) => (
          <motion.div
            key={step.id}
            variants={itemVariants}
            className="relative group"
          >
            {/* Card */}
            <motion.div
              whileHover={{ y: -12, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-200 shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Number Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-xl shadow-lg mb-6 ring-4 ring-white`}
              >
                {step.number}
              </motion.div>

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 mb-6`}
              >
                {step.icon}
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">{step.description}</p>

              {/* Animated Dot */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-6 h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"
              ></motion.div>
            </motion.div>

            {/* Arrow Connector - Desktop Only */}
            {index < TIMELINE_STEPS.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                className="hidden lg:block absolute top-16 -right-8 text-teal-400"
              >
                <motion.svg
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </motion.div>
            )}

            {/* Mobile Connector - Mobile Only */}
            {index < TIMELINE_STEPS.length - 1 && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="lg:hidden flex justify-center mt-6"
              >
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        viewport={{ once: true, margin: '-100px' }}
        className="text-center mt-16"
      >
        <Button
          variant="primary"
          size="lg"
          showArrow
          onClick={() => navigate('/candidate/auth')}
        >
          Get Started for Free
        </Button>
      </motion.div>
    </Container>
  );
};

export default HowItWorksSection;
