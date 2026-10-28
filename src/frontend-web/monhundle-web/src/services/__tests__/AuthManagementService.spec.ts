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

    it('tries again on the next call after a failure', async () => {
        authUser.mockRejectedValueOnce(new Error('backend down'));
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));
        await expect(auth.authenticate()).rejects.toThrow('backend down');

        await auth.authenticate();

        expect(authUser).toHaveBeenCalledTimes(2);
        expect(auth.isAuthenticated).toBe(true);
    });

    it('also tries again through whenAuthenticated after a failure (as the router guard does)', async () => {
        authUser.mockRejectedValueOnce(new Error('backend down'));
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));
        await expect(auth.whenAuthenticated).rejects.toThrow('backend down');

        await expect(auth.whenAuthenticated).resolves.toBeUndefined();

        expect(authUser).toHaveBeenCalledTimes(2);
    });

    it('shares a pending attempt between concurrent calls', async () => {
        let resolveAuth!: () => void;
        authUser.mockReturnValue(new Promise<void>((resolve) => (resolveAuth = resolve)));
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));

        const first = auth.authenticate();
        const second = auth.whenAuthenticated;
        resolveAuth();
        await Promise.all([first, second]);

        expect(second).toBe(first);
        expect(authUser).toHaveBeenCalledTimes(1);
    });

    it('shares a pending attempt that ends up failing, then tries again', async () => {
        let rejectAuth!: (err: Error) => void;
        authUser.mockReturnValueOnce(new Promise<void>((_, reject) => (rejectAuth = reject)));
        const auth = AuthManagementService.getInstance(fakeUserApi(authUser));

        const first = auth.authenticate();
        const second = auth.authenticate();
        rejectAuth(new Error('backend down'));
        await expect(first).rejects.toThrow('backend down');
        await expect(second).rejects.toThrow('backend down');
        expect(authUser).toHaveBeenCalledTimes(1);

        await auth.authenticate();

        expect(authUser).toHaveBeenCalledTimes(2);
        expect(auth.isAuthenticated).toBe(true);
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
