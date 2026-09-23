import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { server } from '@/mocks/vitest.setup'
import { VALID_UUID } from '@/mocks/fixtures'
import { UserApi } from '@/services/ApiService/UserApi'
import { clearStoredUserId, getStoredUserId, setStoredUserId } from '@/services/LocalStorageService'

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
    setStoredUserId(VALID_UUID)

    let capturedAuthHeader: string | null = null
    server.use(
      http.get('*/user/authenticate', ({ request }) => {
        capturedAuthHeader = request.headers.get('Authorization')
        return HttpResponse.json(VALID_UUID)
      }),
    )

    await new UserApi().authUser()

    expect(capturedAuthHeader).toBe(`Bearer ${VALID_UUID}`)
  })

  it('stores the returned id and marks itself authenticated on a valid response', async () => {
    server.use(http.get('*/user/authenticate', () => HttpResponse.json(VALID_UUID)))

    const api = new UserApi()

    await api.authUser()

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
