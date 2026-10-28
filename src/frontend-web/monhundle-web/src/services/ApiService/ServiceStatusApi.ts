import { BackendUnavailableError } from '@/domain/errors/BlockingError/BackendUnavailableError';
import type IServiceStatusApi from '@/domain/interfaces/api-contracts/IServiceStatusApi';
import { apiFetch } from '@/services/ApiService/ApiBaseAccess';

export class ServiceStatusApi implements IServiceStatusApi {
    public async isServerAvailable(): Promise<boolean> {
        try {
            const resp = await apiFetch('/service/status', { method: 'HEAD' });
            return resp.ok;
        } catch (err) {
            if (err instanceof BackendUnavailableError) {
                return false;
            }
            throw err;
        }
    }
}
