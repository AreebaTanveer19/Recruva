import React from 'react';
import { Navbar, Footer } from '../components/common';
import Container from '../components/common/Container';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <Container section id="privacy-policy" bg="white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-6 text-sm">Last updated: May 1, 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Recruva ("Company," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains our data handling practices and your privacy rights when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-3">We collect information you provide directly, including:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Resume and professional information</li>
                <li>Account credentials and preferences</li>
                <li>Communication records and support inquiries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide and improve our recruitment services</li>
                <li>Process applications and match candidates with opportunities</li>
                <li>Send you service-related notifications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Privacy Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@recruva.com.
              </p>
            </section>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
