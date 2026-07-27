import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyFilters from './PropertyFilters';

describe('PropertyFilters component', () => {

  test('renders all six filter inputs', () => {
    render(<PropertyFilters onSearch={jest.fn()} />);
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Zip Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Beds')).toBeInTheDocument();
    expect(screen.getByLabelText('Baths')).toBeInTheDocument();
  });

  test('calls onSearch with the entered filter values when Search is clicked', () => {
    const mockOnSearch = jest.fn();
    render(<PropertyFilters onSearch={mockOnSearch} />);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Portland' } });
    fireEvent.click(screen.getByText('Search'));
    expect(mockOnSearch).toHaveBeenCalledWith({ city: 'Portland' });
  });

  test('clears the form and calls onSearch with empty filters when Clear is clicked', () => {
    const mockOnSearch = jest.fn();
    render(<PropertyFilters onSearch={mockOnSearch} />);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Portland' } });
    fireEvent.click(screen.getByText('Clear Filters'));
    expect(screen.getByLabelText('City').value).toBe('');
    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

});