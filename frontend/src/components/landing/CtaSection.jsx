import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../common/Container';
import Button from '../common/Button';

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to transform your recruitment process?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join thousands of companies already using Recruva to hire better, faster, and smarter.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/candidate/auth')}
          >
            Get Started Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => console.log('Demo clicked')}
          >
            Request a Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
