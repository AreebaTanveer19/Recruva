import React from 'react';
import { Navbar, Footer } from '../components/common';
import Container from '../components/common/Container';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <Container section id="terms-of-service" bg="white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-6 text-sm">Last updated: May 1, 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using the Recruva website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-3">Permission is granted to temporarily download one copy of the materials (information or software) on Recruva's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed">
                The materials on Recruva's website are provided on an 'as is' basis. Recruva makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
              <p className="text-gray-600 leading-relaxed">
                In no event shall Recruva or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Recruva's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
              <p className="text-gray-600 leading-relaxed">
                The materials appearing on Recruva's website could include technical, typographical, or photographic errors. Recruva does not warrant that any of the materials on the website are accurate, complete, or current. Recruva may make changes to the materials contained on the website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
              <p className="text-gray-600 leading-relaxed">
                Recruva has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Recruva of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
              <p className="text-gray-600 leading-relaxed">
                Recruva may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Recruva operates, and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.
              </p>
            </section>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default TermsOfService;
