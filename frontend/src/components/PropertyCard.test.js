import { render, screen, fireEvent } from '@testing-library/react';
import PropertyCard from './PropertyCard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

const fakeProperty = {
    L_ListingID: '123',
    L_SystemPrice: 500000,
    L_Address: '123 Test Street',
    L_City: 'Portland',
    L_State: 'OR',
    L_Keyword2: 3,
    LM_Dec_3: 2,
    LM_Int2_3: 1500,
    L_Photos: '[]',
};

describe('PropertyCard', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders property data', () => {
        render(<PropertyCard property={fakeProperty} />);
        expect(screen.getByText('$500,000')).toBeInTheDocument();
        expect(screen.getByText('123 Test Street')).toBeInTheDocument();
        expect(screen.getByText('Portland, OR')).toBeInTheDocument();
    });

    test('navigates to the detail page when clicked', () => {
        render(<PropertyCard property={fakeProperty} />);
        fireEvent.click(screen.getByText('123 Test Street'));
        expect(mockNavigate).toHaveBeenCalledWith('/property/123');
    });
});