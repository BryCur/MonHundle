import { beforeEach, describe, expect, it } from 'vitest';
import { HttpResponse, http } from 'msw';
import { server } from '@test-utils/vitest/setup';
import {
    GAME_TITLE_MHW,
    LOADED_USER_UUID,
    REQUESTING_USER_UUID,
    SAMPLE_GAME_TITLES,
    VALID_UUID,
} from '@test-utils/vitest/fixtures';
import { SettingsApi } from '@/services/ApiService/SettingApi';
import { clearStoredUserId, getStoredUserId } from '@/services/LocalStorageService';
import type { SettingsResponse, UserSettingsBody } from '@/domain/ApiModels';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

describe('SettingsApi.saveSettings (integration)', () => {
    it('sends a well-formed preference request', async () => {
        let capturedMethod: string | null = null;
        let capturedBody: UserSettingsBody | null = null;
        server.use(
            http.post('*/user/preference', async ({ request }) => {
                capturedMethod = request.method;
                capturedBody = (await request.json()) as UserSettingsBody;
                return new HttpResponse(null, { status: 200 });
            }),
        );

        await new SettingsApi().saveSettings(true, SAMPLE_GAME_TITLES);

        expect(capturedMethod).toBe('POST');
        expect(capturedBody).toEqual({
            enableTableVisualAid: true,
            gameTitles: SAMPLE_GAME_TITLES,
        } satisfies UserSettingsBody);
    });

    it('throws an UnexpectedApiError when the backend rejects the request', async () => {
        server.use(http.post('*/user/preference', () => new HttpResponse(null, { status: 500 })));

        const request = new SettingsApi().saveSettings(true, []);

        await expect(request).rejects.toBeInstanceOf(UnexpectedApiError);
        await expect(request).rejects.toMatchObject({ httpStatus: 500 });
    });
});

describe('SettingsApi.getProfile (integration)', () => {
    it('sends a well-formed request: GET, correct player id in the URL', async () => {
        let capturedMethod: string | null = null;
        let capturedUrl: string | null = null;
        server.use(
            http.get('*/user/profile/:playerUid', ({ request }) => {
                capturedMethod = request.method;
                capturedUrl = request.url;
                return HttpResponse.json({});
            }),
        );

        await new SettingsApi().getProfile(VALID_UUID);

        expect(capturedMethod).toBe('GET');
        expect(new URL(capturedUrl!).pathname).toBe(`/user/profile/${VALID_UUID}`);
    });

    it('returns the parsed profile on success', async () => {
        const expected: SettingsResponse = {
            enableTableVisualAid: false,
            gameList: [GAME_TITLE_MHW],
            currentDailyGameUuid: null,
            currentUnlimitedGameUuid: null,
        };
        server.use(http.get('*/user/profile/:playerUid', () => HttpResponse.json(expected)));

        const profile = await new SettingsApi().getProfile(VALID_UUID);

        expect(profile).toEqual(expected);
    });

    it('returns null when the profile is not found (404)', async () => {
        server.use(
            http.get('*/user/profile/:playerUid', () => new HttpResponse(null, { status: 404 })),
        );

        await expect(new SettingsApi().getProfile(VALID_UUID)).resolves.toBeNull();
    });

    it('throws an UnexpectedApiError on any other error status', async () => {
        server.use(
            http.get('*/user/profile/:playerUid', () => new HttpResponse(null, { status: 500 })),
        );

        const request = new SettingsApi().getProfile(VALID_UUID);

        await expect(request).rejects.toBeInstanceOf(UnexpectedApiError);
        await expect(request).rejects.toMatchObject({ httpStatus: 500 });
    });
});

describe('SettingsApi.loadUser (integration)', () => {
    beforeEach(() => {
        clearStoredUserId();
    });

    it('sends a well-formed request: GET, user id as a query parameter', async () => {
        let capturedMethod: string | null = null;
        let capturedUrl: string | null = null;
        server.use(
            http.get('*/user/load', ({ request }) => {
                capturedMethod = request.method;
                capturedUrl = request.url;
                return HttpResponse.json(VALID_UUID);
            }),
        );

        await new SettingsApi().loadUser(VALID_UUID);

        expect(capturedMethod).toBe('GET');
        expect(new URL(capturedUrl!).searchParams.get('user-id')).toBe(VALID_UUID);
    });

    it('stores the loaded id when the response body is a valid uuid', async () => {
        server.use(http.get('*/user/load', () => HttpResponse.json(LOADED_USER_UUID)));

        await new SettingsApi().loadUser(REQUESTING_USER_UUID);

        expect(getStoredUserId()).toBe(LOADED_USER_UUID);
    });

    // it is assumed that the validate user had been called before the load user is.
    it('falls back to the requested id when the response body cannot be parsed', async () => {
        server.use(http.get('*/user/load', () => new HttpResponse('not-json', { status: 200 })));

        await new SettingsApi().loadUser(VALID_UUID);

        expect(getStoredUserId()).toBe(VALID_UUID);
    });

    it('throws an UnexpectedApiError and does not touch the stored id when the response is not ok', async () => {
        server.use(http.get('*/user/load', () => new HttpResponse(null, { status: 404 })));

        const request = new SettingsApi().loadUser(VALID_UUID);

        await expect(request).rejects.toBeInstanceOf(UnexpectedApiError);
        await expect(request).rejects.toMatchObject({ httpStatus: 404 });
        expect(getStoredUserId()).toBeNull();
    });
});
