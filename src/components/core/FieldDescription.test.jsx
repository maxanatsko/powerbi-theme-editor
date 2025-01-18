import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldDescription } from './FieldDescription';

describe('FieldDescription', () => {
  it('renders label correctly', () => {
    render(<FieldDescription label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('does not render tooltip button when no tooltip provided', () => {
    render(<FieldDescription label="Test Label" />);
    expect(screen.queryByLabelText('Show description')).not.toBeInTheDocument();
  });

  it('renders tooltip button when tooltip provided', () => {
    render(<FieldDescription label="Test Label" tooltip="Test Tooltip" />);
    expect(screen.getByLabelText('Show description')).toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    render(<FieldDescription label="Test Label" tooltip="Test Tooltip" />);
    const button = screen.getByLabelText('Show description');
    fireEvent.mouseOver(button);
    expect(await screen.findByText('Test Tooltip')).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    render(<FieldDescription label="Test Label" tooltip="Test Tooltip" />);
    const button = screen.getByLabelText('Show description');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(await screen.findByText('Test Tooltip')).toBeInTheDocument();
  });
});