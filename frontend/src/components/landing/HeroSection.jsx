import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { TRUST_INDICATORS, HERO_CARDS } from '../../pages/landing/landingData';

const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0Pgo8cGF0aCBkPSJNMjggNTBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTRaTTI4IDI4YzAtMi4yMDktMS43OTEtNC00LTRzLTQgMS43OTEtNCA0IDEuNzkxIDQgNCA0IDQtMS43OTEgNC00Wk0yOCA3MmMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4xIj48L3BhdGg+Cjwvc3ZnPg==')]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Content */}
          <motion.div
            className="lg:w-1/2 mb-12 lg:mb-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Next-Gen Recruitment
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                {' '}Made Simple
              </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Revolutionize your recruitment process with cutting-edge AI technology.
              Find, evaluate, and hire top talent 10x faster while reducing bias and
              improving candidate quality.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button
                variant="primary"
                size="lg"
                showArrow
                onClick={() => navigate('/candidate/auth')}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => console.log('Demo clicked')}
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 max-w-md">
              {TRUST_INDICATORS.map((indicator, idx) => (
                <motion.div
                  key={indicator.label}
                  variants={itemVariants}
                  className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="text-2xl font-bold text-blue-300">
                    {indicator.value}
                  </div>
                  <div className="text-sm text-gray-300">{indicator.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              {/* AI Brain */}
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-40 h-40 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <FaBrain className="text-white text-6xl" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-30"
                  ></motion.div>
                </div>
              </div>

              {/* Floating Cards */}
              {HERO_CARDS.map((card, index) => {
                const positions = [
                  'top-0 left-0 -rotate-6',
                  'top-1/3 right-0 rotate-3',
                  'bottom-0 left-1/4 rotate-2',
                ];
                const delays = [0, 0.2, 0.4];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: delays[index] }}
                    whileHover={{ y: -8 }}
                    className={`absolute w-56 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg transform ${positions[index]} transition-all duration-300`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{card.title}</div>
                        <div className="text-xs text-gray-500">{card.subtitle}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
