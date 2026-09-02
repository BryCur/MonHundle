import type IUserApi from '@/domain/interfaces/api-contracts/IUserApi';
import { UserApi } from '@/services/ApiService/UserApi';


export class AuthManagementService {
    private static instance: AuthManagementService | null = null;

    private readonly userApi: IUserApi;
    private authPromise: Promise<void> | null = null;
    private authenticated: boolean = false;

    // needs to be a singleton
    private constructor(userApi: IUserApi) {
        this.userApi = userApi;
    }

    /**
     * Retrieve or Create the unique instance. userApi param is optional, used only for tests
     */
    public static getInstance(userApi?: IUserApi): AuthManagementService {
        if (this.instance === null) {
            this.instance = new AuthManagementService(userApi ?? new UserApi());
        }

        return this.instance;
    }


    /**
     * sends the Auth request if necessary
     */
    public authenticate(): Promise<void> {
        if (this.authPromise === null) {
            this.authPromise = this.userApi.authUser()
                .then(() => {
                    this.authenticated = true;
                })
                .catch((err) => {
                    this.authenticated = false;
                    this.authPromise = null;
                    throw err;
                });
        }

        return this.authPromise;
    }

    /**
     * provide the promise, and trigger the authentication if necessary
     */
    public get whenAuthenticated(): Promise<void> {
        return this.authenticate();
    }

    /**
     * flag for authentication
     */
    public get isAuthenticated(): boolean {
        return this.authenticated;
    }

    /**
     * Force a new authentication
     */
    public reauthenticate(): Promise<void> {
        this.authenticated = false;
        this.authPromise = null;

        return this.authenticate();
    }
}


export const authManager = AuthManagementService.getInstance();
