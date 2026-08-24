import { fetchAuth } from '@/lib/fetchAuth'
import Cookies from 'js-cookie'

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}))

describe('fetchAuth Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset global fetch
    global.fetch = jest.fn()
  })

  it('includes owner access token in Authorization header if not admin or staff', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('mock-owner-token')
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    await fetchAuth('/api/test', { method: 'GET' })

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer mock-owner-token',
        'Content-Type': 'application/json'
      })
    }))
  })

  it('redirects to login when response is 401 Unauthorized', async () => {
    // Mock 401 response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' })
    })

    // Mock window.location
    const originalWindow = { ...window }
    const locationMock = { href: '' }
    Object.defineProperty(window, 'location', {
      writable: true,
      value: locationMock
    })

    await fetchAuth('/api/test', { method: 'GET' })

    expect(window.location.href).toBe('/login?session_expired=true')

    // Restore window
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalWindow.location
    })
  })
})
