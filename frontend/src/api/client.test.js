import { fetchProperties, fetchPropertyDetail, fetchOpenHouses } from './client';

describe('fetchProperties API module', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('fetches properties with default parameters', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], total: 0 }),
    });

    await fetchProperties({});
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/properties'));
  });

  test('appends filter parameters to URL query string', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], total: 0 }),
    });

    await fetchProperties({ city: 'Portland', minPrice: '300000' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('city=Portland')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('minPrice=300000')
    );
  });

  test('handles fetch errors properly', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(fetchProperties({})).rejects.toThrow('Network error');
  });

  test('throws an error when the server responds with an error status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    await expect(fetchProperties({})).rejects.toThrow('HTTP 500');
  });

  // --- fetchPropertyDetail tests ---
  test('fetchPropertyDetail returns a property on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ L_ListingID: '123', L_Address: '123 Test St' }),
    });

    const data = await fetchPropertyDetail('123');
    expect(data.L_ListingID).toBe('123');
  });

  test('fetchPropertyDetail throws "Property not found" on 404', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    });

    await expect(fetchPropertyDetail('999')).rejects.toThrow('Property not found');
  });

  // --- fetchOpenHouses tests ---
  test('fetchOpenHouses returns open house data on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ openhouses: [{ OpenHouseDate: '2026-06-16' }] }),
    });

    const data = await fetchOpenHouses('123');
    expect(data.openhouses).toHaveLength(1);
  });
});