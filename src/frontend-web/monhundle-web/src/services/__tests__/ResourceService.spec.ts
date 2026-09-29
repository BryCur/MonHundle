import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceService } from '@/services/ResourceService';
import type IResourceApi from '@/domain/interfaces/api-contracts/IResourceApi';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

const mockedResourceApi = {
    getGameTitles: vi.fn(),
    getMonstersOptions: vi.fn(),
};

function buildService() {
    return new ResourceService(mockedResourceApi as IResourceApi);
}

describe('ResourceService — getAllGameTitles()', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => consoleErrorSpy.mockRestore());

    it('returns the titles given by the api', async () => {
        mockedResourceApi.getGameTitles.mockResolvedValueOnce(['MHW', 'MHR']);

        const titles = await buildService().getAllGameTitles();

        expect(titles).toEqual(['MHW', 'MHR']);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns an empty list and logs the error when the api fails', async () => {
        const error = new UnexpectedApiError('Could not get game titles');
        mockedResourceApi.getGameTitles.mockRejectedValueOnce(error);

        const titles = await buildService().getAllGameTitles();

        expect(titles).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
});

describe('ResourceService — getMonsterOptions()', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => consoleErrorSpy.mockRestore());

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

    it('returns an empty list and logs the error when the api fails', async () => {
        const error = new UnexpectedApiError('Could not get monster options');
        mockedResourceApi.getMonstersOptions.mockRejectedValueOnce(error);

        const options = await buildService().getMonsterOptions(['MHW']);

        expect(options).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
});
