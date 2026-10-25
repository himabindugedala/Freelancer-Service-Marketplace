import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Button } from './components/common/Button';
import { Input } from './components/common/Input';
import { RatingStars } from './components/common/RatingStars';
import { EmptyState } from './components/common/EmptyState';
import { ServiceCard } from './components/common/ServiceCard';

describe('Frontend Common Components', () => {
  it('renders Button with variants and handles text', () => {
    render(<Button variant="primary">Hire Specialist</Button>);
    expect(screen.getByRole('button', { name: /hire specialist/i })).toBeDefined();
  });

  it('renders Input with label and error message', () => {
    render(<Input label="Project Budget" error="Minimum budget is $5" />);
    expect(screen.getByText('Project Budget')).toBeDefined();
    expect(screen.getByText('Minimum budget is $5')).toBeDefined();
  });

  it('renders RatingStars with numeric score and review count', () => {
    render(<RatingStars rating={4.8} count={24} />);
    expect(screen.getByText('4.8')).toBeDefined();
    expect(screen.getByText('(24)')).toBeDefined();
  });

  it('renders EmptyState with call-to-action button', () => {
    render(
      <EmptyState
        title="No Orders Yet"
        description="Browse our marketplace and hire top talent today."
        actionText="Explore Services"
        onAction={() => {}}
      />
    );
    expect(screen.getByText('No Orders Yet')).toBeDefined();
    expect(screen.getByRole('button', { name: /explore services/i })).toBeDefined();
  });

  it('renders ServiceCard with accurate details and pricing', () => {
    const mockService = {
      _id: 'srv-123',
      title: 'Full-Stack MERN Application',
      description: 'I will build an enterprise grade full stack web app with React and Node.js',
      category: { _id: 'cat-1', name: 'Web Development', slug: 'web-dev' },
      freelancer: { _id: 'free-1', name: 'Alex Rivera', avatar: 'https://avatar.url' },
      price: 250,
      pricingType: 'fixed' as const,
      deliveryTimeDays: 5,
      ratingAvg: 4.9,
      ratingCount: 18,
      ordersCount: 32,
      coverImage: 'https://cover.url',
      skills: ['React', 'Node.js', 'MongoDB'],
    };

    render(
      <AuthProvider>
        <BrowserRouter>
          <ServiceCard service={mockService as any} />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Full-Stack MERN Application')).toBeDefined();
    expect(screen.getByText('Alex Rivera')).toBeDefined();
    expect(screen.getByText('$250')).toBeDefined();
  });
});
