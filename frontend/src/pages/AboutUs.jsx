import React from 'react';
import { Navbar, Footer } from '../components/common';
import Container from '../components/common/Container';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <Container section bg="gradient-light">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Recruva</h1>
          <p className="text-xl text-gray-600 mb-8">
            Transforming recruitment through artificial intelligence and human insight.
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                At Recruva, we believe that every company deserves access to world-class talent, and every candidate deserves a fair chance. Our mission is to eliminate bias from recruitment and help organizations make smarter, data-driven hiring decisions faster than ever before.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Founded in 2024, Recruva emerged from a simple observation: traditional recruitment processes are inefficient, time-consuming, and often prone to human bias. Our team of AI researchers, HR experts, and software engineers came together to build a better solution.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, Recruva powers recruitment for hundreds of companies worldwide, from fast-growing startups to Fortune 500 enterprises. We process thousands of applications daily and maintain a 95% match accuracy rate, helping companies build diverse, high-performing teams faster than ever before.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🎯 Fairness</h3>
                  <p className="text-gray-600 text-sm">
                    We're committed to eliminating bias in hiring and creating equal opportunities for all candidates.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">⚡ Efficiency</h3>
                  <p className="text-gray-600 text-sm">
                    We believe smart automation should free humans to focus on what matters most - human connection.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🔬 Innovation</h3>
                  <p className="text-gray-600 text-sm">
                    We continuously push the boundaries of AI and machine learning to solve recruitment challenges.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🤝 Integrity</h3>
                  <p className="text-gray-600 text-sm">
                    We operate with transparency and hold ourselves to the highest ethical standards.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Recruva?</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                <li><strong>AI-Powered Matching:</strong> Advanced algorithms match candidates to roles with 95% accuracy</li>
                <li><strong>Bias-Free Screening:</strong> Objective evaluation based on skills and qualifications, not demographics</li>
                <li><strong>Time Savings:</strong> Reduce time-to-hire by up to 80% with automated workflows</li>
                <li><strong>Better Hiring Decisions:</strong> Data-driven insights help you build stronger teams</li>
                <li><strong>Candidate Experience:</strong> Transparent, respectful process that reflects well on your brand</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We're always looking for talented, passionate individuals to join Recruva. Whether you're interested in sales, engineering, product, or design, we have opportunities to make a real impact.
              </p>
              <a
                href="/candidate/auth"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Career Opportunities
              </a>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600 leading-relaxed">
                Have questions about Recruva? Want to learn more about our platform? We'd love to hear from you!
              </p>
              <a
                href="/#contact"
                className="inline-block mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Contact Us
              </a>
            </section>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default AboutUs;
