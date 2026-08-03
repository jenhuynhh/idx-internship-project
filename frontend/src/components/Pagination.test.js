import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {

  test('renders pagination controls', () => {
    // currentPage 1 of 10 → page numbers 1-5 are shown, so we can assert on 1 and 5
    render(<Pagination currentPage={1} totalPages={10} onPageChange={jest.fn()} />);
    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('disables Previous button on the first page', () => {
    // On page 1, there's no previous page, so the button must be disabled
    render(<Pagination currentPage={1} totalPages={10} onPageChange={jest.fn()} />);
    expect(screen.getByText('← Previous')).toBeDisabled();
  });

  test('disables Next button on the last page', () => {
    // currentPage === totalPages means we're on the last page
    render(<Pagination currentPage={10} totalPages={10} onPageChange={jest.fn()} />);
    expect(screen.getByText('Next →')).toBeDisabled();
  });

  test('calls onPageChange with the next page when Next is clicked', () => {
    const onPageChange = jest.fn();
    // On page 2, clicking Next should request page 3
    render(<Pagination currentPage={2} totalPages={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('Next →'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('calls onPageChange with the previous page when Previous is clicked', () => {
    const onPageChange = jest.fn();
    // On page 3, clicking Previous should request page 2
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('← Previous'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('calls onPageChange with the clicked page number', () => {
    const onPageChange = jest.fn();
    // Clicking the "3" button should request page 3
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('highlights the current page with the active class', () => {
    // currentPage 3 → the "3" button should carry the "active" class
    render(<Pagination currentPage={3} totalPages={10} onPageChange={jest.fn()} />);
    expect(screen.getByText('3')).toHaveClass('active');
  });

  test('renders nothing when there is only one page', () => {
    // totalPages <= 1 → component returns null, so the container is empty
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  // --- Debug Challenge: the last page number must never appear twice ---
  test('never renders the same page number twice', () => {
    // Check every page position in a 10-page set
    for (let page = 1; page <= 10; page++) {
      const { unmount } = render(
        <Pagination currentPage={page} totalPages={10} onPageChange={jest.fn()} />
      );
      const numbers = screen.getAllByRole('button')
        .map(b => b.textContent)
        .filter(t => /^\d+$/.test(t));      // keep only numeric page buttons
      expect(new Set(numbers).size).toBe(numbers.length);  // Set drops dupes → sizes must match
      unmount();  // clean up before the next loop iteration
    }
  });

});