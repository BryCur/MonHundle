import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AuthManagementService } from '@/services/AuthManagementService';
import type IUserApi from '@/domain/interfaces/api-contracts/IUserApi';

function fakeUserApi(authUser: Mock): IUserApi {
    return { authUser } as unknown as IUserApi;
}

describe('AuthManagementService', () => {
    let authUser: Mock;

    beforeEach(() => {
        AuthManagementService.reset();
        authUser = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        AuthManagementService.reset();
    });

    it('calls the user api only once across repeated authenticate() calls', async () => {
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));

        await auth.authenticate();
        await auth.authenticate();
        await auth.whenAuthenticated;

        expect(authUser).toHaveBeenCalledTimes(1);
        expect(auth.isAuthenticated).toBe(true);
    });

    it('stays unauthenticated and rejects when the user api fails', async () => {
        authUser.mockRejectedValue(new Error('nope'));
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));

        await expect(auth.authenticate()).rejects.toThrow('nope');
        expect(auth.isAuthenticated).toBe(false);
    });

    it('re-runs the authentication after reauthenticate()', async () => {
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));
        await auth.authenticate();

        await auth.reauthenticate();

        expect(authUser).toHaveBeenCalledTimes(2);
        expect(auth.isAuthenticated).toBe(true);
    });

    it('returns the same singleton instance on subsequent getInstance() calls', () => {
        const first = AuthManagementService.getInstance(fakeUserApi(authUser));
        const second = AuthManagementService.getInstance();

        expect(first).toBe(second);
    });
});
