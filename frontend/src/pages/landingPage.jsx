import React from 'react';
import {
  Navbar,
  Footer,
} from '../components/common';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  ContactSection,
  CtaSection,
} from '../components/landing';

/**
 * Landing Page Component
 * Main entry point for public-facing landing page with modular, reusable sections
 * 
 * Features:
 * - Responsive design (mobile, tablet, desktop)
 * - Smooth scrolling navigation
 * - Reusable components for maintainability
 * - Professional UI/UX with consistent theming
 * - Performance optimized with code splitting
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Benefits/Why Choose Us Section */}
      <BenefitsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Final CTA Section */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;