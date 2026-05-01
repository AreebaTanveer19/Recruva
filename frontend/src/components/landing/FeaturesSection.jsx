import React from 'react';
import Container from '../common/Container';
import SectionHeader from './SectionHeader';
import FeatureCard from './FeatureCard';
import { FEATURES } from '../../pages/landing/landingData';

const FeaturesSection = () => {
  return (
    <Container section id="features" bg="gray">
      <SectionHeader
        title="Key Features"
        subtitle="Powerful AI-driven tools to revolutionize your recruitment process"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Container>
  );
};

export default FeaturesSection;
