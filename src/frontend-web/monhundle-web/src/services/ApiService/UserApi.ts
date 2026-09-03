import type IUserApi from "@/domain/interfaces/api-contracts/IUserApi";

import { setStoredUserId } from "@/services/LocalStorageService";
import { apiFetch } from "./ApiBaseAccess";

export class UserApi implements IUserApi {
    public authenticated: boolean = false

    constructor() {}

    public authUser(): Promise<void> {
        return apiFetch("/user/authenticate",
            {
                method: "GET",
            }
        ).then( async (response) => {
            if (!response.ok) {
                this.authenticated = false;
                throw new Error(`Authentication failed with status ${response.status}`);
            }

            // the API returns the resolved (possibly newly created) player id; persist it so every
            // subsequent request can send it as a bearer token, since Safari/iOS drops the cookie
            const userId = await response.json() as string;
            if (userId) {
                setStoredUserId(userId);
            }

            this.authenticated = true;
        })
    }
}
