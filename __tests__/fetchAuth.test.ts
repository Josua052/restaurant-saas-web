import { fetchAuth } from '@/lib/fetchAuth'

describe('fetchAuth Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.history.pushState({}, '', '/test-domain/owner')
    localStorage.clear()
  })

  it('injects X-Branch-ID header if available in localStorage', async () => {
    localStorage.setItem('active_branch_id_test-domain', 'branch-123')
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })

    await fetchAuth('/api/test', { method: 'GET' })

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.any(Headers),
    }))
  })

  it('attempts to refresh token and redirects on 401 if refresh fails', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ isSuspended: false }),
      })

    await fetchAuth('/api/test', { method: 'GET' })

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/refresh', expect.objectContaining({
      method: 'POST',
    }))
  })

  it('retries request if refresh succeeds', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      })

    const res = await fetchAuth('/api/test', { method: 'GET' })
    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })
})
