import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceService } from '@/services/ResourceService';
import type IResourceApi from '@/domain/interfaces/api-contracts/IResourceApi';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';

const mockedResourceApi = {
    getGameTitles: vi.fn(),
    getMonstersOptions: vi.fn(),
};

function buildService() {
    return new ResourceService(mockedResourceApi as IResourceApi);
}

describe('ResourceService — getAllGameTitles()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the titles given by the api', async () => {
        mockedResourceApi.getGameTitles.mockResolvedValueOnce(['MHW', 'MHR']);

        const titles = await buildService().getAllGameTitles();

        expect(titles).toEqual(['MHW', 'MHR']);
    });

    it('throws a LoadFailedError wrapping the api error when the api fails', async () => {
        const apiError = new UnexpectedApiError('Could not get game titles', 500);
        mockedResourceApi.getGameTitles.mockRejectedValueOnce(apiError);

        const request = buildService().getAllGameTitles();

        await expect(request).rejects.toBeInstanceOf(LoadFailedError);
        await expect(request).rejects.toMatchObject({
            resource: 'AllGameTitle',
            cause: apiError,
        });
    });

    it('lets any other error through untouched', async () => {
        const otherError = new TypeError('Failed to fetch');
        mockedResourceApi.getGameTitles.mockRejectedValueOnce(otherError);

        await expect(buildService().getAllGameTitles()).rejects.toBe(otherError);
    });
});

describe('ResourceService — getMonsterOptions()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('asks the api for every option (empty list) when called without titles', async () => {
        mockedResourceApi.getMonstersOptions.mockResolvedValueOnce(['rathalos', 'diablos']);

        const options = await buildService().getMonsterOptions();

        expect(mockedResourceApi.getMonstersOptions).toHaveBeenCalledWith([]);
        expect(options).toEqual(['rathalos', 'diablos']);
    });

    it('forwards the given titles to the api and returns its result', async () => {
        mockedResourceApi.getMonstersOptions.mockResolvedValueOnce(['rathalos']);

        const options = await buildService().getMonsterOptions(['MHW', 'MHR']);

        expect(mockedResourceApi.getMonstersOptions).toHaveBeenCalledWith(['MHW', 'MHR']);
        expect(options).toEqual(['rathalos']);
    });

    it('throws a LoadFailedError wrapping the api error when the api fails', async () => {
        const apiError = new UnexpectedApiError('Could not get monster options', 500);
        mockedResourceApi.getMonstersOptions.mockRejectedValueOnce(apiError);

        const request = buildService().getMonsterOptions(['MHW']);

        await expect(request).rejects.toBeInstanceOf(LoadFailedError);
        await expect(request).rejects.toMatchObject({
            resource: 'MonsterOptions',
            cause: apiError,
        });
    });

    it('lets any other error through untouched', async () => {
        const otherError = new TypeError('Failed to fetch');
        mockedResourceApi.getMonstersOptions.mockRejectedValueOnce(otherError);

        await expect(buildService().getMonsterOptions(['MHW'])).rejects.toBe(otherError);
    });
});
