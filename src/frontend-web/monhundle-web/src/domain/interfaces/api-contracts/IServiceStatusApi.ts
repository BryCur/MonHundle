export default interface IServiceStatusApi {
    isServerAvailable(): Promise<boolean>;
}
