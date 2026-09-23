import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { server } from '@/mocks/vitest.setup'
import { UserApi } from '@/services/ApiService/UserApi'
import { clearStoredUserId, getStoredUserId, setStoredUserId } from '@/services/LocalStorageService'

const VALID_UUID = '11111111-1111-1111-1111-111111111111'

describe('UserApi.authUser (integration)', () => {
  beforeEach(() => {
    clearStoredUserId()
  })

  it('sends a well-formed request: GET, no body, no Authorization header when no id is stored', async () => {
    let capturedMethod: string | null = null
    let capturedBody: string | null = null
    let capturedAuthHeader: string | null = null
    server.use(
      http.get('*/user/authenticate', async ({ request }) => {
        capturedMethod = request.method
        capturedBody = await request.text()
        capturedAuthHeader = request.headers.get('Authorization')
        return HttpResponse.json(VALID_UUID)
      }),
    )

    await new UserApi().authUser()

    expect(capturedMethod).toBe('GET')
    expect(capturedBody).toBe('')
    expect(capturedAuthHeader).toBeNull()
  })

  it('sends the previously stored id as a Bearer token when one already exists', async () => {
    setStoredUserId('11111111-1111-1111-1111-111111111111')

    let capturedAuthHeader: string | null = null
    server.use(
      http.get('*/user/authenticate', ({ request }) => {
        capturedAuthHeader = request.headers.get('Authorization')
        return HttpResponse.json(VALID_UUID)
      }),
    )

    await new UserApi().authUser()

    expect(capturedAuthHeader).toBe('Bearer 11111111-1111-1111-1111-111111111111')
  })

  it('stores the returned id and marks itself authenticated on a valid response (default handler)', async () => {
    const api = new UserApi()

    await api.authUser()

    // "11111111-1111-1111-1111-111111111111" comes from the default handler in
    // src/mocks/handlers.ts, parsed through a real fetch Response, not a hand-built one.
    expect(getStoredUserId()).toBe(VALID_UUID)
    expect(api.authenticated).toBe(true)
  })

  it('throws and stays unauthenticated when the response is not ok', async () => {
    server.use(http.get('*/user/authenticate', () => new HttpResponse(null, { status: 500 })))

    const api = new UserApi()

    await expect(api.authUser()).rejects.toThrow(/500/)
    expect(getStoredUserId()).toBeNull()
    expect(api.authenticated).toBe(false)
  })

  it('throws and does not store anything when the response body is not a valid UUID', async () => {
    server.use(http.get('*/user/authenticate', () => HttpResponse.json('not-a-uuid')))

    const api = new UserApi()

    await expect(api.authUser()).rejects.toThrow(/valid user id/)
    expect(getStoredUserId()).toBeNull()
    expect(api.authenticated).toBe(false)
  })
})
