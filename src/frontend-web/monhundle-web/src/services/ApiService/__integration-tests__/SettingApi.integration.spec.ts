import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { server } from '@/mocks/vitest.setup'
import { GAME_TITLE_MHW, LOADED_USER_UUID, REQUESTING_USER_UUID, SAMPLE_GAME_TITLES, VALID_UUID } from '@/mocks/fixtures'
import { SettingsApi } from '@/services/ApiService/SettingApi'
import { clearStoredUserId, getStoredUserId } from '@/services/LocalStorageService'
import type { UserPreferencesBody } from '@/domain/generated/request-params/UserPreferencesBody'
import type { PlayerProfileResponse } from '@/domain/generated/response/objects/PlayerProfileResponse'

describe('SettingsApi.saveSettings (integration)', () => {
  it('sends a well-formed preference request', async () => {
    let capturedMethod: string | null = null
    let capturedBody: UserPreferencesBody | null = null
    server.use(
      http.post('*/user/preference', async ({ request }) => {
        capturedMethod = request.method
        capturedBody = (await request.json()) as UserPreferencesBody
        return new HttpResponse(null, { status: 200 })
      }),
    )

    await new SettingsApi().saveSettings(true, SAMPLE_GAME_TITLES)

    expect(capturedMethod).toBe('POST')
    expect(capturedBody).toEqual({
      enableTableVisualAid: true,
      gameTitles: SAMPLE_GAME_TITLES,
    } satisfies UserPreferencesBody)
  })

  it('resolves even when the backend rejects the request — the response status is never checked', async () => {
    server.use(http.post('*/user/preference', () => new HttpResponse(null, { status: 500 })))

    await expect(new SettingsApi().saveSettings(true, [])).resolves.toBeUndefined()
  })
})

describe('SettingsApi.getProfile (integration)', () => {
  it('sends a well-formed request: GET, correct player id in the URL', async () => {
    let capturedMethod: string | null = null
    let capturedUrl: string | null = null
    server.use(
      http.get('*/user/profile/:playerUid', ({ request }) => {
        capturedMethod = request.method
        capturedUrl = request.url
        return HttpResponse.json({})
      }),
    )

    await new SettingsApi().getProfile(VALID_UUID)

    expect(capturedMethod).toBe('GET')
    expect(new URL(capturedUrl!).pathname).toBe(`/user/profile/${VALID_UUID}`)
  })

  it('returns the parsed profile on success', async () => {
    const expected: PlayerProfileResponse = {
      enableTableVisualAid: false,
      gameList: [GAME_TITLE_MHW],
      currentDailyGameUuid: null,
      currentUnlimitedGameUuid: null,
    }
    server.use(http.get('*/user/profile/:playerUid', () => HttpResponse.json(expected)))

    const profile = await new SettingsApi().getProfile(VALID_UUID)

    expect(profile).toEqual(expected)
  })

  it('returns null when the response is not ok', async () => {
    server.use(http.get('*/user/profile/:playerUid', () => new HttpResponse(null, { status: 404 })))

    await expect(new SettingsApi().getProfile(VALID_UUID)).resolves.toBeNull()
  })
})

describe('SettingsApi.validateUser (integration)', () => {
  it('sends a well-formed request: GET, user id as a query parameter', async () => {
    let capturedMethod: string | null = null
    let capturedUrl: string | null = null
    server.use(
      http.get('*/user/validate', ({ request }) => {
        capturedMethod = request.method
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      }),
    )

    await new SettingsApi().validateUser(VALID_UUID)

    expect(capturedMethod).toBe('GET')
    expect(new URL(capturedUrl!).searchParams.get('user-id')).toBe(VALID_UUID)
  })

  it('returns true on a 200 response', async () => {
    server.use(http.get('*/user/validate', () => new HttpResponse(null, { status: 200 })))

    await expect(new SettingsApi().validateUser(VALID_UUID)).resolves.toBe(true)
  })

  it('returns false on any non-200 response', async () => {
    server.use(http.get('*/user/validate', () => new HttpResponse(null, { status: 400 })))

    await expect(new SettingsApi().validateUser(VALID_UUID)).resolves.toBe(false)
  })
})

describe('SettingsApi.loadUser (integration)', () => {
  beforeEach(() => {
    clearStoredUserId()
  })

  it('sends a well-formed request: GET, user id as a query parameter', async () => {
    let capturedMethod: string | null = null
    let capturedUrl: string | null = null
    server.use(
      http.get('*/user/load', ({ request }) => {
        capturedMethod = request.method
        capturedUrl = request.url
        return HttpResponse.json(VALID_UUID)
      }),
    )

    await new SettingsApi().loadUser(VALID_UUID)

    expect(capturedMethod).toBe('GET')
    expect(new URL(capturedUrl!).searchParams.get('user-id')).toBe(VALID_UUID)
  })

  it('stores the loaded id when the response body is a valid uuid', async () => {
    server.use(http.get('*/user/load', () => HttpResponse.json(LOADED_USER_UUID)))

    await new SettingsApi().loadUser(REQUESTING_USER_UUID)

    expect(getStoredUserId()).toBe(LOADED_USER_UUID)
  })

  // it is assumed that the validate user had been called before the load user is.
  it('falls back to the requested id when the response body cannot be parsed', async () => {
    server.use(http.get('*/user/load', () => new HttpResponse('not-json', { status: 200 })))

    await new SettingsApi().loadUser(VALID_UUID)

    expect(getStoredUserId()).toBe(VALID_UUID)
  })

  it('does not touch the stored id when the response is not ok', async () => {
    server.use(http.get('*/user/load', () => new HttpResponse(null, { status: 404 })))

    await new SettingsApi().loadUser(VALID_UUID)

    expect(getStoredUserId()).toBeNull()
  })
})
